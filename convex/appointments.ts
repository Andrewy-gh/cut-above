import { ConvexError, v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  appointmentStatusValidator,
  serviceNameValidator,
} from "./lib/domainValidators";
import {
  assertAppointmentAccess,
  assertAvailable,
  assertRoleAllowed,
  buildAppointmentResponse,
  cancelAppointmentRecord,
  employeeInput,
  ensureEmployee,
  findScheduleForDate,
  getAppointmentByIdOrThrow,
  isCancelledAppointment,
  loadUserById,
  modifyAppointmentRecord,
  toPublicUser,
} from "./lib/appointments";
import {
  requireAppointmentAccessToken,
  throwInvalidAppointmentAccess,
} from "./lib/appointmentAccess";
import { extractDateFromISO } from "./lib/dateTime";
import { enqueueAppointmentEmail } from "./lib/emailOutbox";
import { requireAdmin, requireAuthUser } from "./lib/auth";

export const getAppointments = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee"]);

    const appointments =
      role === "client"
        ? await ctx.db
            .query("appointments")
            .withIndex("by_client", (q) => q.eq("clientId", authUser._id))
            .collect()
        : await ctx.db
            .query("appointments")
            .withIndex("by_employee", (q) => q.eq("employeeId", authUser._id))
            .collect();

    const visibleAppointments = appointments.filter(
      (appointment) => !isCancelledAppointment(appointment)
    );

    visibleAppointments.sort((a, b) => a.start.localeCompare(b.start));

    const otherIds = visibleAppointments.map((appt) =>
      role === "client" ? appt.employeeId : appt.clientId
    );
    const users = await Promise.all(otherIds.map((id) => loadUserById(ctx, id)));
    const userMap = new Map<string, Doc<"users">>();
    users.forEach((loaded) => {
      if (loaded) userMap.set(loaded.id, loaded);
    });

    return visibleAppointments.map((appointment) =>
      buildAppointmentResponse({
        appointment,
        employee: role === "client" ? userMap.get(appointment.employeeId) : null,
        client: role === "employee" ? userMap.get(appointment.clientId) : null,
      })
    );
  },
});

export const getAppointmentById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee"]);

    const appointment = await getAppointmentByIdOrThrow(ctx, args.id);
    if (isCancelledAppointment(appointment)) {
      throw new ConvexError("Appointment has been cancelled");
    }

    assertAppointmentAccess(role, authUser._id, appointment);

    const employee = await loadUserById(ctx, appointment.employeeId);
    const client = await loadUserById(ctx, appointment.clientId);

    return buildAppointmentResponse({
      appointment,
      employee,
      client: role === "employee" ? client : null,
    });
  },
});

export const getManagedAppointmentByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const accessToken = await requireAppointmentAccessToken(ctx, args.token);

    try {
      const appointment = await getAppointmentByIdOrThrow(
        ctx,
        accessToken.appointmentId
      );
      const employee = await loadUserById(ctx, appointment.employeeId);

      return buildAppointmentResponse({
        appointment,
        employee,
      });
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("Appointment not found")
      ) {
        throwInvalidAppointmentAccess();
      }
      throw error;
    }
  },
});

export const createAppointment = mutation({
  args: {
    start: v.string(),
    end: v.string(),
    service: serviceNameValidator,
    employee: employeeInput,
  },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client"]);

    const employee = await ensureEmployee(ctx, args.employee.id, authUser._id);

    const scheduleDate = extractDateFromISO(args.start);
    const schedule = await findScheduleForDate(ctx, scheduleDate);
    await assertAvailable(ctx, schedule.id, {
      start: args.start,
      end: args.end,
      employeeId: args.employee.id,
    });

    const id = crypto.randomUUID();
    await ctx.db.insert("appointments", {
      id,
      start: args.start,
      end: args.end,
      service: args.service,
      status: "scheduled",
      clientId: authUser._id,
      employeeId: args.employee.id,
      scheduleId: schedule.id,
    });

    const employeeFirstName =
      args.employee.firstName ?? toPublicUser(employee)?.firstName ?? "Staff";

    await enqueueAppointmentEmail(ctx, {
      appointmentId: id,
      start: args.start,
      end: args.end,
      service: args.service,
      employeeId: args.employee.id,
      employeeFirstName,
      receiver: user?.email ?? authUser.email,
      option: "confirmation",
    });

    return { success: true, message: "Appointment successfully created" };
  },
});

export const modifyAppointment = mutation({
  args: {
    id: v.string(),
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    service: v.optional(serviceNameValidator),
    status: v.optional(appointmentStatusValidator),
    employee: v.optional(employeeInput),
  },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee", "admin"]);

    const appointment = await getAppointmentByIdOrThrow(ctx, args.id);
    if (isCancelledAppointment(appointment)) {
      throw new ConvexError("Appointment has been cancelled");
    }

    assertAppointmentAccess(role, authUser._id, appointment, {
      allowAdmin: true,
    });

    const requestedEmployeeId = args.employee?.id;
    if (role === "employee") {
      if (requestedEmployeeId && requestedEmployeeId !== appointment.employeeId) {
        throw new ConvexError("Forbidden: cannot change employee");
      }
    }
    return modifyAppointmentRecord(ctx, appointment, {
      start: args.start,
      end: args.end,
      service: args.service,
      status: args.status,
      employee: args.employee,
      fallbackReceiver: user?.email ?? authUser.email,
    });
  },
});

export const modifyManagedAppointmentByToken = mutation({
  args: {
    token: v.string(),
    start: v.optional(v.string()),
    end: v.optional(v.string()),
    service: v.optional(serviceNameValidator),
    employee: v.optional(employeeInput),
  },
  handler: async (ctx, args) => {
    const accessToken = await requireAppointmentAccessToken(ctx, args.token);

    try {
      const appointment = await getAppointmentByIdOrThrow(
        ctx,
        accessToken.appointmentId
      );
      if (isCancelledAppointment(appointment)) {
        throw new ConvexError("Appointment has been cancelled");
      }
      return modifyAppointmentRecord(ctx, appointment, {
        start: args.start,
        end: args.end,
        service: args.service,
        employee: args.employee,
      });
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("Appointment not found")
      ) {
        throwInvalidAppointmentAccess();
      }
      throw error;
    }
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    id: v.string(),
    status: appointmentStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_appointment_id", (q) => q.eq("id", args.id))
      .first();

    if (!appointment) {
      throw new ConvexError("Appointment not found");
    }

    await ctx.db.patch(appointment._id, { status: args.status });
    return { success: true, message: "Appointment status updated" };
  },
});

export const cancelAppointment = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const user = await loadUserById(ctx, authUser._id);
    const role = user?.role ?? "client";

    assertRoleAllowed(role, ["client", "employee", "admin"]);

    const appointment = await getAppointmentByIdOrThrow(ctx, args.id);

    assertAppointmentAccess(role, authUser._id, appointment, {
      allowAdmin: true,
    });
    return cancelAppointmentRecord(ctx, appointment, user?.email ?? authUser.email);
  },
});

export const cancelManagedAppointmentByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const accessToken = await requireAppointmentAccessToken(ctx, args.token);

    try {
      const appointment = await getAppointmentByIdOrThrow(
        ctx,
        accessToken.appointmentId
      );
      return cancelAppointmentRecord(ctx, appointment);
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("Appointment not found")
      ) {
        throwInvalidAppointmentAccess();
      }
      throw error;
    }
  },
});
