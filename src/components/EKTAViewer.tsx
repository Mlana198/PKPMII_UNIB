'use client';

import React, { useState, useEffect } from 'react';
import { CadreProfile } from '@/lib/types';
import QRCode from 'qrcode';
import { Download, RotateCcw, CheckCircle } from 'lucide-react';
import { getLeadership } from '@/lib/leadership';

export default function EKTAViewer({ cadre }: { cadre: CadreProfile }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [leadership, setLeadership] = useState({ ketua: 'M. Rofiul Anam', sekretaris: 'Ahmad Wildan Zainur R' });

  useEffect(() => {
    setLeadership(getLeadership());
  }, []);

  useEffect(() => {
    QRCode.toDataURL(
      `https://pmii-unib.ac.id/kader/verifikasi?kta=${encodeURIComponent(cadre.ktaNumber)}`,
      { width: 140, margin: 1, color: { dark: '#1B3D7B', light: '#ffffff' } }
    )
      .then(setQrDataUrl)
      .catch(console.error);
  }, [cadre]);

  return (
    <div className="flex flex-col items-center gap-6 w-full no-print">
      {/* Control buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-1.5 border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] hover:text-[#1B3D7B] px-3.5 py-1.5 rounded text-xs font-medium transition-colors bg-white shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isFlipped ? 'Lihat Sisi Depan' : 'Lihat Sisi Belakang'}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold px-4 py-1.5 rounded text-xs transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Cetak Kartu PDF
        </button>
      </div>

      {/* 3D Flip Card */}
      <div id="printable-area" className="w-full max-w-[420px]" style={{ perspective: '1000px' }}>
        <div
          className="relative transition-transform duration-700 w-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            aspectRatio: '1.586',
          }}
        >
          {/* SISI DEPAN (FRONT) */}
          <div
            className="absolute inset-0 rounded-xl bg-[#1B3D7B] text-white p-5 flex flex-col justify-between overflow-hidden shadow-lg border border-[#122852]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Header KTA */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logos/komisariat.png" alt="Logo PK PMII UNIB" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-[#D4A017] text-[8px] font-bold tracking-widest uppercase">
                    Kartu Tanda Anggota Digital
                  </div>
                  <div className="text-white text-[11px] font-semibold leading-none mt-0.5">
                    PK PMII Universitas Ibrahimy
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">
                {cadre.cadreLevel}
              </span>
            </div>

            {/* Badan KTA */}
            <div className="flex items-center gap-4 my-auto">
              <div className="w-20 h-24 rounded border-2 border-[#D4A017] overflow-hidden bg-white/10 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    cadre.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300'
                  }
                  alt={cadre.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 flex-1 text-[10px]">
                <div>
                  <span className="text-white/50 text-[8px] uppercase tracking-wide">Nama Lengkap</span>
                  <div className="text-xs font-bold text-white leading-tight line-clamp-1">{cadre.fullName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-white/50 text-[8px] uppercase tracking-wide">NIM</span>
                    <div className="font-mono text-[#D4A017] font-semibold">{cadre.nim}</div>
                  </div>
                  <div>
                    <span className="text-white/50 text-[8px] uppercase tracking-wide">Angkatan</span>
                    <div className="text-white">{cadre.entryYear} {cadre.gender ? `(${cadre.gender === 'Perempuan' ? 'P' : 'L'})` : ''}</div>
                  </div>
                </div>
                <div>
                  <span className="text-white/50 text-[8px] uppercase tracking-wide">Rayon</span>
                  <div className="text-white font-medium line-clamp-1">{cadre.rayonName}</div>
                </div>
                <div>
                  <span className="text-white/50 text-[8px] uppercase tracking-wide">Program Studi</span>
                  <div className="text-white/90 line-clamp-1">{cadre.studyProgram}</div>
                </div>
              </div>
            </div>

            {/* Footer KTA */}
            <div className="flex items-center justify-between border-t border-white/15 pt-2">
              <div>
                <span className="text-white/40 text-[7px] uppercase tracking-widest">Nomor Anggota KTA</span>
                <div className="font-mono text-[#D4A017] text-[10px] font-bold">{cadre.ktaNumber}</div>
              </div>

              <div className="flex items-center gap-2">
                {cadre.isVerified && (
                  <span className="text-[8px] text-emerald-300 font-medium flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" /> Terverifikasi
                  </span>
                )}
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="QR Code" className="w-9 h-9 bg-white p-0.5 rounded shadow-sm" />
                )}
              </div>
            </div>
          </div>

          {/* SISI BELAKANG (BACK) */}
          <div
            className="absolute inset-0 rounded-xl bg-[#122852] text-white p-5 flex flex-col justify-between overflow-hidden shadow-lg border border-[#1B3D7B]"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center border-b border-white/15 pb-2">
              <span className="text-[#D4A017] text-[9px] font-bold uppercase tracking-widest">
                Nilai Dasar Pergerakan (NDP)
              </span>
            </div>

            <div className="space-y-1.5 text-[8.5px] text-white/80 leading-relaxed my-auto">
              <p>
                <strong className="text-[#D4A017]">1. Tauhid:</strong> Mengesakan Allah SWT sebagai episentrum keimanan dan orientasi pergerakan.
              </p>
              <p>
                <strong className="text-[#D4A017]">2. Hablum Minallah:</strong> Memelihara ketaatan ibadah vertikal secara istiqamah.
              </p>
              <p>
                <strong className="text-[#D4A017]">3. Hablum Minannas:</strong> Menegakkan keadilan sosial, kemanusiaan, dan persaudaraan sesama.
              </p>
              <p>
                <strong className="text-[#D4A017]">4. Hablum Minal Alam:</strong> Merawat kelestarian lingkungan dan semesta sebagai khalifah.
              </p>
            </div>

            <div className="border-t border-white/15 pt-2 flex items-end justify-between text-[7.5px] text-center">
              <div>
                <div className="text-white/40 mb-3">Ketua Komisariat,</div>
                <div className="text-white font-semibold underline">{leadership.ketua || 'M. Rofiul Anam'}</div>
              </div>
              <div className="text-center text-[6.5px] text-[#D4A017]/80 font-mono">
                PK PMII UNIB<br />SITUBONDO
              </div>
              <div>
                <div className="text-white/40 mb-3">Sekretaris,</div>
                <div className="text-white font-semibold underline">{leadership.sekretaris || 'Ahmad Wildan Zainur R'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
