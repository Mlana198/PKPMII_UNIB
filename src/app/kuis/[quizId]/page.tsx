'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { getQuizById } from '@/lib/storage';
import QuizEngine from '@/components/QuizEngine';
import { ArrowLeft } from 'lucide-react';

export default function QuizExecutionPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const quiz = getQuizById(quizId);

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-[#64748B]">
        <p className="text-sm">Paket soal ujian tidak ditemukan.</p>
        <Link href="/kuis" className="text-[#1B3D7B] text-xs underline mt-2 inline-block">
          Kembali ke portal kuis
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Link
        href="/kuis"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Keluar dari Lembar Ujian
      </Link>
      <QuizEngine quiz={quiz} />
    </div>
  );
}
