import { ApiError } from "../utils/api-error.js";
import { resolveCurrentUser } from "../services/auth.service.js";

function readBearerToken(req) {
  const header = req.get("authorization");

  if (!header) {
    return null;
  }

  const [scheme, token, ...rest] = header.trim().split(/\s+/);

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token ||
    rest.length > 0 ||
    token.length > 4096
  ) {
    return null;
  }

  return token;
}

export async function requireAuth(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    res.set("WWW-Authenticate", 'Bearer realm="sm-store"');
    return next(
      new ApiError(
        401,
        "A valid Bearer access token is required.",
        "UNAUTHORIZED",
      ),
    );
  }

  try {
    const user = await resolveCurrentUser(token);
    req.user = user;
    req.accessToken = token;
    return next();
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      res.set("WWW-Authenticate", 'Bearer realm="sm-store"');
    }
    return next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(
      new ApiError(401, "Authentication is required.", "UNAUTHORIZED"),
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new ApiError(403, "Administrator access is required.", "ADMIN_REQUIRED"),
    );
  }

  return next();
}

export function requireCustomer(req, res, next) {
  if (!req.user) {
    return next(
      new ApiError(401, "Authentication is required.", "UNAUTHORIZED"),
    );
  }

  if (req.user.role !== "customer") {
    return next(
      new ApiError(
        403,
        "Administrator accounts cannot shop. Use a customer account.",
        "ADMIN_CANNOT_SHOP",
      ),
    );
  }

  return next();
}
