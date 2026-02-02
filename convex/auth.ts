import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";

import authConfig from "./auth.config";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

const appSiteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";
const convexSiteUrl = process.env.CONVEX_SITE_URL ?? "";

const requireEnv = (value: string, name: string) => {
  if (!value) {
    throw new Error(`Missing ${name} for Better Auth configuration.`);
  }
  return value;
};

const DEFAULT_ROLE = "client";

export const authComponent = createClient<DataModel>(components.betterAuth, {
  triggers: {
    user: {
      onCreate: async (ctx, doc) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("id", doc._id))
          .first();
        if (existing) return;
        await ctx.db.insert("users", {
          id: doc._id,
          name: doc.name,
          email: doc.email,
          role: DEFAULT_ROLE,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        });
      },
      onUpdate: async (ctx, newDoc) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("id", newDoc._id))
          .first();
        if (!existing) return;
        await ctx.db.patch(existing._id, {
          name: newDoc.name,
          email: newDoc.email,
          updatedAt: newDoc.updatedAt,
        });
      },
      onDelete: async (ctx, doc) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("id", doc._id))
          .first();
        if (!existing) return;
        await ctx.db.delete(existing._id);
      },
    },
  },
});

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const baseURL = requireEnv(convexSiteUrl, "CONVEX_SITE_URL");
  const siteUrl = requireEnv(appSiteUrl, "SITE_URL");

  return {
    baseURL,
    trustedOrigins: [siteUrl, baseURL],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ url }) => {
        console.log(`Password reset URL: ${url}`);
      },
    },
    user: {
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: true,
      },
      deleteUser: {
        enabled: true,
      },
    },
    session: {
      freshAge: 0,
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("id", authUser._id))
      .first();

    if (user) return user;

    return {
      id: authUser._id,
      name: authUser.name,
      email: authUser.email,
      role: DEFAULT_ROLE,
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt,
    };
  },
});
