import { ConvexError, v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { revokeAppointmentAccessTokens } from "./appointmentAccess";
import { checkAvailabilityISO, extractDateFromISO } from "./dateTime";
import { enqueueAppointmentEmail } from "./emailOutbox";
import {
  isSlotWithinAvailability,
  loadAvailabilityForDate,
  resolveBreakWindows,
  resolveAvailabilityWindow,
} from "./availability";
import { parseName } from "./names";

type DbCtx = { db: QueryCtx["db"] };

export const isCancelledAppointment = (
  appointment: Pick<Doc<"appointments">, "status">
) => appointment.status === "cancelled";

export const employeeInput = v.object({
  id: v.string(),
  firstName: v.optional(v.string()),
});

export const assertRoleAllowed = (role: string, roles: string[]) => {
  if (!roles.includes(role)) {
    throw new ConvexError("Forbidden: role not allowed");
  }
};

export const assertAppointmentAccess = (
  role: string,
  userId: string,
  appointment: Doc<"appointments">,
  options: { allowAdmin?: boolean } = {}
) => {
  if (options.allowAdmin && role === "admin") return;

  const isClientOwner = role === "client" && appointment.clientId === userId;
  const isEmployeeOwner = role === "employee" && appointment.employeeId === userId;
  if (isClientOwner || isEmployeeOwner) return;

  throw new ConvexError("Forbidden: not authorized to access this appointment");
};

export const toPublicUser = (user: Doc<"users"> | null) => {
  if (!user) return null;
  const parsedName = parseName(user.name);
  return {
    id: user.id,
    firstName: user.firstName ?? parsedName.firstName ?? "User",
    lastName: user.lastName ?? parsedName.lastName ?? "",
  };
};

export const loadUserById = async (ctx: DbCtx, id: string) =>
  ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("id", id)).first();

export const ensureEmployee = async (
  ctx: DbCtx,
  employeeId: string,
  clientId: string
) => {
  if (employeeId === clientId) {
    throw new ConvexError("Client and employee must be different");
  }
  const employee = await loadUserById(ctx, employeeId);
  if (!employee || employee.role !== "employee") {
    throw new ConvexError("Invalid employee");
  }
  return employee;
};

export const findScheduleForDate = async (ctx: DbCtx, date: string) => {
  const schedule = await ctx.db
    .query("schedules")
    .withIndex("by_date", (q) => q.eq("date", date))
    .first();
  if (!schedule) {
    throw new ConvexError("No schedule found for selected date");
  }
  return schedule;
};

const findScheduleById = async (ctx: DbCtx, scheduleId: string) => {
  const schedule = await ctx.db
    .query("schedules")
    .withIndex("by_schedule_id", (q) => q.eq("id", scheduleId))
    .first();

  if (!schedule) {
    throw new ConvexError("No schedule found for selected date");
  }

  return schedule;
};

export const assertAvailable = async (
  ctx: DbCtx,
  scheduleId: string,
  candidate: { start: string; end: string; employeeId: string },
  excludeId?: string
) => {
  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_schedule", (q) => q.eq("scheduleId", scheduleId))
    .collect();

  const availability = checkAvailabilityISO(
    appointments
      .filter(
        (appointment: Doc<"appointments">) =>
          appointment.id !== excludeId && !isCancelledAppointment(appointment)
      )
      .map((appointment: Doc<"appointments">) => ({
        start: appointment.start,
        end: appointment.end,
        employeeId: appointment.employeeId,
      })),
    candidate
  );

  if (!availability) {
    throw new ConvexError("Time slot conflicts with existing appointment");
  }

  const schedule = await findScheduleById(ctx, scheduleId);
  const availabilityData = await loadAvailabilityForDate(ctx, schedule.date);
  const employeeWindow = resolveAvailabilityWindow(
    schedule,
    candidate.employeeId,
    availabilityData.rulesByEmployeeId,
    availabilityData.overridesByEmployeeId
  );
  const breakWindows = resolveBreakWindows(
    schedule,
    candidate.employeeId,
    availabilityData.breaksByEmployeeId,
    availabilityData.dateBreaksByEmployeeId,
    availabilityData.dateBreakPoliciesByEmployeeId
  );

  if (!isSlotWithinAvailability(employeeWindow, candidate, breakWindows)) {
    throw new ConvexError("Employee is unavailable for selected time");
  }
};

