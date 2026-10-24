import "server-only";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export class ServerApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ServerApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetchServer(path, { token, method = "GET", body } = {}) {
  if (!token) {
    throw new ServerApiError(
      "Your session has expired. Please sign in again.",
      401,
      "UNAUTHORIZED",
    );
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new ServerApiError(
      "The store API is unavailable. Start the backend and try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ServerApiError(
      payload?.error || "The request could not be completed.",
      response.status,
      payload?.code,
    );
  }

  return payload?.data;
}
