import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { ConvexError } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

dayjs.extend(utc);
dayjs.extend(timezone);

const selectedTimeZone = "America/New_York";

type DbCtx = { db: QueryCtx["db"] };
type ScheduleDoc = Doc<"schedules">;
type WeeklyRuleDoc = Doc<"employeeAvailabilityRules">;
type OverrideDoc = Doc<"employeeAvailabilityOverrides">;
type BreakDoc = Doc<"employeeAvailabilityBreaks">;
type DateBreakDoc = Doc<"employeeAvailabilityDateBreaks">;
type DateBreakPolicyDoc = Doc<"employeeAvailabilityDateBreakPolicies">;

export type AvailabilityWindow = {
  employeeId: string;
  start: string;
  end: string;
};

export type BreakWindow = AvailabilityWindow & {
  id: string;
  label?: string;
};

type RuleInput = {
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
};

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const parseTimeString = (value: string) => {
  const match = timePattern.exec(value);
  if (!match) {
    throw new ConvexError(`Invalid time value: ${value}`);
  }
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
};

const combineDateAndTime = (date: string, time: string) => {
  const { hour, minute } = parseTimeString(time);
  return dayjs
    .tz(date, selectedTimeZone)
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0);
};

const normalizeWindow = (
  schedule: ScheduleDoc,
  startTime?: string,
  endTime?: string
) => {
  if (!startTime || !endTime) {
    return {
      start: schedule.open,
      end: schedule.close,
    };
  }

  const rangeStart = combineDateAndTime(schedule.date, startTime);
  const rangeEnd = combineDateAndTime(schedule.date, endTime);
  const scheduleStart = dayjs.utc(schedule.open);
  const scheduleEnd = dayjs.utc(schedule.close);

  const start = rangeStart.isAfter(scheduleStart) ? rangeStart : scheduleStart;
  const end = rangeEnd.isBefore(scheduleEnd) ? rangeEnd : scheduleEnd;

  if (!start.isBefore(end)) {
    return null;
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

const overlaps = (
  left: { start: string; end: string },
  right: { start: string; end: string }
) => left.start < right.end && left.end > right.start;

export const validateAvailabilityInput = ({
  isWorking,
  startTime,
  endTime,
}: RuleInput) => {
  if (!isWorking) {
    return;
  }

  if (!startTime || !endTime) {
    throw new ConvexError("Working availability requires start and end times");
  }

  const start = combineDateAndTime("2026-01-01", startTime);
  const end = combineDateAndTime("2026-01-01", endTime);
  if (!start.isBefore(end)) {
    throw new ConvexError("Availability end time must be after start time");
  }
};

export const validateBreakInput = ({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}) => {
  const start = combineDateAndTime("2026-01-01", startTime);
  const end = combineDateAndTime("2026-01-01", endTime);
  if (!start.isBefore(end)) {
    throw new ConvexError("Break end time must be after start time");
  }
};

export const loadAvailabilityForDate = async (ctx: DbCtx, date: string) => {
  const weekday = dayjs.tz(date, selectedTimeZone).day();
  const [rules, overrides, breaks, dateBreaks, dateBreakPolicies] = await Promise.all([
    ctx.db
      .query("employeeAvailabilityRules")
      .withIndex("by_weekday", (q) => q.eq("weekday", weekday))
      .collect(),
    ctx.db
      .query("employeeAvailabilityOverrides")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect(),
    ctx.db
      .query("employeeAvailabilityBreaks")
      .withIndex("by_weekday", (q) => q.eq("weekday", weekday))
      .collect(),
    ctx.db
      .query("employeeAvailabilityDateBreaks")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect(),
    ctx.db
      .query("employeeAvailabilityDateBreakPolicies")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect(),
  ]);

  return {
    rulesByEmployeeId: new Map(rules.map((rule) => [rule.employeeId, rule])),
    overridesByEmployeeId: new Map(
      overrides.map((override) => [override.employeeId, override])
    ),
    breaksByEmployeeId: breaks.reduce<Map<string, BreakDoc[]>>((acc, entry) => {
      const current = acc.get(entry.employeeId) ?? [];
      current.push(entry);
      acc.set(entry.employeeId, current);
      return acc;
    }, new Map()),
    dateBreaksByEmployeeId: dateBreaks.reduce<Map<string, DateBreakDoc[]>>(
      (acc, entry) => {
        const current = acc.get(entry.employeeId) ?? [];
        current.push(entry);
        acc.set(entry.employeeId, current);
        return acc;
      },
      new Map()
    ),
    dateBreakPoliciesByEmployeeId: new Map(
      dateBreakPolicies.map((entry) => [entry.employeeId, entry])
    ),
  };
};

export const loadAvailabilityForEmployee = async (
  ctx: DbCtx,
  employeeId: string
) => {
  const [rules, overrides, breaks, dateBreaks, dateBreakPolicies] = await Promise.all([
    ctx.db
      .query("employeeAvailabilityRules")
      .withIndex("by_employee", (q) => q.eq("employeeId", employeeId))
      .collect(),
    ctx.db
      .query("employeeAvailabilityOverrides")
      .withIndex("by_employee", (q) => q.eq("employeeId", employeeId))
      .collect(),
    ctx.db
      .query("employeeAvailabilityBreaks")
      .withIndex("by_employee", (q) => q.eq("employeeId", employeeId))
      .collect(),
    ctx.db
      .query("employeeAvailabilityDateBreaks")
      .withIndex("by_employee", (q) => q.eq("employeeId", employeeId))
      .collect(),
    ctx.db
      .query("employeeAvailabilityDateBreakPolicies")
      .withIndex("by_employee", (q) => q.eq("employeeId", employeeId))
      .collect(),
  ]);

  return {
    rules,
    overrides,
    breaks,
    dateBreaks,
    dateBreakPolicies,
  };
};

export const resolveAvailabilityWindow = (
  schedule: ScheduleDoc,
  employeeId: string,
  rulesByEmployeeId: Map<string, WeeklyRuleDoc>,
  overridesByEmployeeId: Map<string, OverrideDoc>
): AvailabilityWindow | null => {
  const override = overridesByEmployeeId.get(employeeId);
  if (override) {
    if (!override.isWorking) {
      return null;
    }

    const window = normalizeWindow(
      schedule,
      override.startTime,
      override.endTime
    );
    return window ? { employeeId, ...window } : null;
  }

  const rule = rulesByEmployeeId.get(employeeId);
  if (!rule) {
    return {
      employeeId,
      start: schedule.open,
      end: schedule.close,
    };
  }

  if (!rule.isWorking) {
    return null;
  }

  const window = normalizeWindow(schedule, rule.startTime, rule.endTime);
  return window ? { employeeId, ...window } : null;
};

export const resolveBreakWindows = (
  schedule: ScheduleDoc,
  employeeId: string,
  breaksByEmployeeId: Map<string, BreakDoc[]>,
  dateBreaksByEmployeeId: Map<string, DateBreakDoc[]> = new Map(),
  dateBreakPoliciesByEmployeeId: Map<string, DateBreakPolicyDoc> = new Map()
): BreakWindow[] => {
  const policy = dateBreakPoliciesByEmployeeId.get(employeeId);
  const recurringBreaks = breaksByEmployeeId.get(employeeId) ?? [];
  const dateBreaks = dateBreaksByEmployeeId.get(employeeId) ?? [];
  const breaks =
    policy?.mode === "replace" ? dateBreaks : [...recurringBreaks, ...dateBreaks];
  const windows = breaks
    .map<BreakWindow | null>((entry) => {
      const window = normalizeWindow(schedule, entry.startTime, entry.endTime);
      if (!window) {
        return null;
      }

      return {
        id: entry.id,
        employeeId,
        start: window.start,
        end: window.end,
        label: entry.label,
      };
    })
    .filter((entry): entry is BreakWindow => entry !== null);

  return windows.sort((left, right) => left.start.localeCompare(right.start));
};

export const isSlotWithinAvailability = (
  window: AvailabilityWindow | null,
  candidate: { start: string; end: string },
  breakWindows: BreakWindow[] = []
) => {
  if (!window) return false;
  if (!(candidate.start >= window.start && candidate.end <= window.end)) {
    return false;
  }
  return !breakWindows.some((entry) => overlaps(entry, candidate));
};
