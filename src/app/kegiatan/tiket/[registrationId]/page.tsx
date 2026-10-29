'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getRegistrations, getEvents, recordAttendance } from '@/lib/storage';
import QRCode from 'qrcode';
import { CheckCircle, Download, ArrowLeft, MessageCircle, ExternalLink, QrCode as QrIcon } from 'lucide-react';

export default function TicketPage() {
  const params = useParams();
  const registrationId = params?.registrationId as string;
  const [reg, setReg] = useState(() => getRegistrations().find((r) => r.id === registrationId));
  const [event, setEvent] = useState(() => {
    const curReg = getRegistrations().find((r) => r.id === registrationId);
    return getEvents().find((e) => e.id === curReg?.eventId);
  });
  const [qrUrl, setQrUrl] = useState('');
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!registrationId) return;
    const foundReg = getRegistrations().find((r) => r.id === registrationId);
    if (foundReg) {
      setReg(foundReg);
      const foundEvent = getEvents().find((e) => e.id === foundReg.eventId);
      if (foundEvent) setEvent(foundEvent);

      // Generate QR Code URL yang dapat di-scan langsung menggunakan kamera smartphone
      // Link mengarah ke verifikasi presensi publik: /presensi/scan?ticket=...
      const scanUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/presensi/scan?ticket=${foundReg.qrTicketCode}`
        : `https://pkpmii-unib.vercel.app/presensi/scan?ticket=${foundReg.qrTicketCode}`;

      QRCode.toDataURL(scanUrl, {
        width: 240,
        margin: 2,
        color: { dark: '#1B3D7B', light: '#ffffff' },
      })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [registrationId]);

  if (!reg) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-[#64748B]">
        <p className="text-sm">Tiket pendaftaran tidak ditemukan.</p>
        <Link href="/kegiatan" className="text-[#1B3D7B] text-xs underline mt-2 inline-block">
          Kembali ke agenda
        </Link>
      </div>
    );
  }

  const handleSimulateScan = () => {
    const res = recordAttendance(reg.qrTicketCode);
    setVerifyMessage(res.message);
    if (res.registration) {
      setReg(res.registration);
    }
    setTimeout(() => setVerifyMessage(null), 5000);
  };

  const waLink = event?.whatsappGroupUrl?.trim() || 'https://chat.whatsapp.com/demo';

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8 no-print">
        <Link
          href="/kegiatan"
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Agenda
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs text-[#1B3D7B] border border-[#1B3D7B] hover:bg-[#1B3D7B] hover:text-white px-3 py-1.5 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Cetak Tiket PDF
          </button>
        </div>
      </div>

      <div id="printable-area" className="bg-white border-2 border-[#1B3D7B] rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#1B3D7B] text-white px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded bg-[#D4A017] flex items-center justify-center shrink-0">
              <span className="text-[#1B3D7B] font-extrabold text-[10px]">PMII</span>
            </div>
            <div>
              <p className="text-[#D4A017] text-[9px] font-bold uppercase tracking-widest">
                E-Ticket &amp; Bukti Pendaftaran
              </p>
              <p className="text-white font-semibold text-sm">
                PK PMII Universitas Ibrahimy
              </p>
            </div>
          </div>
          <p className="text-white/80 text-xs mt-2 font-medium line-clamp-2">
            {reg.eventTitle}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex items-start gap-4">
          <div className="flex-1 space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Nama Peserta</span>
              <p className="text-sm font-bold text-[#1E293B]">{reg.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider">NIM</span>
                <p className="font-mono text-[#1E293B] font-semibold">{reg.nim}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Rayon</span>
                <p className="text-[#1E293B] font-medium">{reg.rayon}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Kode Tiket Presensi</span>
              <p className="font-mono text-[#D4A017] text-sm font-bold">{reg.qrTicketCode}</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Pendaftaran Terverifikasi
              </div>
              {reg.attendanceStatus === 'hadir' && (
                <div className="text-blue-700 font-semibold text-[11px] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-block">
                  ✓ Sudah Hadir Presensi
                </div>
              )}
            </div>
          </div>

          {qrUrl && (
            <div className="shrink-0 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Presensi" className="w-28 h-28 border border-[#E2E8EF] rounded p-1 bg-white shadow-sm" />
              <span className="text-[9px] text-[#64748B] mt-1 font-medium">Scan Kamera Presensi</span>
            </div>
          )}
        </div>

        {verifyMessage && (
          <div className="mx-6 mb-4 p-2.5 bg-blue-50 border border-blue-200 text-[#1B3D7B] text-xs rounded font-medium text-center">
            {verifyMessage}
          </div>
        )}

        {/* Action strip */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8EF] px-6 py-4 no-print space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex-1 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Gabung Grup Peserta
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
            {event?.preTestId && (
              <Link
                href={`/kuis/${event.preTestId}`}
                className="flex items-center justify-center bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] text-xs font-bold px-4 py-2 rounded transition-colors flex-1"
              >
                Kerjakan Pre-Test CBT
              </Link>
            )}
          </div>

          {/* Tombol Simulasikan / Uji Scan untuk Panitia & Peserta */}
          <div className="pt-2 border-t border-[#E2E8EF] flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Uji presensi via barcode:</span>
            <button
              onClick={handleSimulateScan}
              className="inline-flex items-center gap-1 text-[#1B3D7B] hover:underline font-semibold bg-white border border-[#CBD5E1] px-2.5 py-1 rounded shadow-xs"
            >
              <QrIcon className="w-3.5 h-3.5" /> Cek / Validasi Scan Barcode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
