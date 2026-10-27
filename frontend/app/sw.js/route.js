// This app is not a PWA. The path exists only to remove stale service workers
// left behind by other projects that used http://localhost:3000/sw.js.
// Without this route, the catch-all /[slug] page would return HTML for /sw.js
// with status 200, so the browser could never replace or unregister the old
// worker. Keeping the update response valid JavaScript lets the worker clear
// its stale caches and unregister itself.
const CLEANUP_WORKER = `
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
    })(),
  );
});
`;

export function GET() {
  return new Response(CLEANUP_WORKER, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Service-Worker-Allowed": "/",
    },
  });
}
