import { ConvexError } from "convex/values";
import type { GenericCtx } from "@convex-dev/better-auth";

import type { DataModel } from "../_generated/dataModel";
import { authComponent } from "../auth";

const notAuthenticatedError = () => new ConvexError("Not authenticated");
const notAuthorizedError = () => new ConvexError("Forbidden");

export const requireAuthUser = async (ctx: GenericCtx<DataModel>) => {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    throw notAuthenticatedError();
  }
  return authUser;
};

export const requireAdmin = async (ctx: GenericCtx<DataModel>) => {
  const authUser = await requireAuthUser(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_id", (q) => q.eq("id", authUser._id))
    .first();

  if (!user || user.role !== "admin") {
    throw notAuthorizedError();
  }

  return { authUser, user };
};
