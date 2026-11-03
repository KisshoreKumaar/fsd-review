import { z } from 'zod';

/** Same policy as the server's passwordRule(). */
export const newPasswordField = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Za-z]/, 'Include a letter')
  .regex(/\d/, 'Include a digit');

export const withConfirmation = (shape) =>
  z.object({ ...shape, newPassword: newPasswordField, confirmPassword: z.string() }).refine(
    (v) => v.newPassword === v.confirmPassword,
    { path: ['confirmPassword'], message: 'Passwords do not match' },
  );
