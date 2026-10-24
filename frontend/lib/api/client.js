import { createClient } from "@/lib/supabase/client";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export class ApiClientError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function getAccessToken() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiClientError(
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
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiClientError(
      "Could not reach the store API. Please try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error || "The request could not be completed.",
      response.status,
      payload?.code,
      payload?.details,
    );
  }

  return payload?.data;
}
