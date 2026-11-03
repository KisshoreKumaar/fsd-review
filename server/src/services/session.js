import { REFRESH_COOKIE, hashToken, refreshCookieOptions, signAccessToken, signRefreshToken } from '../utils/tokens.js';

/**
 * Issues an access token and rotates the refresh cookie.
 * revokeOthers: drop the previous refresh token immediately (used after a
 * password change or reset) instead of keeping the 30-second grace window.
 */
export const issueSession = async (res, user, { revokeOthers = false } = {}) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.previousRefreshTokenHash = revokeOthers ? undefined : user.refreshTokenHash;
  user.refreshRotatedAt = new Date();
  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
};

export default issueSession;
