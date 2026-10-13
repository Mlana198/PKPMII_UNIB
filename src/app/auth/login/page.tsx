'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound, X, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyEmail, requestPasswordReset, resetPassword } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Verification modal state
  const [verifyModal, setVerifyModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Forgot password modal state
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'code' | 'newpass'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  /* ---------- LOGIN ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const cleanEmail = email.trim();
    const res = await login(cleanEmail, password);

    if (res.success) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      if (cleanEmail.includes('admin')) {
        router.push(redirectUrl || '/admin');
      } else {
        router.push(redirectUrl || '/kader/dashboard');
      }
    } else if (res.requireVerification) {
      setUnverifiedEmail(res.unverifiedEmail || cleanEmail);
      setVerifyModal(true);
      setSubmitting(false);
    } else {
      setErrorMsg(res.error || 'Email atau password salah.');
      setSubmitting(false);
    }
  };

  /* ---------- EMAIL VERIFICATION ---------- */
  const handleVerifyEmail = async () => {
    if (!verifyCode.trim()) {
      setVerifyError('Masukkan kode verifikasi terlebih dahulu.');
      return;
    }
    setVerifyLoading(true);
    setVerifyError(null);
    const res = await verifyEmail(unverifiedEmail, verifyCode.trim());
    setVerifyLoading(false);
    if (res.success) {
      setVerifySuccess(true);
      setTimeout(() => {
        setVerifyModal(false);
        router.push('/kader/dashboard');
      }, 1500);
    } else {
      setVerifyError(res.error || 'Kode verifikasi salah atau sudah kedaluwarsa.');
    }
  };

  /* ---------- FORGOT PASSWORD ---------- */
  const handleForgotRequestCode = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Masukkan email akun Anda.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    const res = await requestPasswordReset(forgotEmail.trim());
    setForgotLoading(false);
    if (res.success && res.code) {
      setSentCode(res.code);
      setForgotStep('code');
    } else {
      setForgotError(res.error || 'Email tidak ditemukan dalam sistem.');
    }
  };

  const handleForgotVerifyCode = () => {
    if (forgotCode.trim() !== sentCode) {
      setForgotError('Kode OTP tidak sesuai. Periksa kembali.');
      return;
    }
    setForgotError(null);
    setForgotStep('newpass');
  };

  const handleForgotResetPassword = async () => {
    if (newPassword.length < 6) {
      setForgotError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    const res = await resetPassword(forgotEmail.trim(), newPassword);
    setForgotLoading(false);
    if (res.success) {
      setForgotDone(true);
      setTimeout(() => {
        setForgotModal(false);
        setForgotStep('email');
        setForgotEmail('');
        setForgotCode('');
        setSentCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotDone(false);
      }, 2000);
    } else {
      setForgotError(res.error || 'Gagal mereset kata sandi.');
    }
  };

  const closeForgotModal = () => {
    setForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotCode('');
    setSentCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError(null);
    setForgotDone(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-md bg-white border border-[#E2E8EF] rounded-xl p-7 sm:p-9 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto flex items-center justify-center p-1 bg-white rounded-xl shadow-sm border border-[#E2E8EF]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logos/komisariat.png" alt="Logo PK PMII UNIB" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Masuk ke Portal Kader</h1>
          <p className="text-xs text-[#64748B]">PK PMII Universitas Ibrahimy Sukorejo Situbondo</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Email Akun Kader *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-[#E2E8EF] rounded pl-9 pr-3.5 py-2.5 text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Password + show/hide */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Kata Sandi *
              </label>
              <button
                type="button"
                onClick={() => { setForgotModal(true); setForgotEmail(email); }}
                className="text-[10px] text-[#1B3D7B] hover:underline cursor-pointer"
              >
                Lupa sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#E2E8EF] rounded pl-9 pr-10 py-2.5 text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B3D7B] transition-colors"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? 'Memeriksa...' : 'Masuk Sekarang'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Register link */}
        <div className="pt-4 border-t border-[#E2E8EF] text-center text-xs text-[#64748B]">
          Belum memiliki akun kader?{' '}
          <Link href="/auth/register" className="text-[#1B3D7B] font-semibold hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>

      {/* ====== Modal: Verifikasi Email ====== */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-7 space-y-5">
            {verifySuccess ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-[#1E293B]">Email Berhasil Diverifikasi!</p>
                <p className="text-xs text-[#64748B]">Anda akan diarahkan ke dashboard...</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-[#1E293B]">Verifikasi Email</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Masukkan kode 6 digit yang dikirim ke <strong>{unverifiedEmail}</strong>
                    </p>
                    <p className="text-[11px] text-amber-600 mt-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                      💡 Kode verifikasi ditampilkan saat pendaftaran (simulasi — tidak dikirim via email).
                    </p>
                  </div>
                  <button onClick={() => setVerifyModal(false)} className="text-[#94A3B8] hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {verifyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2.5 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {verifyError}
                  </div>
                )}

                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan 6 digit kode"
                  className="w-full border border-[#E2E8EF] rounded px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.4em] focus:outline-none focus:border-[#1B3D7B]"
                />

                <button
                  onClick={handleVerifyEmail}
                  disabled={verifyLoading}
                  className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-2.5 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {verifyLoading ? 'Memverifikasi...' : 'Verifikasi Email'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ====== Modal: Lupa Password ====== */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-7 space-y-5">
            {forgotDone ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-[#1E293B]">Kata Sandi Berhasil Direset!</p>
                <p className="text-xs text-[#64748B]">Silakan login dengan kata sandi baru Anda.</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-[#1E293B] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#1B3D7B]" />
                      {forgotStep === 'email' && 'Lupa Kata Sandi'}
                      {forgotStep === 'code' && 'Masukkan Kode OTP'}
                      {forgotStep === 'newpass' && 'Buat Kata Sandi Baru'}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {forgotStep === 'email' && 'Masukkan email yang terdaftar di akun Anda.'}
                      {forgotStep === 'code' && `Kode OTP 6 digit dikirim ke ${forgotEmail}`}
                      {forgotStep === 'newpass' && 'Buat kata sandi baru yang kuat (minimal 6 karakter).'}
                    </p>
                    {forgotStep === 'code' && sentCode && (
                      <p className="text-[11px] text-amber-600 mt-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                        💡 Kode OTP (simulasi): <strong className="font-mono">{sentCode}</strong>
                      </p>
                    )}
                  </div>
                  <button onClick={closeForgotModal} className="text-[#94A3B8] hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2.5 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {forgotError}
                  </div>
                )}

                {/* Step 1: Email */}
                {forgotStep === 'email' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full border border-[#E2E8EF] rounded pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B]"
                      />
                    </div>
                    <button
                      onClick={handleForgotRequestCode}
                      disabled={forgotLoading}
                      className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-2.5 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {forgotLoading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}
                    </button>
                  </div>
                )}

                {/* Step 2: Kode OTP */}
                {forgotStep === 'code' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Masukkan 6 digit kode"
                      className="w-full border border-[#E2E8EF] rounded px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.4em] focus:outline-none focus:border-[#1B3D7B]"
                    />
                    <button
                      onClick={handleForgotVerifyCode}
                      className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-2.5 rounded text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verifikasi Kode
                    </button>
                    <button
                      onClick={() => setForgotStep('email')}
                      className="w-full text-xs text-[#64748B] hover:text-[#1B3D7B] underline"
                    >
                      Kembali & ganti email
                    </button>
                  </div>
                )}

                {/* Step 3: Password Baru */}
                {forgotStep === 'newpass' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Kata sandi baru (min. 6 karakter)"
                        className="w-full border border-[#E2E8EF] rounded pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B3D7B]"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full border border-[#E2E8EF] rounded px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B]"
                    />
                    <button
                      onClick={handleForgotResetPassword}
                      disabled={forgotLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {forgotLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
