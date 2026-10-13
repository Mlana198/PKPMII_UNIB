'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    } else {
      setErrorMsg(res.error || 'Email atau password salah.');
      setSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-[#1E293B]">
            Masuk ke Portal Kader
          </h1>
          <p className="text-xs text-[#64748B]">
            PK PMII Universitas Ibrahimy Sukorejo Situbondo
          </p>
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Kata Sandi *
              </label>
              <span className="text-[10px] text-[#1B3D7B] hover:underline cursor-pointer">
                Lupa sandi?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#E2E8EF] rounded pl-9 pr-3.5 py-2.5 text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]"
              />
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
    </div>
  );
}
