'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { apiRequest } from '@/lib/api-client';
import { Lock, User, ArrowRight, AlertCircle, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [identifier, setIdentifier] = useState('jelvis');
  const [password, setPassword] = useState('Buddhabca5');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Monthly Password Change modal state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [tempUser, setTempUser] = useState<any>(null);
  const [tempWsId, setTempWsId] = useState<string>('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiRequest<{
        access_token: string;
        refresh_token: string;
        requires_password_change: boolean;
        message?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: identifier, password }),
      });

      localStorage.setItem('nexus_token', data.access_token);

      // Fetch User Info
      const user = await apiRequest<{ id: string; email: string; full_name: string }>('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      // Fetch Workspaces
      const workspaces = await apiRequest<Array<{ id: string }>>('/workspaces', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      const wsId = workspaces[0]?.id || 'default';
      localStorage.setItem('nexus_workspace_id', wsId);

      // Check if monthly password change is required (> 30 days)
      if (data.requires_password_change) {
        setTempToken(data.access_token);
        setTempUser(user);
        setTempWsId(wsId);
        setOldPassword(password);
        setShowPasswordChangeModal(true);
        return;
      }

      setAuth(data.access_token, user, wsId);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.length < 6) {
      setPasswordChangeError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      alert('Kata sandi bulanan Anda berhasil diperbarui!');
      setAuth(tempToken, tempUser, tempWsId);
      setShowPasswordChangeModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Gagal memperbarui kata sandi bulanan.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
            NX
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NEXUS WORKSPACE</h1>
          <p className="text-xs text-slate-500">Masuk ke akun ruang kerja produktivitas Anda</p>
        </div>

        {/* Quick Credential Hint Box */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
          <span className="font-bold flex items-center gap-1 text-blue-700">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Kredensial Default Login Database:</span>
          </span>
          <div className="font-mono text-[11px] text-slate-700">
            Username: <strong className="text-blue-800">jelvis</strong> | Password: <strong className="text-blue-800">Buddhabca5</strong>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Username / Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="jelvis atau email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password (Kata Sandi)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Sedang Masuk...' : 'Masuk Aplikasi (Sign In)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Buat akun baru
          </Link>
        </div>
      </div>

      {/* MANDATORY MONTHLY PASSWORD CHANGE MODAL */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-6 h-6" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Ganti Kata Sandi Bulanan Wajib</h3>
                <p className="text-[11px] text-slate-500">Masa berlaku kata sandi telah melebihi 30 hari. Mohon perbarui kata sandi Anda.</p>
              </div>
            </div>

            {passwordChangeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordChangeError}</span>
              </div>
            )}

            <form onSubmit={handleMonthlyPasswordChange} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kata Sandi Lama</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Perbarui Kata Sandi & Lanjut ke Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
