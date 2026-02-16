import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import {
  createClient,
  type AuthFunctions,
  type GenericCtx,
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";

import authConfig from "./auth.config";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { parseName } from "./lib/names";

const appSiteUrl = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";
const convexSiteUrl = process.env.CONVEX_SITE_URL ?? "";

const isLocalDeployment = () =>
  (process.env.CONVEX_DEPLOYMENT ?? "").toLowerCase().startsWith("local:");

const requireEnv = (value: string, name: string) => {
  if (!value) {
    throw new Error(`Missing ${name} for Better Auth configuration.`);
  }
  return value;
};

const resolveAuthSecret = () => {
  const configured =
    process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "";

  if (configured) return configured;

  // Better Auth rejects its DEFAULT_SECRET outside of tests; provide a stable
  // local dev secret so local auth routes work out of the box.
  if (isLocalDeployment()) {
    return "cut-above-local-dev-secret-please-change-me-32chars";
  }

  throw new Error("Missing BETTER_AUTH_SECRET for Better Auth configuration.");
};

const DEFAULT_ROLE = "client";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, doc) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("id", doc._id))
          .first();
        if (existing) return;
        const parsedName = parseName(doc.name);
        const createdAt = doc.createdAt ?? Date.now();
        await ctx.db.insert("users", {
          id: doc._id,
          name: parsedName.name,
          firstName: parsedName.firstName,
          lastName: parsedName.lastName,
          email: doc.email,
          role: DEFAULT_ROLE,
          createdAt,
          updatedAt: doc.updatedAt ?? createdAt,
        });
      },
      onUpdate: async (ctx, newDoc) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("id", newDoc._id))
          .first();
        if (!existing) return;
        const parsedName = parseName(newDoc.name);
        await ctx.db.patch(existing._id, {
          email: newDoc.email,
          name: parsedName.name ?? existing.name,
          firstName: parsedName.firstName ?? existing.firstName,
          lastName: parsedName.lastName ?? existing.lastName,
          updatedAt: newDoc.updatedAt ?? Date.now(),
        });
      },
      onDelete: async (ctx, doc) => {
        const existing = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("id", doc._id))
          .first();
        if (!existing) return;
        await ctx.db.delete(existing._id);
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const baseURL = requireEnv(convexSiteUrl, "CONVEX_SITE_URL");
  const siteUrl = requireEnv(appSiteUrl, "SITE_URL");
  const secret = resolveAuthSecret();

  return {
    baseURL,
    secret,
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
      .withIndex("by_user_id", (q) => q.eq("id", authUser._id))
      .first();

    if (user) return user;
    const parsedName = parseName(authUser.name);

    return {
      id: authUser._id,
      name: parsedName.name,
      firstName: parsedName.firstName,
      lastName: parsedName.lastName,
      email: authUser.email,
      role: DEFAULT_ROLE,
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt,
    };
  },
});
