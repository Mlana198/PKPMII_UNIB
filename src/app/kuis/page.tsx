'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck, Award } from 'lucide-react';
import { getQuizzes } from '@/lib/storage';

export default function KuisIndexPage() {
  const quizzes = getQuizzes();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8EF] pb-6">
        <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
          Computer-Based Test (CBT)
        </p>
        <h1 className="text-3xl font-semibold text-[#1E293B]">
          Portal Ujian & Evaluasi Kaderisasi
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Sistem penilaian terpadu pre-test dan post-test untuk calon anggota & kader PK PMII Universitas Ibrahimy.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Clock,
            title: 'Timer Otomatis',
            desc: 'Waktu ujian presisi dengan auto-submit otomatis jika waktu telah habis.',
          },
          {
            icon: ShieldCheck,
            title: 'Pengawasan Anti-Curang',
            desc: 'Pencatatan pelanggaran saat peserta berganti layar browser atau membuka tab baru.',
          },
          {
            icon: Award,
            title: 'Skor & Pembahasan Instan',
            desc: 'Hasil ujian langsung keluar beserta kunci jawaban & penjelasan komprehensif.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-[#E2E8EF] rounded-lg p-5 shadow-sm">
            <Icon className="w-5 h-5 text-[#D4A017] mb-2.5" />
            <h3 className="font-semibold text-sm text-[#1E293B]">{title}</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Quiz list */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Daftar Paket Soal Ujian Tersedia
        </h2>

        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border border-[#E2E8EF] rounded-lg p-5 hover:border-[#1B3D7B] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      quiz.quizType === 'pre_test'
                        ? 'bg-blue-50 text-[#1B3D7B] border border-blue-200'
                        : quiz.quizType === 'post_test'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {quiz.quizType === 'pre_test'
                      ? 'Pre-Test'
                      : quiz.quizType === 'post_test'
                      ? 'Post-Test'
                      : 'Latihan'}
                  </span>
                  {quiz.eventTitle && (
                    <span className="text-xs text-[#64748B] font-medium">— {quiz.eventTitle}</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#1E293B]">{quiz.title}</h3>
                <p className="text-xs text-[#64748B]">
                  {quiz.questions.length} butir soal • Waktu: {quiz.durationMinutes} menit • Standar Kelulusan: {quiz.passingScore} poin
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/elibrary"
                  className="border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] hover:text-[#1B3D7B] text-xs font-medium px-3 py-2 rounded transition-colors"
                >
                  Pelajari Materi
                </Link>
                <Link
                  href={`/kuis/${quiz.id}`}
                  className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  Mulai Ujian <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
