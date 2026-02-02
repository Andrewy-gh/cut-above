import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { checkAvailabilityISO, extractDateFromISO } from "./lib/dateTime";
import { enqueueAppointmentEmail } from "./lib/emailOutbox";
import { requireAdmin, requireAuthUser } from "./lib/auth";
import { parseName } from "./lib/names";

const assertRoleAllowed = (role: string, roles: string[]) => {
  if (!roles.includes(role)) {
    throw new ConvexError("Forbidden: role not allowed");
  }
};

const assertAppointmentAccess = (
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

const toPublicUser = (user: Doc<"users"> | null) => {
  if (!user) return null;
  const parsedName = parseName(user.name);
  return {
    id: user.id,
    firstName: user.firstName ?? parsedName.firstName ?? "User",
    lastName: user.lastName ?? parsedName.lastName ?? "",
  };
};

type DbCtx = { db: QueryCtx["db"] };

const loadUserById = async (ctx: DbCtx, id: string) =>
  ctx.db.query("users").withIndex("by_id", (q) => q.eq("id", id)).first();

const ensureEmployee = async (
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

const findScheduleForDate = async (ctx: DbCtx, date: string) => {
  const schedule = await ctx.db
    .query("schedules")
    .withIndex("by_date", (q) => q.eq("date", date))
    .first();
  if (!schedule) {
    throw new ConvexError("No schedule found for selected date");
  }
  return schedule;
};

const assertAvailable = async (
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
      .filter((appt: Doc<"appointments">) => appt.id !== excludeId)
      .map((appt: Doc<"appointments">) => ({
        start: appt.start,
        end: appt.end,
        employeeId: appt.employeeId,
      })),
    candidate
  );

  if (!availability) {
    throw new ConvexError("Time slot conflicts with existing appointment");
  }
};

const buildAppointmentResponse = (input: {
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

const employeeInput = v.object({
  id: v.string(),
  firstName: v.optional(v.string()),
});

export const getAppointments = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee"]);

    const appointments =
      role === "client"
        ? await ctx.db
            .query("appointments")
            .withIndex("by_client", (q) => q.eq("clientId", authUser._id))
            .collect()
        : await ctx.db
            .query("appointments")
            .withIndex("by_employee", (q) => q.eq("employeeId", authUser._id))
            .collect();

    appointments.sort((a, b) => a.start.localeCompare(b.start));

    const otherIds = appointments.map((appt) =>
      role === "client" ? appt.employeeId : appt.clientId
    );
    const users = await Promise.all(otherIds.map((id) => loadUserById(ctx, id)));
    const userMap = new Map<string, Doc<"users">>();
    users.forEach((loaded) => {
      if (loaded) userMap.set(loaded.id, loaded);
    });

    return appointments.map((appointment) =>
      buildAppointmentResponse({
        appointment,
        employee: role === "client" ? userMap.get(appointment.employeeId) : null,
        client: role === "employee" ? userMap.get(appointment.clientId) : null,
      })
    );
  },
});

export const getAppointmentById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee"]);

    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();

    if (!appointment) {
      throw new ConvexError("Appointment not found");
    }

    assertAppointmentAccess(role, authUser._id, appointment);

    const employee = await loadUserById(ctx, appointment.employeeId);
    const client = await loadUserById(ctx, appointment.clientId);

    return buildAppointmentResponse({
      appointment,
      employee,
      client: role === "employee" ? client : null,
    });
  },
});

export const createAppointment = mutation({
  args: {
    start: v.string(),
    end: v.string(),
    service: v.string(),
    employee: employeeInput,
  },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client"]);

    const employee = await ensureEmployee(
      ctx,
      args.employee.id,
      authUser._id
    );

    const scheduleDate = extractDateFromISO(args.start);
    const schedule = await findScheduleForDate(ctx, scheduleDate);
    await assertAvailable(ctx, schedule.id, {
      start: args.start,
      end: args.end,
      employeeId: args.employee.id,
    });

    const id = crypto.randomUUID();
    await ctx.db.insert("appointments", {
      id,
      start: args.start,
      end: args.end,
      service: args.service,
      status: "scheduled",
      clientId: authUser._id,
      employeeId: args.employee.id,
      scheduleId: schedule.id,
    });

    const employeeFirstName =
      args.employee.firstName ?? toPublicUser(employee)?.firstName ?? "Staff";

    await enqueueAppointmentEmail(ctx, {
      appointmentId: id,
      start: args.start,
      end: args.end,
      service: args.service,
      employeeId: args.employee.id,
      employeeFirstName,
      receiver: user?.email ?? authUser.email,
      option: "confirmation",
    });

    return { success: true, message: "Appointment successfully created" };
  },
});

export const modifyAppointment = mutation({
  args: {
    id: v.string(),
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    service: v.optional(v.string()),
    status: v.optional(v.string()),
    employee: v.optional(employeeInput),
  },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee", "admin"]);

    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();

    if (!appointment) {
      throw new ConvexError("Appointment not found");
    }

    assertAppointmentAccess(role, authUser._id, appointment, {
      allowAdmin: true,
    });

    const requestedEmployeeId = args.employee?.id;
    if (role === "employee") {
      if (requestedEmployeeId && requestedEmployeeId !== appointment.employeeId) {
        throw new ConvexError("Forbidden: cannot change employee");
      }
    } else if (requestedEmployeeId) {
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

    if (
      args.start ||
      args.end ||
      args.employee ||
      nextDate !== currentDate
    ) {
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
      receiver: client?.email ?? user?.email ?? authUser.email,
      option: "modification",
    });

    return { success: true, message: "Appointment successfully updated" };
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();

    if (!appointment) {
      throw new ConvexError("Appointment not found");
    }

    await ctx.db.patch(appointment._id, { status: args.status });
    return { success: true, message: "Appointment status updated" };
  },
});

export const cancelAppointment = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee", "admin"]);

    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();

    if (!appointment) {
      throw new ConvexError("Appointment not found");
    }

    assertAppointmentAccess(role, authUser._id, appointment, {
      allowAdmin: true,
    });

    const employee = await loadUserById(ctx, appointment.employeeId);
    const client = await loadUserById(ctx, appointment.clientId);

    await ctx.db.delete(appointment._id);

    await enqueueAppointmentEmail(ctx, {
      appointmentId: appointment.id,
      start: appointment.start,
      end: appointment.end,
      service: appointment.service,
      employeeId: appointment.employeeId,
      employeeFirstName: toPublicUser(employee)?.firstName ?? "Staff",
      receiver: client?.email ?? user?.email ?? authUser.email,
      option: "cancellation",
    });

    return { success: true, message: "Appointment successfully cancelled" };
  },
});
