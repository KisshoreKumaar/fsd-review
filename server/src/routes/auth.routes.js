import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/auth.controller.js';
import * as passwordController from '../controllers/password.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.js';

export const authRouter = Router();

const emailRule = body('email').isEmail().withMessage('A valid email is required').normalizeEmail();

/** One password policy for registration, change and reset. */
const passwordRule = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .matches(/\d/)
    .withMessage('Password must contain a digit');

authRouter.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 3, max: 120 }).withMessage('Name must be 3–120 characters'),
    emailRule,
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
    passwordRule('password'),
  ],
  validate,
  controller.register,
);

authRouter.post(
  '/verify-otp',
  otpLimiter,
  [emailRule, body('code').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit code')],
  validate,
  controller.verifyOtp,
);

authRouter.post('/resend-otp', otpLimiter, [emailRule], validate, controller.resendOtp);

authRouter.post(
  '/login',
  authLimiter,
  [emailRule, body('password').notEmpty().withMessage('Password is required')],
  validate,
  controller.login,
);

authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', controller.logout);
authRouter.get('/me', authenticate, controller.me);

authRouter.post(
  '/change-password',
  authLimiter,
  authenticate,
  [body('currentPassword').notEmpty().withMessage('Current password is required'), passwordRule('newPassword')],
  validate,
  passwordController.changePassword,
);
authRouter.post('/forgot-password', otpLimiter, [emailRule], validate, passwordController.forgotPassword);
authRouter.post(
  '/reset-password',
  otpLimiter,
  [emailRule, body('code').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit code'), passwordRule('newPassword')],
  validate,
  passwordController.resetPassword,
);

export default authRouter;
