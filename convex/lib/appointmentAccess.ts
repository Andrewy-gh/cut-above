import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = { db: QueryCtx["db"] };

const invalidAppointmentAccessError = () =>
  new ConvexError("Appointment access link is invalid or has expired");

const getClientUrl = () =>
  process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hashAppointmentAccessToken = async (token: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );
  return toHex(new Uint8Array(digest));
};

const createRawAppointmentAccessToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
};

export const buildAppointmentManageLink = (token: string) => {
  const path = `/manage-appointment?token=${encodeURIComponent(token)}`;
  const clientUrl = getClientUrl();
  return clientUrl ? `${clientUrl}${path}` : path;
};

export const revokeAppointmentAccessTokens = async (
  ctx: MutationCtx,
  appointmentId: string
) => {
  const now = Date.now();
  const accessTokens = await ctx.db
    .query("appointmentAccessTokens")
    .withIndex("by_appointment_id", (q) => q.eq("appointmentId", appointmentId))
    .collect();

  await Promise.all(
    accessTokens
      .filter((accessToken) => accessToken.revokedAt === undefined)
      .map((accessToken) =>
        ctx.db.patch(accessToken._id, {
          revokedAt: now,
          updatedAt: now,
        })
      )
  );
};

export const issueAppointmentManageLink = async (
  ctx: MutationCtx,
  input: {
    appointmentId: string;
    expiresAt: number;
  }
) => {
  await revokeAppointmentAccessTokens(ctx, input.appointmentId);

  const token = createRawAppointmentAccessToken();
  const tokenHash = await hashAppointmentAccessToken(token);
  const now = Date.now();

  await ctx.db.insert("appointmentAccessTokens", {
    appointmentId: input.appointmentId,
    tokenHash,
    expiresAt: input.expiresAt,
    createdAt: now,
    updatedAt: now,
  });

  return buildAppointmentManageLink(token);
};

export const requireAppointmentAccessToken = async (
  ctx: DbCtx,
  token: string
) => {
  if (!token) {
    throw invalidAppointmentAccessError();
  }

  const tokenHash = await hashAppointmentAccessToken(token);
  const accessToken = await ctx.db
    .query("appointmentAccessTokens")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();

  if (
    !accessToken ||
    accessToken.revokedAt !== undefined ||
    accessToken.expiresAt <= Date.now()
  ) {
    throw invalidAppointmentAccessError();
  }

  return accessToken;
};

export const throwInvalidAppointmentAccess = () => {
  throw invalidAppointmentAccessError();
};
