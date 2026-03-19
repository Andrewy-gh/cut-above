import { ConvexError, v } from "convex/values";
import dayjs from "dayjs";

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import {
  loadAvailabilityForDate,
  loadAvailabilityForEmployee,
  resolveBreakWindows,
  resolveAvailabilityWindow,
  validateAvailabilityInput,
  validateBreakInput,
} from "./lib/availability";
import {
  buildDefaultHours,
  resolveAvailabilityActor,
} from "./lib/availabilityAccess";
import { buildAvailabilitySummaryForDate } from "./lib/availabilitySummary";

const weekdayValidator = v.union(
  v.literal(0),
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
  v.literal(5),
  v.literal(6)
);

const weeklyEntryValidator = v.object({
  weekday: weekdayValidator,
  isWorking: v.boolean(),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
});

const overrideValidator = v.object({
  date: v.string(),
  isWorking: v.boolean(),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  reason: v.optional(v.string()),
});

const breakValidator = v.object({
  id: v.optional(v.string()),
  weekday: weekdayValidator,
  startTime: v.string(),
  endTime: v.string(),
  label: v.optional(v.string()),
});

const dateBreakValidator = v.object({
  id: v.optional(v.string()),
  date: v.string(),
  startTime: v.string(),
  endTime: v.string(),
  label: v.optional(v.string()),
});

const dateBreakModeValidator = v.union(v.literal("add"), v.literal("replace"));

export const getAvailability = query({
  args: {
    employeeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    const [{ rules, overrides, breaks, dateBreaks, dateBreakPolicies }, defaultHours] =
      await Promise.all([
      loadAvailabilityForEmployee(ctx, employee.id),
      buildDefaultHours(ctx),
      ]);

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName ?? "Employee",
        lastName: employee.lastName ?? "",
      },
      defaultHours,
      weekly: rules
        .sort((a, b) => a.weekday - b.weekday)
        .map((rule) => ({
          weekday: rule.weekday,
          isWorking: rule.isWorking,
          startTime: rule.startTime,
          endTime: rule.endTime,
        })),
      overrides: overrides
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((override) => ({
          id: override.id,
          date: override.date,
          isWorking: override.isWorking,
          startTime: override.startTime,
          endTime: override.endTime,
          reason: override.reason,
        })),
      breaks: breaks
        .sort((a, b) =>
          a.weekday === b.weekday
            ? a.startTime.localeCompare(b.startTime)
            : a.weekday - b.weekday
        )
        .map((entry) => ({
          id: entry.id,
          weekday: entry.weekday,
          startTime: entry.startTime,
          endTime: entry.endTime,
          label: entry.label,
        })),
      dateBreaks: dateBreaks
        .sort((a, b) =>
          a.date === b.date
            ? a.startTime.localeCompare(b.startTime)
            : a.date.localeCompare(b.date)
        )
        .map((entry) => ({
          id: entry.id,
          date: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
          label: entry.label,
        })),
      dateBreakPolicies: dateBreakPolicies
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((entry) => ({
          date: entry.date,
          mode: entry.mode === "replace" ? "replace" : "add",
        })),
    };
  },
});

export const getAvailabilitySummaryByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return buildAvailabilitySummaryForDate(ctx, args.date);
  },
});

export const getAvailabilitySummaryRange = query({
  args: {
    startDate: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.days <= 0 || args.days > 14) {
      throw new ConvexError("days must be between 1 and 14");
    }

    const dates = Array.from({ length: args.days }, (_, offset) =>
      dayjs(args.startDate).add(offset, "day").format("YYYY-MM-DD")
    );
    const summaries = await Promise.all(
      dates.map((date) => buildAvailabilitySummaryForDate(ctx, date))
    );

    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      days: summaries,
    };
  },
});

export const saveWeeklyAvailability = mutation({
  args: {
    employeeId: v.optional(v.string()),
    weekly: v.array(weeklyEntryValidator),
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);

    if (args.weekly.length !== 7) {
      throw new ConvexError("Weekly availability must include all 7 weekdays");
    }

    const weekdaySet = new Set<number>();
    for (const entry of args.weekly) {
      if (weekdaySet.has(entry.weekday)) {
        throw new ConvexError("Duplicate weekday in availability payload");
      }
      weekdaySet.add(entry.weekday);
      validateAvailabilityInput(entry);
    }

    const existing = await ctx.db
      .query("employeeAvailabilityRules")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee.id))
      .collect();
    const byWeekday = new Map(existing.map((row) => [row.weekday, row]));
    const now = Date.now();

    await Promise.all(
      args.weekly.map(async (entry) => {
        const current = byWeekday.get(entry.weekday);
        const nextDocument = {
          id: current?.id ?? crypto.randomUUID(),
          employeeId: employee.id,
          weekday: entry.weekday,
          isWorking: entry.isWorking,
          ...(entry.isWorking ? { startTime: entry.startTime, endTime: entry.endTime } : {}),
          updatedAt: now,
        };

        if (current) {
          await ctx.db.replace(current._id, nextDocument);
          return;
        }

        await ctx.db.insert("employeeAvailabilityRules", nextDocument);
      })
    );

    return { success: true };
  },
});

