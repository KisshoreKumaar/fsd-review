import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { submitUpiPayment } from '../../api/payment.api.js';
import { apiMessage } from '../../api/client.js';
import { formatRupees } from '../../utils/format.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

const schema = z.object({
  upiReference: z.string().trim().regex(/^\d{12}$/, 'Enter the 12-digit UPI reference (UTR)'),
});

const STEPS = [
  'Open any UPI app — Google Pay, PhonePe, Paytm or your bank app.',
  'Scan the QR code and complete the payment.',
  'Copy the 12-digit UPI reference (UTR) from the payment receipt.',
  'Enter it below — an officer confirms the payment during review.',
];

/** Pay-by-QR panel: shows the college's UPI QR and collects the UPI reference. */
export default function UpiPayment({ upi, fee, payment, onSubmitted }) {
  const pending = payment?.status === 'PENDING_VERIFICATION';
  const rejected = payment?.status === 'FAILED' && payment?.method === 'upi_qr';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { upiReference: pending ? payment.upiReference : '' } });

  const onSubmit = async ({ upiReference }) => {
    try {
      await submitUpiPayment(upiReference);
      toast.success('Reference submitted — an officer will confirm your payment');
      onSubmitted();
    } catch (err) {
      toast.error(apiMessage(err, 'Could not submit the reference'));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <figure className="mx-auto w-full max-w-[240px]">
        <img
          src={upi.qrUrl}
          alt={`UPI QR code for paying ${upi.payeeName}`}
          className="w-full rounded-2xl border border-slate-200 bg-white p-2"
        />
        <figcaption className="mt-2 text-center text-xs text-slate-500">
          Pays <b className="text-ink">{upi.payeeName}</b> via UPI
        </figcaption>
      </figure>

      <div>
        <p className="eyebrow text-slate-500">Pay by UPI QR</p>
        <p className="mt-1 text-3xl font-medium tracking-display">{formatRupees(fee)}</p>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-bold text-brand-500">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        {pending && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <b>Awaiting verification.</b> Reference {payment.upiReference} was submitted — you can still correct it below.
          </p>
        )}
        {rejected && (
          <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <b>Payment not verified:</b> {payment.rejectionReason}. Check the reference and submit it again.
          </p>
        )}

        <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            className="flex-1"
            label="UPI reference (UTR)"
            inputMode="numeric"
            maxLength={12}
            placeholder="12-digit number"
            {...register('upiReference')}
            error={errors.upiReference?.message}
          />
          <Button type="submit" className="sm:mt-6" loading={isSubmitting}>
            {pending ? 'Update reference' : 'I have paid'}
          </Button>
        </form>
      </div>
    </div>
  );
}
