'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-[#E2E8EF] rounded-xl p-8 text-center shadow-sm space-y-5">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Akses Dibatasi (Restricted)
          </span>
          <h1 className="text-xl font-bold text-[#1E293B] mt-2">
            Halaman Khusus Pengurus
          </h1>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Halaman ini memuat basis data keanggotaan dan administrasi internal yang hanya dapat diakses oleh Pengurus Komisariat / Administrator PK PMII Universitas Ibrahimy.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" /> Masuk Akun Pengurus
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-[#E2E8EF] text-[#64748B] hover:text-[#1E293B] hover:border-[#1B3D7B] text-xs font-medium px-4 py-2.5 rounded transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
