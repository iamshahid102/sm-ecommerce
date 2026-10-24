import express from "express";
import request from "supertest";

import {
  requireAdmin,
  requireAuth,
  requireCustomer,
} from "../src/middleware/auth.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import { resolveCurrentUser } from "../src/services/auth.service.js";

jest.mock("../src/services/auth.service.js", () => ({
  resolveCurrentUser: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

function createTestApp() {
  const app = express();
  app.disable("x-powered-by");
  app.get("/customer", requireAuth, requireCustomer, (req, res) => {
    res.json({ success: true, data: { id: req.user.id } });
  });
  app.get("/admin", requireAuth, requireAdmin, (req, res) => {
    res.json({ success: true, data: { role: req.user.role } });
  });
  app.use(errorHandler);
  return app;
}

describe("authentication middleware", () => {
  const app = createTestApp();

  beforeEach(() => {
    resolveCurrentUser.mockReset();
  });

  it("rejects requests without a Bearer token", async () => {
    const response = await request(app).get("/customer").expect(401);

    expect(response.body).toMatchObject({
      success: false,
      code: "UNAUTHORIZED",
    });
    expect(resolveCurrentUser).not.toHaveBeenCalled();
  });

  it.each(["Token abc", "Bearer", "Bearer a b"])(
    "rejects a malformed authorization header: %s",
    async (header) => {
      const response = await request(app)
        .get("/customer")
        .set("Authorization", header)
        .expect(401);

      expect(response.body.code).toBe("UNAUTHORIZED");
      expect(resolveCurrentUser).not.toHaveBeenCalled();
    },
  );

  it("allows a customer through customer routes", async () => {
    resolveCurrentUser.mockResolvedValue({
      id: "customer-1",
      role: "customer",
    });

    const response = await request(app)
      .get("/customer")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(response.body.data.id).toBe("customer-1");
    expect(resolveCurrentUser).toHaveBeenCalledWith("valid-token");
  });

  it("blocks a customer from admin routes", async () => {
    resolveCurrentUser.mockResolvedValue({
      id: "customer-1",
      role: "customer",
    });

    const response = await request(app)
      .get("/admin")
      .set("Authorization", "Bearer valid-token")
      .expect(403);

    expect(response.body).toMatchObject({
      success: false,
      code: "ADMIN_REQUIRED",
    });
  });

  it("allows an admin through admin routes", async () => {
    resolveCurrentUser.mockResolvedValue({
      id: "admin-1",
      role: "admin",
    });

    const response = await request(app)
      .get("/admin")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(response.body.data.role).toBe("admin");
  });

  it("blocks an admin from customer shopping routes", async () => {
    resolveCurrentUser.mockResolvedValue({
      id: "admin-1",
      role: "admin",
    });

    const response = await request(app)
      .get("/customer")
      .set("Authorization", "Bearer valid-token")
      .expect(403);

    expect(response.body.code).toBe("ADMIN_CANNOT_SHOP");
  });
});
