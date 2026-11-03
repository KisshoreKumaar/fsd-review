import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as paymentApi from '../../api/payment.api.js';
import { apiMessage } from '../../api/client.js';
import { formatDateTime, formatRupees } from '../../utils/format.js';
import SectionCard from '../../components/common/SectionCard.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import UpiPayment from '../../components/applicant/UpiPayment.jsx';
import { loadRazorpayCheckout } from '../../utils/razorpay.js';

const STATUS_TEXT = {
  PAID: ['Paid', 'text-emerald-600'],
  PENDING_VERIFICATION: ['Awaiting verification', 'text-amber-600'],
  FAILED: ['Not verified', 'text-rose-600'],
};

export default function Payment() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(
    () => paymentApi.getMyPayment().then(setState).catch((err) => toast.error(apiMessage(err, 'Could not load the payment status'))),
    [],
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  /** Card / net-banking through Razorpay; mock gateway only when nothing else is configured. */
  const payOnline = async () => {
    setPaying(true);
    try {
      const { order, keyId, mockMode, alreadyPaid } = await paymentApi.createOrder();
      if (alreadyPaid) return load();
      if (mockMode) {
        await paymentApi.confirmPayment({ razorpayOrderId: order.id });
        toast.success('Payment successful (mock gateway)');
        return load();
      }
      const Razorpay = await loadRazorpayCheckout();
      new Razorpay({
        key: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'College Admissions',
        description: 'Application fee',
        handler: async (r) => {
          await paymentApi.confirmPayment({
            razorpayOrderId: r.razorpay_order_id,
            razorpayPaymentId: r.razorpay_payment_id,
            razorpaySignature: r.razorpay_signature,
          });
          toast.success('Payment successful');
          load();
        },
        theme: { color: '#FF5706' },
      }).open();
    } catch (err) {
      toast.error(apiMessage(err, 'Could not start the payment'));
    } finally {
      setPaying(false);
    }
    return undefined;
  };

  if (loading) return <Spinner label="Loading payment…" />;

  const payment = state?.payment;
  const paid = payment?.status === 'PAID';
  const [statusLabel, statusTone] = STATUS_TEXT[payment?.status] || ['Not paid', 'text-amber-600'];
  const showGatewayButton = state?.razorpayEnabled || !state?.upi;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Application fee</h1>
        <p className="text-sm text-slate-500">A one-time non-refundable fee for the 2026–27 admission cycle.</p>
      </div>

      <SectionCard title="Fee summary">
        <dl className="divide-y divide-slate-100 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-slate-500">Application processing fee</dt>
            <dd className="font-medium">{formatRupees(state?.fee)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-slate-500">Status</dt>
            <dd className={`font-medium ${statusTone}`}>{statusLabel}</dd>
          </div>
          {payment?.upiReference && (
            <div className="flex justify-between py-2">
              <dt className="text-slate-500">UPI reference</dt>
              <dd className="font-mono text-xs">{payment.upiReference}</dd>
            </div>
          )}
          {paid && (
            <div className="flex justify-between py-2">
              <dt className="text-slate-500">Confirmed on</dt>
              <dd>{formatDateTime(payment.paidAt)}</dd>
            </div>
          )}
        </dl>
        {paid && (
          <div className="mt-5 flex justify-end">
            <Link to="/app/status"><Button>Go to submission</Button></Link>
          </div>
        )}
      </SectionCard>

      {!paid && state?.upi && (
        <SectionCard title="Pay by UPI" description="Scan with any UPI app. Your fee is confirmed by an officer.">
          <UpiPayment upi={state.upi} fee={state.fee} payment={payment} onSubmitted={load} />
        </SectionCard>
      )}

      {!paid && showGatewayButton && (
        <SectionCard
          title={state?.upi ? 'Or pay online' : 'Pay online'}
          description={state?.razorpayEnabled ? 'Card, net banking or wallet through Razorpay.' : 'Razorpay keys are not configured, so this runs in mock mode.'}
        >
          <div className="flex justify-end">
            <Button variant="secondary" loading={paying} onClick={payOnline}>Pay {formatRupees(state?.fee)}</Button>
          </div>
        </SectionCard>
      )}

      <div className="flex justify-between">
        <Link to="/app/documents"><Button variant="secondary">Back to documents</Button></Link>
        {payment?.status === 'PENDING_VERIFICATION' && (
          <Link to="/app/status"><Button>Continue to submission</Button></Link>
        )}
      </div>
    </div>
  );
}
