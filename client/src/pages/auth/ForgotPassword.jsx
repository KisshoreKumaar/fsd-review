import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { forgotPassword, resetPassword } from '../../api/auth.api.js';
import { apiMessage } from '../../api/client.js';
import { withConfirmation } from '../passwordSchema.js';

const emailSchema = z.object({ email: z.string().email('Enter a valid email') });
const resetSchema = withConfirmation({ code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') });

function RequestStep({ onSent }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(emailSchema) });

  const onSubmit = async ({ email }) => {
    try {
      const res = await forgotPassword(email);
      toast.success(res.message);
      onSent(email, res.data?.devOtp);
    } catch (err) {
      toast.error(apiMessage(err, 'Could not send the code'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input label="Registered email" type="email" autoComplete="email" required {...register('email')} error={errors.email?.message} />
      <Button type="submit" className="w-full" loading={isSubmitting}>Send reset code</Button>
    </form>
  );
}

function ResetStep({ email, devOtp, onBack }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: devOtp || '' },
  });

  const onSubmit = async ({ code, newPassword }) => {
    try {
      await resetPassword({ email, code, newPassword });
      toast.success('Password reset — sign in with your new password');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(apiMessage(err, 'Could not reset the password'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-slate-600">
        If <b>{email}</b> has an account, a 6-digit code is on its way. It expires in 10 minutes.
      </p>
      {devOtp && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Dev mode: your code is <b>{devOtp}</b> (emails are not delivered without SMTP keys).
        </p>
      )}
      <Input label="Reset code" inputMode="numeric" maxLength={6} required {...register('code')} error={errors.code?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="New password" type="password" autoComplete="new-password" required {...register('newPassword')} error={errors.newPassword?.message} />
        <Input label="Confirm password" type="password" autoComplete="new-password" required {...register('confirmPassword')} error={errors.confirmPassword?.message} />
      </div>
      <Button type="submit" className="w-full" loading={isSubmitting}>Set new password</Button>
      <Button variant="ghost" className="w-full" onClick={onBack}>Use a different email</Button>
    </form>
  );
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(null);

  return (
    <AuthShell
      title="Reset your password"
      subtitle={sent ? 'Enter the code from your email and choose a new password.' : 'We will email you a one-time code.'}
      footer={<Link className="font-medium text-brand-700 hover:underline" to="/login">Back to sign in</Link>}
    >
      {sent ? (
        <ResetStep email={sent.email} devOtp={sent.devOtp} onBack={() => setSent(null)} />
      ) : (
        <RequestStep onSent={(email, devOtp) => setSent({ email, devOtp })} />
      )}
    </AuthShell>
  );
}
