import { changePassword, updateProfile } from "../services/auth.service.js";
import { sendSuccess } from "../utils/http.js";

export async function getMe(req, res) {
  return sendSuccess(res, req.user, { message: "Profile loaded." });
}

export async function updateMe(req, res) {
  const profile = await updateProfile(req.user.id, req.validated.body);
  return sendSuccess(res, profile, { message: "Profile updated." });
}

export async function updatePassword(req, res) {
  await changePassword({
    userId: req.user.id,
    email: req.user.email,
    currentPassword: req.validated.body.current_password,
    newPassword: req.validated.body.new_password,
  });

  return sendSuccess(res, { updated: true }, { message: "Password updated." });
}
