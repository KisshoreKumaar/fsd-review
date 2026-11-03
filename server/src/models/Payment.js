import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      // PENDING_VERIFICATION: paid by UPI QR, waiting for an officer to confirm it.
      enum: ['CREATED', 'PENDING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    method: String,
    isMock: { type: Boolean, default: false },
    // UPI QR payments: the applicant's 12-digit UPI reference (UTR) and the officer's decision.
    upiReference: { type: String, trim: true },
    submittedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    rejectionReason: String,
    paidAt: Date,
  },
  { timestamps: true },
);

paymentSchema.index({ upiReference: 1 }, { unique: true, sparse: true });

// Reuse an already-compiled model: test files share one mongoose registry.
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
