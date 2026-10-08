'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import EKTAViewer from '@/components/EKTAViewer';
import { getRegistrations, getQuizAttempts } from '@/lib/storage';
import {
  CreditCard,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function KaderDashboardPage() {
  const router = useRouter();
  const { user, cadreProfile, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'kta' | 'pelatihan' | 'cbt'>('kta');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#64748B]">
        Memuat profil anggota...
      </div>
    );
  }

  // Ambil riwayat pendaftaran berdasarkan nama / nim kader
  const myRegistrations = getRegistrations().filter(
    (r) => r.nim === cadreProfile?.nim || r.fullName.toLowerCase() === cadreProfile?.fullName?.toLowerCase()
  );

  // Ambil riwayat ujian CBT
  const myAttempts = getQuizAttempts().filter(
    (a) => a.participantNim === cadreProfile?.nim || a.participantName.toLowerCase() === cadreProfile?.fullName?.toLowerCase()
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4A017] bg-[#F1F5F9] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                cadreProfile?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300'
              }
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1E293B]">
                {cadreProfile?.fullName || user.email}
              </h1>
              {cadreProfile?.isVerified ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Sah
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Verifikasi
                </span>
              )}
            </div>

            <p className="text-xs text-[#64748B] mt-0.5">
              NIM: <span className="font-mono font-semibold text-[#1E293B]">{cadreProfile?.nim || '-'}</span> • {cadreProfile?.rayonName || 'Rayon PMII UNIB'}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              {cadreProfile?.studyProgram} • Angkatan {cadreProfile?.entryYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href="/kader"
            className="text-xs border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] hover:text-[#1B3D7B] px-3.5 py-2 rounded font-medium transition-colors"
          >
            Direktori Kader
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E2E8EF]">
        <div className="flex gap-4">
          {[
            { id: 'kta', label: 'E-KTA Digital', icon: CreditCard },
            { id: 'pelatihan', label: 'Tiket & Pelatihan Saya', count: myRegistrations.length, icon: Calendar },
            { id: 'cbt', label: 'Riwayat Ujian CBT', count: myAttempts.length, icon: Award },
          ].map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#1B3D7B] text-[#1B3D7B]'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count !== undefined && (
                <span className="text-[10px] bg-[#F1F5F9] px-1.5 py-0.2 rounded font-mono text-[#64748B]">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: E-KTA */}
      {activeTab === 'kta' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <p className="text-[11px] font-bold text-[#D4A017] uppercase tracking-wider">
                  Kartu Tanda Anggota Digital
                </p>
                <h2 className="text-lg font-bold text-[#1E293B]">
                  Identitas Resmi Kader PMII Universitas Ibrahimy
                </h2>
                <p className="text-xs text-[#64748B]">
                  Gunakan kartu ini sebagai identitas resmi dan akses presensi kegiatan.
                </p>
              </div>

              {cadreProfile && <EKTAViewer cadre={cadreProfile} />}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pelatihan */}
      {activeTab === 'pelatihan' && (
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider">
              Pelatihan yang Diikuti
            </h2>
            <Link
              href="/kegiatan"
              className="text-xs text-[#1B3D7B] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Cari Pelatihan Baru <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] text-xs">
              <p>Anda belum terdaftar di kegiatan pelatihan manapun.</p>
              <Link href="/kegiatan" className="text-[#1B3D7B] underline mt-1.5 inline-block">
                Lihat agenda MAPABA / PKD
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRegistrations.map((r) => (
                <div
                  key={r.id}
                  className="border border-[#E2E8EF] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1B3D7B] transition-colors"
                >
                  <div className="space-y-1 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800'
                          : r.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.status === 'approved' ? 'Lolos Skrining' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                    </span>
                    <h3 className="font-bold text-sm text-[#1E293B]">{r.eventTitle}</h3>
                    <p className="text-[#64748B] font-mono text-[11px]">Kode Tiket: {r.qrTicketCode}</p>
                  </div>
                  <Link
                    href={`/kegiatan/tiket/${r.id}`}
                    className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors self-start sm:self-auto"
                  >
                    Buka E-Tiket Presensi
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Riwayat CBT */}
      {activeTab === 'cbt' && (
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider">
              Riwayat Skor Pre-Test & Post-Test
            </h2>
            <Link
              href="/kuis"
              className="text-xs text-[#1B3D7B] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Masuk Portal CBT <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myAttempts.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] text-xs">
              <p>Belum ada riwayat pengerjaan kuis CBT.</p>
              <Link href="/kuis" className="text-[#1B3D7B] underline mt-1.5 inline-block">
                Ikuti ujian latihan atau pre-test
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myAttempts.map((att) => (
                <div
                  key={att.id}
                  className="border border-[#E2E8EF] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        att.isPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {att.isPassed ? 'Lulus' : 'Belum Lulus'}
                    </span>
                    <h3 className="font-bold text-sm text-[#1E293B]">{att.quizTitle}</h3>
                    <p className="text-[#64748B]">
                      Benar {att.totalCorrect} dari {att.totalQuestions} butir soal
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1B3D7B]">{att.score}</div>
                    <div className="text-[10px] text-[#94A3B8]">Skor Akhir / 100</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
