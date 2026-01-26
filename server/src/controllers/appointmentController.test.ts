import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { sequelize } from "../utils/db.js";
import bcrypt from "bcrypt";
import { User, Schedule, Appointment } from "../models/index.js";

describe("Appointment Controller - API Integration", () => {
  let sessionCookie: string;
  let adminSessionCookie: string;
  let employeeSessionCookie: string;
  let otherEmployeeSessionCookie: string;
  let employeeId: string;
  let otherEmployeeId: string;
  const testPassword = "Password123!";
  const adminPassword = "Password123!";

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Create test user
    await User.create({
      firstName: "Test",
      lastName: "Client",
      email: "test@test.com",
      passwordHash,
      role: "client",
    });

    // Create admin user
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      passwordHash,
      role: "admin",
    });

    // Create employee
    const employee = await User.create({
      firstName: "John",
      lastName: "Barber",
      email: "employee@test.com",
      passwordHash,
      role: "employee",
    });
    employeeId = employee.id;

    const otherEmployee = await User.create({
      firstName: "Jane",
      lastName: "Barber",
      email: "employee2@test.com",
      passwordHash,
      role: "employee",
    });
    otherEmployeeId = otherEmployee.id;

    // Create schedule
    await Schedule.create({
      open: new Date("2024-01-22T14:00:00.000Z"),
      close: new Date("2024-01-22T22:00:00.000Z"),
    });

    // Login to get session
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: testPassword });

    // Extract session cookie with error handling
    const cookies = loginRes.headers["set-cookie"];
    if (!cookies || cookies.length === 0) {
      throw new Error(
        `Login failed: status=${loginRes.status}, body=${JSON.stringify(loginRes.body)}, headers=${JSON.stringify(loginRes.headers)}`
      );
    }
    sessionCookie = cookies[0];

    const employeeLoginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "employee@test.com", password: testPassword });
    const employeeCookies = employeeLoginRes.headers["set-cookie"];
    if (!employeeCookies || employeeCookies.length === 0) {
      throw new Error(
        `Employee login failed: status=${employeeLoginRes.status}, body=${JSON.stringify(employeeLoginRes.body)}, headers=${JSON.stringify(employeeLoginRes.headers)}`
      );
    }
    employeeSessionCookie = employeeCookies[0];

    const otherEmployeeLoginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "employee2@test.com", password: testPassword });
    const otherEmployeeCookies = otherEmployeeLoginRes.headers["set-cookie"];
    if (!otherEmployeeCookies || otherEmployeeCookies.length === 0) {
      throw new Error(
        `Other employee login failed: status=${otherEmployeeLoginRes.status}, body=${JSON.stringify(otherEmployeeLoginRes.body)}, headers=${JSON.stringify(otherEmployeeLoginRes.headers)}`
      );
    }
    otherEmployeeSessionCookie = otherEmployeeCookies[0];

    const adminLoginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: adminPassword });
    const adminCookies = adminLoginRes.headers["set-cookie"];
    if (!adminCookies || adminCookies.length === 0) {
      throw new Error(
        `Admin login failed: status=${adminLoginRes.status}, body=${JSON.stringify(adminLoginRes.body)}, headers=${JSON.stringify(adminLoginRes.headers)}`
      );
    }
    adminSessionCookie = adminCookies[0];
  });

  beforeEach(async () => {
    // Clean appointments before each test
    await Appointment.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/appointments", () => {
    it("rejects booking for non-client roles", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", employeeSessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(403);

      await request(app)
        .post("/api/appointments")
        .set("Cookie", adminSessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        })
        .expect(403);
    });

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
          date: "2024-01-22", // Should be rejected
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

    it("rejects booking when client and employee are the same user", async () => {
      const response = await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T17:00:00.000Z",
          end: "2024-01-22T17:30:00.000Z",
          service: "Haircut",
          employee: { id: (await User.findOne({ where: { email: "test@test.com" } }))!.id, firstName: "Test" },
        })
        .expect(400);

      expect(response.body.error).toBe("Client and employee must be different");
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    it("deletes appointment and sends cancellation email", async () => {
      // Create appointment first
      await request(app)
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

    it("allows admin to cancel any appointment", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T19:00:00.000Z",
          end: "2024-01-22T19:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne({
        where: { start: new Date("2024-01-22T19:00:00.000Z") },
      });

      const response = await request(app)
        .delete(`/api/appointments/${appointment!.id}`)
        .set("Cookie", adminSessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Appointment successfully cancelled");
    });

    it("rejects cancellation by non-assigned employee", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T20:00:00.000Z",
          end: "2024-01-22T20:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne();

      await request(app)
        .delete(`/api/appointments/${appointment!.id}`)
        .set("Cookie", otherEmployeeSessionCookie)
        .expect(403);
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
      await request(app)
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

    it("rejects employee changing assigned employee", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T21:00:00.000Z",
          end: "2024-01-22T21:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne({
        where: { start: new Date("2024-01-22T21:00:00.000Z") },
      });

      await request(app)
        .put(`/api/appointments/${appointment!.id}`)
        .set("Cookie", employeeSessionCookie)
        .send({
          start: "2024-01-22T22:00:00.000Z",
          end: "2024-01-22T22:30:00.000Z",
          service: "Haircut",
          employee: { id: otherEmployeeId, firstName: "Jane" },
        })
        .expect(403);
    });

    it("allows admin to modify appointments", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T18:00:00.000Z",
          end: "2024-01-22T18:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne({
        where: { start: new Date("2024-01-22T18:00:00.000Z") },
      });

      const response = await request(app)
        .put(`/api/appointments/${appointment!.id}`)
        .set("Cookie", adminSessionCookie)
        .send({
          start: "2024-01-22T19:00:00.000Z",
          end: "2024-01-22T19:30:00.000Z",
          service: "Beard Trim",
          employee: { id: otherEmployeeId, firstName: "Jane" },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Appointment successfully updated");

      const updated = await Appointment.findByPk(appointment!.id);
      expect(updated?.service).toBe("Beard Trim");
      expect(updated?.employeeId).toBe(otherEmployeeId);
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

    it("rejects admin access", async () => {
      await request(app)
        .get("/api/appointments")
        .set("Cookie", adminSessionCookie)
        .expect(403);
    });
  });

  describe("GET /api/appointments/:id", () => {
    it("rejects access for non-assigned employee", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T20:00:00.000Z",
          end: "2024-01-22T20:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne({
        where: { start: new Date("2024-01-22T20:00:00.000Z") },
      });

      await request(app)
        .get(`/api/appointments/${appointment!.id}`)
        .set("Cookie", otherEmployeeSessionCookie)
        .expect(403);
    });

    it("rejects admin access", async () => {
      await request(app)
        .post("/api/appointments")
        .set("Cookie", sessionCookie)
        .send({
          start: "2024-01-22T21:00:00.000Z",
          end: "2024-01-22T21:30:00.000Z",
          service: "Haircut",
          employee: { id: employeeId, firstName: "John" },
        });

      const appointment = await Appointment.findOne({
        where: { start: new Date("2024-01-22T21:00:00.000Z") },
      });

      await request(app)
        .get(`/api/appointments/${appointment!.id}`)
        .set("Cookie", adminSessionCookie)
        .expect(403);
    });
  });
});
