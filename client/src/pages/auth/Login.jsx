import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from './AuthShell.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiMessage } from '../../api/client.js';
import { ROLES } from '../../constants/roles.js';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      const firstName = user.name.replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, '').split(' ')[0];
      toast.success(`Welcome back, ${firstName}`);
      // Only return to the remembered page if it belongs to this user's area —
      // otherwise an applicant signing in after an admin would land on a 403.
      const area = user.role === ROLES.APPLICANT ? '/app' : '/admin';
      const from = location.state?.from;
      navigate(from && from.startsWith(area) ? from : area, { replace: true });
    } catch (err) {
      const needsVerify = err?.response?.data?.errors?.[0]?.message === 'VERIFY_REQUIRED';
      if (needsVerify) {
        toast.error('Verify your email first');
        navigate('/verify-otp', { state: { email: values.email } });
        return;
      }
      toast.error(apiMessage(err, 'Could not sign you in'));
    }
  };


  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your registered email to continue."
      footer={
        <p>
          New applicant?{' '}
          <Link className="font-medium text-brand-700 hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Email" type="email" autoComplete="email" required {...register('email')} error={errors.email?.message} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          {...register('password')}
          error={errors.password?.message}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
