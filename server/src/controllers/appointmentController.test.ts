import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { sequelize } from "../utils/db.js";
import { User, Schedule, Appointment } from "../models/index.js";

describe("Appointment Controller - API Integration", () => {
  let sessionCookie: string;
  let employeeId: string;
  let scheduleId: string;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test user
    const client = await User.create({
      firstName: "Test",
      lastName: "Client",
      email: "test@test.com",
      passwordHash: "$2b$10$KixH1h4P3qp/VKH3VKH3Ve", // mock hash
      role: "client",
    });

    // Create employee
    const employee = await User.create({
      firstName: "John",
      lastName: "Barber",
      email: "employee@test.com",
      passwordHash: "$2b$10$KixH1h4P3qp/VKH3VKH3Ve",
      role: "employee",
    });
    employeeId = employee.id;

    // Create schedule
    const schedule = await Schedule.create({
      open: new Date("2024-01-22T14:00:00.000Z"),
      close: new Date("2024-01-22T22:00:00.000Z"),
    });
    scheduleId = schedule.id;

    // Login to get session
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "password" });

    // Extract session cookie
    const cookies = loginRes.headers["set-cookie"];
    if (cookies && cookies.length > 0) {
      sessionCookie = cookies[0];
    }
  });

  beforeEach(async () => {
    // Clean appointments before each test
    await Appointment.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/appointments", () => {
    it("accepts ISO datetimes without date field", async () => {
      // MUST FIX #1 - verify schema accepts this
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: {
            id: employeeId,
            firstName: "John",
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Appointment successfully created");
    });

    it("rejects request with separate date field", async () => {
      // MUST FIX #1 - verify schema rejects this
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          date: "2024-01-22", // ❌ Should be rejected
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(400); // Bad request

      expect(response.body.error).toBeDefined();
    });

    it("rejects non-UTC ISO strings (timezone offsets)", async () => {
      // Verify timezone handling (MUST FIX #2)
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00-05:00", // EST offset
          end: "2024-01-22T17:30:00-05:00",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(400);

      expect(response.body.error).toContain("Z suffix required");
    });

    it("prevents double-booking same employee at same time", async () => {
      // Create first appointment
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(200);

      // Try to book overlapping slot
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:15:00.000Z", // Overlaps
          end: "2024-01-22T17:45:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(409); // Conflict

      expect(response.body.error).toContain(
        "conflicts with existing appointment",
      );
    });

    it("allows back-to-back appointments", async () => {
      // MUST FIX #3 verification
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(200);

      // Book immediately after
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:30:00.000Z", // Exactly when previous ends
          end: "2024-01-22T18:00:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("rejects invalid service type", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Invalid Service",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it("rejects end time before start time", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T18:00:00.000Z",
          end: "2024-01-22T17:00:00.000Z", // Before start
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(400);

      expect(response.body.error).toContain(
        "End time must be after start time",
      );
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    it("deletes appointment and sends cancellation email", async () => {
      // Create appointment first
      const createRes = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne();
      expect(appointment).toBeDefined();

      const response = await request(app)
        .delete(`/api/appointments/${appointment!.id}`)
        .set("Cookie", sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Appointment successfully cancelled");

      // Verify appointment deleted
      const deleted = await Appointment.findByPk(appointment!.id);
      expect(deleted).toBeNull();
    });

    it("returns 404 for non-existent appointment", async () => {
      const fakeUuid = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .delete(`/api/appointments/${fakeUuid}`)
        .set("Cookie", sessionCookie)
        .expect(404);

      expect(response.body.error).toBe("Appointment not found");
    });
  });

  describe("PUT /api/appointments/:id", () => {
    it("updates appointment with new ISO datetimes", async () => {
      // Create appointment
      const createRes = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne();

      const response = await request(app)
        .put(`/api/appointments/${appointment!.id}`)
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T18:00:00.000Z", // Updated time
          end: "2024-01-22T18:30:00.000Z",
          service: "Beard Trim", // Updated service
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Appointment successfully updated");

      // Verify update
      const updated = await Appointment.findByPk(appointment!.id);
      expect(updated?.service).toBe("Beard Trim");
    });
  });

  describe("GET /api/appointments", () => {
    it("retrieves all appointments for logged-in user", async () => {
      // Create appointment
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const response = await request(app)
        .get("/api/appointments")
        .set("Cookie", sessionCookie)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
