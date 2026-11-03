import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

// The only routes a user with a temporary password may call.
const ALLOWED_BEFORE_PASSWORD_CHANGE = ['/api/v1/auth/change-password', '/api/v1/auth/me'];

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/** Fails closed: no token, bad token or unknown user all end as 401. */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (!user.isEmailVerified) throw ApiError.forbidden('Verify your email to continue');
  if (user.mustChangePassword && !ALLOWED_BEFORE_PASSWORD_CHANGE.includes(req.originalUrl.split('?')[0])) {
    throw new ApiError(403, 'Change your temporary password to continue', [
      { field: 'password', message: 'PASSWORD_CHANGE_REQUIRED' },
    ]);
  }

  req.user = user;
  next();
});

export default authenticate;
