import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { components } from "./_generated/api";

const resolveId = (doc: unknown) => {
  if (!doc || typeof doc !== "object") return null;
  const record = doc as { id?: string; _id?: string };
  return record.id ?? record._id ?? null;
};

export const ensureAuthUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });

    const existingId = resolveId(existing);
    if (existingId) {
      return { id: existingId };
    }

    const now = Date.now();
    const createdUser = await ctx.runMutation(
      components.betterAuth.adapter.create,
      {
        input: {
          model: "user",
          data: {
            name: args.name,
            email,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
          },
        },
      }
    );

    const authUserId = resolveId(createdUser);
    if (!authUserId) {
      throw new Error("Seed failed to create auth user.");
    }

    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "account",
        data: {
          accountId: authUserId,
          providerId: "credential",
          userId: authUserId,
          password: args.passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      },
    });

    return { id: authUserId };
  },
});

export const ensureAppUser = mutation({
  args: {
    authId: v.string(),
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      if (existing.id !== args.authId) {
        await ctx.db.patch(existing._id, {
          id: args.authId,
          updatedAt: Date.now(),
        });
      }
      return { id: args.authId };
    }

    const now = Date.now();
    await ctx.db.insert("users", {
      id: args.authId,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      email,
      role: args.role,
      createdAt: now,
      updatedAt: now,
    });

    return { id: args.authId };
  },
});

export const ensureSchedule = mutation({
  args: {
    date: v.string(),
    open: v.string(),
    close: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("schedules")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      return { id: existing.id };
    }

    const id = `schedule-${args.date}`;
    await ctx.db.insert("schedules", {
      id,
      date: args.date,
      open: args.open,
      close: args.close,
    });

    return { id };
  },
});

export const ensureAppointment = mutation({
  args: {
    id: v.string(),
    scheduleId: v.string(),
    start: v.string(),
    end: v.string(),
    service: v.string(),
    status: v.string(),
    clientId: v.string(),
    employeeId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_appointment_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      return { id: existing.id, inserted: false };
    }

    await ctx.db.insert("appointments", {
      id: args.id,
      status: args.status,
      service: args.service,
      start: args.start,
      end: args.end,
      clientId: args.clientId,
      employeeId: args.employeeId,
      scheduleId: args.scheduleId,
    });

    return { id: args.id, inserted: true };
  },
});
