'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { getCadres } from '@/lib/storage';
import EKTAViewer from '@/components/EKTAViewer';
import { ArrowLeft } from 'lucide-react';

export default function CadreKtaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cadre = getCadres().find((c) => c.id === id);

  if (!cadre) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-[#64748B] text-sm">Data kader tidak ditemukan dalam sistem.</p>
        <Link href="/kader" className="text-[#1B3D7B] text-xs mt-2 underline inline-block">
          Kembali ke direktori anggota
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        href="/kader"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Database Kader
      </Link>

      <div className="text-center space-y-1">
        <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
          Kartu Tanda Anggota Digital
        </span>
        <h1 className="text-2xl font-bold text-[#1E293B]">
          E-KTA: {cadre.fullName}
        </h1>
        <p className="text-xs text-[#64748B]">
          PK PMII Universitas Ibrahimy Sukorejo Situbondo
        </p>
      </div>

      <EKTAViewer cadre={cadre} />

      <div className="bg-white border border-[#E2E8EF] rounded-lg p-4 text-xs text-[#64748B] max-w-md mx-auto shadow-sm">
        <p className="font-semibold text-[#1E293B] mb-1">Keabsahan Dokumen Digital</p>
        <p className="leading-relaxed">
          Kartu Tanda Anggota (E-KTA) ini diterbitkan secara sah oleh Pengurus Komisariat PMII Universitas Ibrahimy. Scan QR Code di atas menggunakan kamera smartphone untuk memverifikasi keaslian status keanggotaan.
        </p>
      </div>
    </div>
  );
}
