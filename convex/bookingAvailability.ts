import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import {
  loadAvailabilityForDate,
  resolveAvailabilityWindow,
  resolveBreakWindows,
} from "./lib/availability";
import { buildBookingAvailabilitySlots } from "./lib/bookingAvailability";

type DbCtx = { db: QueryCtx["db"] };

const getScheduleByDate = async (ctx: DbCtx, date: string) =>
  ctx.db
    .query("schedules")
    .withIndex("by_date", (q) => q.eq("date", date))
    .first();

const getEmployeeById = async (ctx: DbCtx, id: string) =>
  ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("id", id)).first();

const getEmployeesForAvailability = async (
  ctx: DbCtx,
  employeeId?: string
) => {
  if (employeeId) {
    const employee = await getEmployeeById(ctx, employeeId);
    if (!employee || employee.role !== "employee") {
      throw new ConvexError("Invalid employee");
    }
    return [employee];
  }

  return ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "employee"))
    .collect();
};

const getAppointmentsForAvailability = async (
  ctx: DbCtx,
  scheduleId: string,
  employeeId?: string
) => {
  const appointments = employeeId
    ? await ctx.db
        .query("appointments")
        .withIndex("by_schedule_employee", (q) =>
          q.eq("scheduleId", scheduleId).eq("employeeId", employeeId)
        )
        .collect()
    : await ctx.db
        .query("appointments")
        .withIndex("by_schedule", (q) => q.eq("scheduleId", scheduleId))
        .collect();

  appointments.sort((left, right) => left.start.localeCompare(right.start));
  return appointments;
};

const toEmployeeAvailability = (
  schedule: Doc<"schedules">,
  employees: Doc<"users">[],
  availabilityData: Awaited<ReturnType<typeof loadAvailabilityForDate>>
) =>
  employees
    .map((employee) =>
      resolveAvailabilityWindow(
        schedule,
        employee.id,
        availabilityData.rulesByEmployeeId,
        availabilityData.overridesByEmployeeId
      )
    )
    .filter((window): window is NonNullable<typeof window> => window !== null);

const toEmployeeBreaks = (
  schedule: Doc<"schedules">,
  employees: Doc<"users">[],
  availabilityData: Awaited<ReturnType<typeof loadAvailabilityForDate>>
) =>
  employees.flatMap((employee) =>
    resolveBreakWindows(
      schedule,
      employee.id,
      availabilityData.breaksByEmployeeId,
      availabilityData.dateBreaksByEmployeeId,
      availabilityData.dateBreakPoliciesByEmployeeId
    )
  );

export const getPublicBookingAvailability = query({
  args: {
    date: v.string(),
    serviceDuration: v.number(),
    employeeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.serviceDuration <= 0) {
      throw new ConvexError("Service duration must be positive");
    }

    const schedule = await getScheduleByDate(ctx, args.date);
    if (!schedule) {
      return {
        schedule: null,
        slots: [],
      };
    }

    const [employees, appointments, availabilityData] = await Promise.all([
      getEmployeesForAvailability(ctx, args.employeeId),
      getAppointmentsForAvailability(ctx, schedule.id, args.employeeId),
      loadAvailabilityForDate(ctx, schedule.date),
    ]);

    const employeeAvailability = toEmployeeAvailability(
      schedule,
      employees,
      availabilityData
    );
    const employeeBreaks = toEmployeeBreaks(schedule, employees, availabilityData);
    const slots = buildBookingAvailabilitySlots({
      schedule,
      durationMinutes: args.serviceDuration,
      employeeIds: employees.map((employee) => employee.id),
      selectedEmployeeId: args.employeeId,
      employeeAvailability,
      employeeBreaks,
      appointments,
    });

    return {
      schedule: {
        id: schedule.id,
        date: schedule.date,
        open: schedule.open,
        close: schedule.close,
      },
      slots,
    };
  },
});
