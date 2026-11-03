import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/payment.controller.js';
import * as upiController from '../controllers/upi.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { ROLES } from '../constants/roles.js';

export const paymentRouter = Router();

// Razorpay calls this one — no session, signature-verified instead.
paymentRouter.post('/webhook', controller.handleWebhook);

paymentRouter.patch(
  '/:id/verify',
  authenticate,
  requireRole(ROLES.OFFICER, ROLES.ADMIN),
  [
    body('decision').isIn(['PAID', 'REJECTED']).withMessage('decision must be PAID or REJECTED'),
    body('reason').optional().isLength({ max: 300 }),
  ],
  validate,
  upiController.verifyUpiPayment,
);

paymentRouter.use(authenticate, requireRole(ROLES.APPLICANT));
paymentRouter.get('/mine', controller.getMyPayment);
paymentRouter.post(
  '/upi',
  [body('upiReference').trim().matches(/^\d{12}$/).withMessage('Enter the 12-digit UPI reference (UTR) from your payment app')],
  validate,
  upiController.submitUpiPayment,
);
paymentRouter.post('/order', controller.createPaymentOrder);
paymentRouter.post('/confirm', controller.confirmPayment);

export default paymentRouter;
