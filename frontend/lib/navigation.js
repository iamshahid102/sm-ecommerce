const FALLBACK_PATH = "/account";

export function safeNextPath(value, fallback = FALLBACK_PATH) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "http://sm-store.local");

    if (parsed.origin !== "http://sm-store.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
