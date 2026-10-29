'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { recordAttendance, getRegistrations } from '@/lib/storage';
import { CheckCircle2, AlertCircle, ArrowLeft, Calendar, QrCode } from 'lucide-react';
import { EventRegistration } from '@/lib/types';

function ScanPresensiContent() {
  const searchParams = useSearchParams();
  const ticketParam = searchParams.get('ticket') || '';
  const [ticketInput, setTicketInput] = useState(ticketParam);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    registration?: EventRegistration;
  } | null>(null);

  const processAttendance = (code: string) => {
    if (!code.trim()) return;
    const res = recordAttendance(code.trim());
    setResult(res);
  };

  useEffect(() => {
    if (ticketParam) {
      processAttendance(ticketParam);
    }
  }, [ticketParam]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-[#1B3D7B] rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1E293B]">Validasi Presensi Kegiatan</h1>
          <p className="text-xs text-[#64748B] mt-1">
            PK PMII Universitas Ibrahimy Situbondo
          </p>
        </div>

        {result && (
          <div
            className={`p-4 rounded-lg border text-xs space-y-2 ${
              result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Presensi Sah &amp; Terverifikasi
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  Gagal Memvalidasi Tiket
                </>
              )}
            </div>
            <p className="leading-relaxed">{result.message}</p>

            {result.registration && (
              <div className="pt-2 border-t border-emerald-200/60 mt-2 space-y-1 text-[11px]">
                <p><strong>Nama:</strong> {result.registration.fullName}</p>
                <p><strong>NIM:</strong> {result.registration.nim}</p>
                <p><strong>Rayon:</strong> {result.registration.rayon}</p>
                <p><strong>Kegiatan:</strong> {result.registration.eventTitle}</p>
                <p><strong>Kode Tiket:</strong> {result.registration.qrTicketCode}</p>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            processAttendance(ticketInput);
          }}
          className="space-y-3 pt-2"
        >
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Kode Tiket Presensi / Barcode
            </label>
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Contoh: TCK-..."
              className="w-full border border-[#CBD5E1] rounded px-3 py-2 text-xs font-mono font-bold text-[#1E293B] focus:outline-none focus:border-[#1B3D7B]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-bold py-2.5 rounded transition-colors"
          >
            Verifikasi Kehadiran
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8EF] text-center">
          <Link
            href="/kegiatan"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portal Pelatihan
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PresensiScanPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-[#64748B]">Memuat pemindai...</div>}>
      <ScanPresensiContent />
    </Suspense>
  );
}
