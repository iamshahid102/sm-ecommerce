import test from "node:test";
import assert from "node:assert/strict";

import { GET } from "../app/sw.js/route.js";

test("sw.js returns a valid cleanup worker instead of the catch-all page", async () => {
  const response = GET();

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /application\/javascript/,
  );
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(response.headers.get("service-worker-allowed"), "/");

  const body = await response.text();
  assert.match(body, /self\.skipWaiting\(\)/);
  assert.match(body, /caches\.delete/);
  assert.match(body, /registration\.unregister\(\)/);
});
