import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { authAPI } from '../services/api';

const schema = z.object({
  full_name:        z.string().min(2, 'Name must be at least 2 characters.').optional().or(z.literal('')),
  current_password: z.string().optional(),
  new_password:     z.string().min(8).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const ROLE_COLORS: Record<string, string> = {
  admin:     'badge-warning',
  recruiter: 'badge-info',
  candidate: 'badge-success',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: user?.full_name ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    setSaveStatus('saving');
    setErrorMsg('');
    const payload: Record<string, string> = {};
    if (data.full_name)        payload.full_name = data.full_name;
    if (data.new_password)     payload.new_password = data.new_password;
    if (data.current_password) payload.current_password = data.current_password;

    try {
      await authAPI.updateMe(payload);
      setSaveStatus('success');
      reset({ full_name: data.full_name, current_password: '', new_password: '' });
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Update failed.';
      setErrorMsg(msg);
      setSaveStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-1">Profile Settings</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your account information and password.</p>

      {/* Account Summary */}
      <div className="glass-card p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-accent-purple rounded-xl flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{user?.full_name}</p>
          <p className="text-sm text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
          <span className={`mt-1 inline-block ${ROLE_COLORS[user?.role ?? 'candidate'] ?? 'badge-info'}`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Update Information</h2>

        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-emerald-400 text-sm">Profile updated successfully.</p>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <p className="text-rose-400 text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className={`input-field ${errors.full_name ? 'ring-2 ring-rose-500/50' : ''}`}
              {...register('full_name')}
            />
            {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
          </div>

          <div className="divider" />
          <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password (leave blank to keep current)
          </p>

          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Your current password"
              {...register('current_password')}
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className={`input-field ${errors.new_password ? 'ring-2 ring-rose-500/50' : ''}`}
              placeholder="Min 8 characters"
              {...register('new_password')}
            />
            {errors.new_password && <p className="error-text">{errors.new_password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="btn-primary flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4" />Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Account Details */}
      <div className="glass-card p-6 mt-4">
        <h2 className="text-sm font-semibold text-white mb-3">Account Details</h2>
        {[
          { label: 'Account ID',    value: `#${user?.id}` },
          { label: 'Role',          value: user?.role?.charAt(0).toUpperCase() + (user?.role?.slice(1) ?? '') },
          { label: 'Status',        value: user?.is_active ? 'Active' : 'Inactive' },
          { label: 'Member Since',  value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-sm text-white font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
