export function sendSuccess(
  res,
  data,
  { status = 200, message = "OK", meta } = {},
) {
  const body = { success: true, data, message };

  if (meta) {
    body.meta = meta;
  }

  return res.status(status).json(body);
}

export function sendError(
  res,
  { status = 500, error = "Internal server error", code, details } = {},
) {
  const body = { success: false, error };

  if (code) body.code = code;
  if (details) body.details = details;

  return res.status(status).json(body);
}