export const getAppointmentByIdOrThrow = async (ctx: DbCtx, id: string) => {
  const appointment = await ctx.db
    .query("appointments")
    .withIndex("by_appointment_id", (q) => q.eq("id", id))
    .first();

  if (!appointment) {
    throw new ConvexError("Appointment not found");
  }

  return appointment;
};

export const buildAppointmentResponse = (input: {
  appointment: Doc<"appointments">;
  employee?: Doc<"users"> | null;
  client?: Doc<"users"> | null;
}) => {
  const base = {
    id: input.appointment.id,
    start: input.appointment.start,
    end: input.appointment.end,
    service: input.appointment.service,
    status: input.appointment.status,
  };
  return {
    ...base,
    ...(input.employee ? { employee: toPublicUser(input.employee) } : {}),
    ...(input.client ? { client: toPublicUser(input.client) } : {}),
  };
};

export const modifyAppointmentRecord = async (
  ctx: MutationCtx,
  appointment: Doc<"appointments">,
  args: {
    start?: string;
    end?: string;
    service?: string;
    status?: string;
    employee?: {
      id: string;
      firstName?: string;
    };
    fallbackReceiver?: string;
  }
) => {
  const requestedEmployeeId = args.employee?.id;
  if (requestedEmployeeId) {
    await ensureEmployee(ctx, requestedEmployeeId, appointment.clientId);
  }

  const nextStart = args.start ?? appointment.start;
  const nextEnd = args.end ?? appointment.end;
  const nextService = args.service ?? appointment.service;
  const nextStatus = args.status ?? appointment.status;
  const nextEmployeeId = requestedEmployeeId ?? appointment.employeeId;

  const nextDate = extractDateFromISO(nextStart);
  const currentDate = extractDateFromISO(appointment.start);
  let scheduleId = appointment.scheduleId;

  if (nextDate !== currentDate) {
    const schedule = await findScheduleForDate(ctx, nextDate);
    scheduleId = schedule.id;
  }

  if (args.start || args.end || args.employee || nextDate !== currentDate) {
    await assertAvailable(
      ctx,
      scheduleId,
      { start: nextStart, end: nextEnd, employeeId: nextEmployeeId },
      appointment.id
    );
  }

  await ctx.db.patch(appointment._id, {
    start: nextStart,
    end: nextEnd,
    service: nextService,
    status: nextStatus,
    employeeId: nextEmployeeId,
    scheduleId,
  });

  const employee = await loadUserById(ctx, nextEmployeeId);
  const client = await loadUserById(ctx, appointment.clientId);
  const employeeFirstName =
    args.employee?.firstName ?? toPublicUser(employee)?.firstName ?? "Staff";

  await enqueueAppointmentEmail(ctx, {
    appointmentId: appointment.id,
    start: nextStart,
    end: nextEnd,
    service: nextService,
    employeeId: nextEmployeeId,
    employeeFirstName,
    receiver: client?.email ?? args.fallbackReceiver ?? "",
    option: "modification",
  });

  return { success: true, message: "Appointment successfully updated" };
};

export const cancelAppointmentRecord = async (
  ctx: MutationCtx,
  appointment: Doc<"appointments">,
  fallbackReceiver?: string
) => {
  if (isCancelledAppointment(appointment)) {
    await revokeAppointmentAccessTokens(ctx, appointment.id);
    return { success: true, message: "Appointment already cancelled" };
  }

  const employee = await loadUserById(ctx, appointment.employeeId);
  const client = await loadUserById(ctx, appointment.clientId);

  await revokeAppointmentAccessTokens(ctx, appointment.id);
  await ctx.db.patch(appointment._id, { status: "cancelled" });

  await enqueueAppointmentEmail(ctx, {
    appointmentId: appointment.id,
    start: appointment.start,
    end: appointment.end,
    service: appointment.service,
    employeeId: appointment.employeeId,
    employeeFirstName: toPublicUser(employee)?.firstName ?? "Staff",
    receiver: client?.email ?? fallbackReceiver ?? "",
    option: "cancellation",
  });

  return { success: true, message: "Appointment successfully cancelled" };
};
