import { Application } from '../models/Application.js';
import { Payment } from '../models/Payment.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { notify } from '../services/notify.js';
import { applicationFee } from '../services/payment.js';

/**
 * Applicant paid by scanning the college's UPI QR and reports the UPI reference.
 * The fee stays PENDING_VERIFICATION until an officer confirms the money arrived.
 */
export const submitUpiPayment = asyncHandler(async (req, res) => {
  const upiReference = String(req.body.upiReference).trim();
  const application = await Application.findOne({ applicant: req.user._id, admissionCycle: env.admissionCycle });
  if (!application) throw ApiError.badRequest('Start your application before paying the fee');

  const existing = await Payment.findOne({ application: application._id }).sort({ createdAt: -1 });
  if (existing?.status === 'PAID') throw ApiError.conflict('The application fee is already paid');

  const reused = await Payment.exists({ upiReference, application: { $ne: application._id } });
  if (reused) throw ApiError.conflict('This UPI reference has already been used for another application');

  // Re-submitting (a typo, or after a rejection) updates the same record.
  const payment = existing?.method === 'upi_qr' ? existing : new Payment({
    application: application._id,
    applicant: req.user._id,
    amount: applicationFee(),
    currency: 'INR',
    method: 'upi_qr',
  });
  payment.upiReference = upiReference;
  payment.status = 'PENDING_VERIFICATION';
  payment.submittedAt = new Date();
  payment.rejectionReason = undefined;
  await payment.save();

  application.payment = payment._id;
  await application.save();

  return ok(res, { payment }, 'Payment reference received — an officer will confirm it');
});

/** Officer/admin confirms or rejects a UPI payment from the review screen. */
export const verifyUpiPayment = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'PENDING_VERIFICATION') {
    throw ApiError.badRequest(`Only payments awaiting verification can be reviewed (this one is ${payment.status})`);
  }
  if (decision === 'REJECTED' && !reason?.trim()) throw ApiError.badRequest('Give the applicant a reason');

  payment.verifiedBy = req.user._id;
  payment.verifiedAt = new Date();
  if (decision === 'PAID') {
    payment.status = 'PAID';
    payment.paidAt = new Date();
  } else {
    payment.status = 'FAILED';
    payment.rejectionReason = reason.trim();
  }
  await payment.save();

  const fee = `₹${(payment.amount / 100).toFixed(2)}`;
  await notify(payment.applicant, decision === 'PAID'
    ? { title: 'Application fee confirmed', body: `Your ${fee} UPI payment (ref. ${payment.upiReference}) has been confirmed.`, link: '/app/payment' }
    : { title: 'Payment could not be verified', body: `We could not match UPI ref. ${payment.upiReference}: ${payment.rejectionReason}. Please check and resubmit.`, link: '/app/payment' });

  return ok(res, { payment }, decision === 'PAID' ? 'Payment marked as paid' : 'Payment rejected');
});