export const upsertAvailabilityBreak = mutation({
  args: {
    employeeId: v.optional(v.string()),
    break: breakValidator,
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    validateBreakInput(args.break);

    const existing = args.break.id
      ? await ctx.db
          .query("employeeAvailabilityBreaks")
          .withIndex("by_availability_break_id", (q) => q.eq("id", args.break.id!))
          .first()
      : null;

    if (existing && existing.employeeId !== employee.id) {
      throw new ConvexError("Forbidden");
    }

    const nextDocument = {
      id: existing?.id ?? crypto.randomUUID(),
      employeeId: employee.id,
      weekday: args.break.weekday,
      startTime: args.break.startTime,
      endTime: args.break.endTime,
      ...(args.break.label?.trim() ? { label: args.break.label.trim() } : {}),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.replace(existing._id, nextDocument);
    } else {
      await ctx.db.insert("employeeAvailabilityBreaks", nextDocument);
    }

    return { success: true };
  },
});

export const deleteAvailabilityBreak = mutation({
  args: {
    employeeId: v.optional(v.string()),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    const existing = await ctx.db
      .query("employeeAvailabilityBreaks")
      .withIndex("by_availability_break_id", (q) => q.eq("id", args.id))
      .first();

    if (!existing) {
      return { success: true };
    }

    if (existing.employeeId !== employee.id) {
      throw new ConvexError("Forbidden");
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const upsertAvailabilityDateBreak = mutation({
  args: {
    employeeId: v.optional(v.string()),
    dateBreak: dateBreakValidator,
    mode: v.optional(dateBreakModeValidator),
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    validateBreakInput(args.dateBreak);

    const existing = args.dateBreak.id
      ? await ctx.db
          .query("employeeAvailabilityDateBreaks")
          .withIndex("by_availability_date_break_id", (q) =>
            q.eq("id", args.dateBreak.id!)
          )
          .first()
      : null;

    if (existing && existing.employeeId !== employee.id) {
      throw new ConvexError("Forbidden");
    }

    const nextDocument = {
      id: existing?.id ?? crypto.randomUUID(),
      employeeId: employee.id,
      date: args.dateBreak.date,
      startTime: args.dateBreak.startTime,
      endTime: args.dateBreak.endTime,
      ...(args.dateBreak.label?.trim()
        ? { label: args.dateBreak.label.trim() }
        : {}),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.replace(existing._id, nextDocument);
    } else {
      await ctx.db.insert("employeeAvailabilityDateBreaks", nextDocument);
    }

    const existingPolicy = await ctx.db
      .query("employeeAvailabilityDateBreakPolicies")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employee.id).eq("date", args.dateBreak.date)
      )
      .first();
    const nextMode = args.mode ?? "add";
    const nextPolicy = {
      id: existingPolicy?.id ?? crypto.randomUUID(),
      employeeId: employee.id,
      date: args.dateBreak.date,
      mode: nextMode,
      updatedAt: Date.now(),
    };

    if (existingPolicy) {
      await ctx.db.replace(existingPolicy._id, nextPolicy);
    } else {
      await ctx.db.insert("employeeAvailabilityDateBreakPolicies", nextPolicy);
    }

    return { success: true };
  },
});

export const deleteAvailabilityDateBreak = mutation({
  args: {
    employeeId: v.optional(v.string()),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    const existing = await ctx.db
      .query("employeeAvailabilityDateBreaks")
      .withIndex("by_availability_date_break_id", (q) => q.eq("id", args.id))
      .first();

    if (!existing) {
      return { success: true };
    }

    if (existing.employeeId !== employee.id) {
      throw new ConvexError("Forbidden");
    }

    const deletedDate = existing.date;
    await ctx.db.delete(existing._id);

    const remainingBreaks = await ctx.db
      .query("employeeAvailabilityDateBreaks")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employee.id).eq("date", deletedDate)
      )
      .collect();
    if (remainingBreaks.length === 0) {
      const policy = await ctx.db
        .query("employeeAvailabilityDateBreakPolicies")
        .withIndex("by_employee_date", (q) =>
          q.eq("employeeId", employee.id).eq("date", deletedDate)
        )
        .first();
      if (policy) {
        await ctx.db.delete(policy._id);
      }
    }
    return { success: true };
  },
});

export const upsertAvailabilityOverride = mutation({
  args: {
    employeeId: v.optional(v.string()),
    override: overrideValidator,
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    validateAvailabilityInput(args.override);

    const existing = await ctx.db
      .query("employeeAvailabilityOverrides")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employee.id).eq("date", args.override.date)
      )
      .first();

    const nextDocument = {
      id: existing?.id ?? crypto.randomUUID(),
      employeeId: employee.id,
      date: args.override.date,
      isWorking: args.override.isWorking,
      ...(args.override.isWorking
        ? {
            startTime: args.override.startTime,
            endTime: args.override.endTime,
          }
        : {}),
      ...(args.override.reason?.trim()
        ? { reason: args.override.reason.trim() }
        : {}),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.replace(existing._id, nextDocument);
    } else {
      await ctx.db.insert("employeeAvailabilityOverrides", nextDocument);
    }

    return { success: true };
  },
});

export const deleteAvailabilityOverride = mutation({
  args: {
    employeeId: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { employee } = await resolveAvailabilityActor(ctx, args.employeeId);
    const existing = await ctx.db
      .query("employeeAvailabilityOverrides")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employee.id).eq("date", args.date)
      )
      .first();

    if (!existing) {
      return { success: true };
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});
