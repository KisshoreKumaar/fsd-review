import { useState } from 'react';
import toast from 'react-hot-toast';
import { verifyPayment } from '../../api/payment.api.js';
import { apiMessage } from '../../api/client.js';
import { formatDateTime, formatRupees } from '../../utils/format.js';
import SectionCard from '../common/SectionCard.jsx';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';

const LABELS = {
  PAID: ['Paid', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
  PENDING_VERIFICATION: ['Awaiting verification', 'bg-amber-50 text-amber-800 ring-amber-200'],
  FAILED: ['Not verified', 'bg-rose-50 text-rose-700 ring-rose-200'],
  CREATED: ['Not paid', 'bg-slate-100 text-slate-600 ring-slate-200'],
};
const METHOD = { upi_qr: 'UPI QR', razorpay: 'Razorpay', mock: 'Mock gateway' };

/** Officer view of the application fee; UPI payments are confirmed or rejected here. */
export default function PaymentReviewCard({ payment, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const decide = async (decision) => {
    setBusy(true);
    try {
      await verifyPayment(payment._id, { decision, reason: reason.trim() || undefined });
      toast.success(decision === 'PAID' ? 'Payment marked as paid' : 'Payment rejected — the applicant was notified');
      setRejecting(false);
      onChanged();
    } catch (err) {
      toast.error(apiMessage(err, 'Could not update the payment'));
    } finally {
      setBusy(false);
    }
  };

  if (!payment) {
    return <SectionCard title="Fee payment"><p className="text-sm text-slate-500">No payment yet.</p></SectionCard>;
  }

  const [label, tone] = LABELS[payment.status] || LABELS.CREATED;
  const pending = payment.status === 'PENDING_VERIFICATION';

  return (
    <SectionCard title="Fee payment">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-medium">{formatRupees(payment.amount)}</span>
        <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
          {label}
        </span>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm [&>div]:gap-3 [&_dd]:text-right [&_dt]:shrink-0">
        <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd>{METHOD[payment.method] || payment.method || '—'}</dd></div>
        {payment.upiReference && (
          <div className="flex justify-between"><dt className="text-slate-500">UPI reference</dt><dd className="font-mono text-xs">{payment.upiReference}</dd></div>
        )}
        {payment.submittedAt && (
          <div className="flex justify-between"><dt className="text-slate-500">Submitted</dt><dd>{formatDateTime(payment.submittedAt)}</dd></div>
        )}
        {payment.rejectionReason && <p className="text-xs text-rose-600">Reason: {payment.rejectionReason}</p>}
      </dl>

      {pending && (
        <>
          <p className="mt-3 text-xs text-slate-500">
            Check the college account for a credit with this UPI reference before marking it paid.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="success" loading={busy} onClick={() => decide('PAID')}>Mark as paid</Button>
            <Button size="sm" variant="danger" onClick={() => { setReason(''); setRejecting(true); }}>Reject</Button>
          </div>
        </>
      )}

      <Modal
        open={rejecting}
        title="Reject payment"
        onClose={() => setRejecting(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(false)}>Cancel</Button>
            <Button variant="danger" loading={busy} disabled={reason.trim().length < 5} onClick={() => decide('REJECTED')}>Reject and notify</Button>
          </>
        }
      >
        <Input label="Reason shown to the applicant" placeholder="e.g. No credit found for this UPI reference" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </SectionCard>
  );
}
