import request from "supertest";

import { createApp } from "../src/app.js";

describe("system endpoints", () => {
  const app = createApp();

  it("returns service metadata at the root", async () => {
    const response = await request(app).get("/").expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        name: "SM Store API",
        version: "0.1.0",
      },
      message: "OK",
    });
  });

  it("reports liveness and configured services", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.services.api).toBe("ok");
    expect(["configured", "not_configured"]).toContain(
      response.body.data.services.database,
    );
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("reports not ready when the database is not configured", async () => {
    const response = await request(app).get("/api/v1/health/ready").expect(503);

    expect(response.body).toMatchObject({
      success: false,
      code: "NOT_READY",
    });
  });

  it("returns the v1 index payload", async () => {
    const response = await request(app).get("/api/v1").expect(200);

    expect(response.body.data).toMatchObject({
      name: "SM Store API",
      version: "v1",
    });
  });

  it("returns a structured 404 for unknown routes", async () => {
    const response = await request(app)
      .get("/api/v1/does-not-exist")
      .expect(404);

    expect(response.body).toMatchObject({
      success: false,
      code: "NOT_FOUND",
    });
  });

  it("rejects disallowed CORS origins", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://malicious.example")
      .expect(403);

    expect(response.body.code).toBe("CORS_REJECTED");
  });

  it("allows the configured frontend origin", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "http://localhost:3000")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });
});
