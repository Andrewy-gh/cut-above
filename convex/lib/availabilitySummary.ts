import type { QueryCtx } from "../_generated/server";
import { loadAvailabilityForDate, resolveAvailabilityWindow, resolveBreakWindows } from "./availability";

type DbCtx = { db: QueryCtx["db"] };

export const buildAvailabilitySummaryForDate = async (
  ctx: DbCtx,
  date: string
) => {
  const schedule = await ctx.db
    .query("schedules")
    .withIndex("by_date", (q) => q.eq("date", date))
    .first();

  if (!schedule) {
    return {
      date,
      schedule: null,
      employees: [],
    };
  }

  const [employees, appointments, availabilityData] = await Promise.all([
    ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "employee")).collect(),
    ctx.db
      .query("appointments")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", schedule.id))
      .collect(),
    loadAvailabilityForDate(ctx, date),
  ]);

  return {
    date,
    schedule: {
      id: schedule.id,
      open: schedule.open,
      close: schedule.close,
    },
    employees: employees
      .map((employee) => {
        const availabilityWindow = resolveAvailabilityWindow(
          schedule,
          employee.id,
          availabilityData.rulesByEmployeeId,
          availabilityData.overridesByEmployeeId
        );
        const breaks = resolveBreakWindows(
          schedule,
          employee.id,
          availabilityData.breaksByEmployeeId,
          availabilityData.dateBreaksByEmployeeId,
          availabilityData.dateBreakPoliciesByEmployeeId
        );
        const breakMode =
          availabilityData.dateBreakPoliciesByEmployeeId.get(employee.id)?.mode ===
          "replace"
            ? "replace"
            : "add";

        return {
          id: employee.id,
          firstName: employee.firstName ?? "Employee",
          lastName: employee.lastName ?? "",
          availabilityWindow,
          breaks,
          breakMode,
          appointmentCount: appointments.filter(
            (appointment) => appointment.employeeId === employee.id
          ).length,
        };
      })
      .sort((left, right) =>
        `${left.firstName} ${left.lastName}`.localeCompare(
          `${right.firstName} ${right.lastName}`
        )
      ),
  };
};
