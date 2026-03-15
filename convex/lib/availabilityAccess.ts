import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireAuthUser } from "./auth";
import { parseISOToLocalTime } from "./dateTime";

export type ViewerCtx = QueryCtx | MutationCtx;

export const loadUserById = async (ctx: ViewerCtx, id: string) =>
  ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("id", id)).first();

export const resolveAvailabilityActor = async (
  ctx: ViewerCtx,
  employeeId?: string
) => {
  const authUser = await requireAuthUser(ctx);
  const viewer = await loadUserById(ctx, authUser._id);

  if (!viewer) {
    throw new ConvexError("Authenticated user record not found");
  }

  if (viewer.role === "admin") {
    if (!employeeId) {
      throw new ConvexError("Employee selection is required");
    }
    const employee = await loadUserById(ctx, employeeId);
    if (!employee || employee.role !== "employee") {
      throw new ConvexError("Invalid employee");
    }
    return { viewer, employee };
  }

  if (viewer.role !== "employee") {
    throw new ConvexError("Forbidden");
  }

  if (employeeId && employeeId !== viewer.id) {
    throw new ConvexError("Forbidden");
  }

  return { viewer, employee: viewer };
};

export const buildDefaultHours = async (ctx: ViewerCtx) => {
  const nowIso = new Date().toISOString();
  const schedule = await ctx.db
    .query("schedules")
    .withIndex("by_open", (q) => q.gte("open", nowIso))
    .first();

  if (!schedule) {
    return {
      startTime: "09:00",
      endTime: "17:00",
    };
  }

  return {
    startTime: parseISOToLocalTime(schedule.open).format("HH:mm"),
    endTime: parseISOToLocalTime(schedule.close).format("HH:mm"),
  };
};
