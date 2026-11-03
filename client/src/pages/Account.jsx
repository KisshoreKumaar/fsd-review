import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFieldErrors, apiMessage } from '../api/client.js';
import { ROLE_LABELS } from '../constants/roles.js';
import { withConfirmation } from './passwordSchema.js';
import SectionCard from '../components/common/SectionCard.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

const schema = withConfirmation({ currentPassword: z.string().min(1, 'Enter your current password') });

export default function Account() {
  const { user, changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed — other sessions have been signed out');
      reset();
    } catch (err) {
      const fieldErrors = apiFieldErrors(err);
      fieldErrors.forEach((e) => e.field && setError(e.field, { message: e.message }));
      if (!fieldErrors.length) toast.error(apiMessage(err, 'Could not change the password'));
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="page-title">Account</h1>
        <p className="text-sm text-slate-500">{user?.email}</p>
      </div>

      {user?.mustChangePassword && (
        <div className="rounded-2xl border border-brand-300 bg-brand-50 px-5 py-4 text-sm text-ink">
          <b>Choose your own password to continue.</b> Your account was created with a temporary password, so the rest
          of the portal unlocks once you change it.
        </div>
      )}

      <SectionCard title="Profile">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Mobile</dt>
            <dd className="font-medium">{user?.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium">{ROLE_LABELS[user?.role]}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Change password" description="At least 8 characters, with a letter and a digit.">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>Update password</Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
