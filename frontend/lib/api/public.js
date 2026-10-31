const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export class PublicApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiFetchPublicFull(
  path,
  { method = "GET", body, cache = "no-store" } = {},
) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache,
    });
  } catch {
    throw new PublicApiError(
      "The store API is unavailable. Please try again shortly.",
      0,
      "NETWORK_ERROR",
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new PublicApiError(
      payload?.error || "The request could not be completed.",
      response.status,
      payload?.code,
      payload?.details,
    );
  }

  return payload;
}

export async function apiFetchPublic(path, options) {
  const payload = await apiFetchPublicFull(path, options);
  return payload?.data;
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
