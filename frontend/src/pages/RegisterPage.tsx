import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, Lock, Mail, User, AlertCircle, ArrowRight, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.').max(255),
  email:     z.string().email('Please enter a valid email address.'),
  password:  z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Must contain at least one digit.'),
  confirm_password: z.string(),
  role: z.enum(['recruiter', 'candidate']),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match.',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'recruiter' },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: FormData) => {
    clearError();
    const { confirm_password: _, ...payload } = data;
    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-600 to-accent-purple rounded-2xl shadow-xl shadow-brand-900/40 mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the X-MMHF hiring intelligence platform</p>
        </div>

        <div className="glass-card p-8">
          <p className="text-slate-400 text-sm mb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'recruiter', label: 'Recruiter', icon: Briefcase, desc: 'Evaluate candidates' },
                  { value: 'candidate', label: 'Candidate', icon: UserCheck, desc: 'View my evaluations' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value as 'recruiter' | 'candidate')}
                    className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                      selectedRole === value
                        ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                        : 'bg-surface-700/30 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs opacity-70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="label" htmlFor="full_name">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</span>
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                className={`input-field ${errors.full_name ? 'ring-2 ring-rose-500/50 border-rose-500/50' : ''}`}
                placeholder="Jane Smith"
                {...register('full_name')}
              />
              {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input-field ${errors.email ? 'ring-2 ring-rose-500/50 border-rose-500/50' : ''}`}
                placeholder="you@company.com"
                {...register('email')}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Password</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`input-field ${errors.password ? 'ring-2 ring-rose-500/50 border-rose-500/50' : ''}`}
                placeholder="Min 8 chars, uppercase + digit"
                {...register('password')}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label" htmlFor="confirm_password">
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Confirm Password</span>
              </label>
              <input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                className={`input-field ${errors.confirm_password ? 'ring-2 ring-rose-500/50 border-rose-500/50' : ''}`}
                placeholder="Repeat password"
                {...register('confirm_password')}
              />
              {errors.confirm_password && <p className="error-text">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By registering, you agree to use this system for legitimate hiring purposes.
        </p>
      </div>
    </div>
  );
}
