import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { generateOtp, isOtpValid, OTP_TTL_MINUTES } from '../utils/otp.js';
import { issueSession } from '../services/session.js';
import { sendMail } from '../services/mailer.js';
import { passwordResetEmail } from '../services/emailTemplates.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/** Signed-in user changes their own password; other sessions are signed out. */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash +refreshTokenHash');

  if (!(await user.verifyPassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect', [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }
  if (await user.verifyPassword(newPassword)) {
    throw ApiError.badRequest('Choose a password different from the current one', [
      { field: 'newPassword', message: 'Must differ from the current password' },
    ]);
  }

  await user.setPassword(newPassword);
  user.mustChangePassword = false;
  user.passwordChangedAt = new Date();
  const accessToken = await issueSession(res, user, { revokeOthers: true });
  return ok(res, { accessToken, user: user.toPublic() }, 'Password changed');
});

/**
 * Starts a reset by e-mailing a code. The response never reveals whether the
 * address has an account, so the endpoint cannot be used to discover users.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase(), isActive: true }).select('+resetOtp');
  let devOtp;

  if (user) {
    const otp = generateOtp();
    user.resetOtp = otp;
    await user.save();
    await sendMail({ to: user.email, ...passwordResetEmail({ name: user.name, code: otp.code, minutes: OTP_TTL_MINUTES }) });
    if (env.exposeCodes) {
      logger.info(`[dev] Password reset code for ${user.email} is ${otp.code}`);
      devOtp = otp.code;
    }
  }

  return ok(
    res,
    devOtp ? { devOtp } : null,
    'If an account exists for this email, a reset code has been sent',
  );
});

/** Completes a reset: valid code + new password. Every existing session is revoked. */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtp +passwordHash');
  if (!user || !isOtpValid(user.resetOtp, code)) throw ApiError.badRequest('Invalid or expired code');

  await user.setPassword(newPassword);
  user.resetOtp = undefined;
  user.mustChangePassword = false;
  user.passwordChangedAt = new Date();
  user.refreshTokenHash = undefined;
  user.previousRefreshTokenHash = undefined;
  await user.save();

  return ok(res, null, 'Password reset — sign in with your new password');
});
