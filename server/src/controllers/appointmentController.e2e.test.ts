import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { sequelize } from "../utils/db.js";
import bcrypt from "bcrypt";
import { User, Schedule, Appointment } from "../models/index.js";

describe("Appointment Booking - E2E Flow", () => {
  const testPassword = "Password123!";
  const testEmail = "client-e2e@test.com";
  let employeeId: string;
  const employeeName = "Sarah";
  let appointmentId: string;
  const loginAsClient = () =>
    request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword })
      .expect(200);

  const getSessionCookie = (loginRes: { headers: Record<string, string | string[] | undefined> }) => {
    const cookies = loginRes.headers["set-cookie"];
    const cookieList = Array.isArray(cookies)
      ? cookies
      : cookies
        ? [cookies]
        : undefined;
    expect(cookieList).toBeDefined();
    return cookieList![0];
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Create employee
    const employee = await User.create({
      firstName: employeeName,
      lastName: "Johnson",
      email: "employee-e2e@test.com",
      passwordHash,
      role: "employee",
    });
    employeeId = employee.id;

    // Create schedule
    await Schedule.create({
      open: new Date("2024-01-22T14:00:00.000Z"),
      close: new Date("2024-01-22T22:00:00.000Z"),
    });

    // Create client account
    await User.create({
      firstName: "Mike",
      lastName: "Smith",
      email: testEmail,
      passwordHash,
      role: "client",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Appointment.destroy({ where: {} });
  });

  describe("Complete booking flow", () => {
    it("registers new client, fetches schedules/employees, books appointment, verifies", async () => {
      // Step 1: Login as client
      const loginRes = await loginAsClient();

      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.user.firstName).toBe("Mike");

      const sessionCookie = getSessionCookie(loginRes);

      // Step 2: Fetch available schedules
      const schedulesRes = await request(app)
        .get("/api/schedules")
        .expect(200);

      expect(Array.isArray(schedulesRes.body)).toBe(true);
      expect(schedulesRes.body.length).toBeGreaterThan(0);

      const schedule = schedulesRes.body[0];
      expect(schedule.open).toBeDefined();
      expect(schedule.close).toBeDefined();

      // Step 3: Fetch available employees
      const employeesRes = await request(app)
        .get("/api/employees")
        .expect(200);

      expect(Array.isArray(employeesRes.body)).toBe(true);
      expect(employeesRes.body.length).toBeGreaterThan(0);

      const employee = employeesRes.body[0];
      expect(employee.id).toBeDefined();
      expect(employee.firstName).toBe(employeeName);

      // Step 4: Book appointment within available schedule
      const bookingRes = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: {
            id: employee.id,
            firstName: employee.firstName,
          },
        })
        .expect(200);

      expect(bookingRes.body.success).toBe(true);
      expect(bookingRes.body.message).toBe("Appointment successfully created");

      // Step 5: Verify appointment appears in client's appointments
      const appointmentsRes = await request(app)
        .get("/api/appointments")
        .set("Cookie", sessionCookie)
        .expect(200);

      expect(Array.isArray(appointmentsRes.body)).toBe(true);
      expect(appointmentsRes.body.length).toBe(1);

      const appointment = appointmentsRes.body[0];
      expect(appointment.service).toBe("Haircut");
      appointmentId = appointment.id;

      // Step 6: Verify appointment in database
      const dbAppointment = await Appointment.findByPk(appointmentId);
      expect(dbAppointment).toBeDefined();
      expect(dbAppointment!.service).toBe("Haircut");
      expect(dbAppointment!.employeeId).toBe(employee.id);
      expect(dbAppointment!.status).toBe("scheduled");
    });

    it("prevents booking on date without schedule", async () => {
      const sessionCookie = getSessionCookie(await loginAsClient());
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-23T10:00:00.000Z", // Different date, no schedule
          end: "2024-01-23T10:30:00.000Z",
          service: "Haircut",
          employee: {
            id: employeeId,
            firstName: "Sarah",
          },
        })
        .expect(410);

      expect(response.body.error).toContain("No schedule found for selected date");
    });

    it("prevents booking when not authenticated", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .send({
          start: "2024-01-22T18:00:00.000Z",
          end: "2024-01-22T18:30:00.000Z",
          service: "Haircut",
          employee: {
            id: employeeId,
            firstName: "Sarah",
          },
        })
        .expect(401);

      expect(response.body.error).toContain("Session expired");
    });

    it("allows client to cancel their own appointment", async () => {
      const sessionCookie = getSessionCookie(await loginAsClient());
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: {
            id: employeeId,
            firstName: employeeName,
          },
        })
        .expect(200);

      const appointmentsRes = await request(app)
        .get("/api/appointments")
        .set("Cookie", sessionCookie)
        .expect(200);

      expect(Array.isArray(appointmentsRes.body)).toBe(true);
      expect(appointmentsRes.body.length).toBe(1);
      appointmentId = appointmentsRes.body[0].id;

      const cancelRes = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set("Cookie", sessionCookie)
        .expect(200);

      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.message).toBe("Appointment successfully cancelled");

      // Verify deletion
      const deleted = await Appointment.findByPk(appointmentId);
      expect(deleted).toBeNull();
    });
  });
});
