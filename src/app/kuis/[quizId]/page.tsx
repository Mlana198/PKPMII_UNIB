'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getQuizById, getQuizzes } from '@/lib/storage';
import { Quiz } from '@/lib/types';
import QuizEngine from '@/components/QuizEngine';
import { ArrowLeft } from 'lucide-react';

export default function QuizExecutionPage({
  params,
}: {
  params: Promise<{ quizId: string }> | { quizId: string };
}) {
  // Dukung Promise params (Next.js 15+) maupun sync params
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params as Promise<{ quizId: string }>) : (params as { quizId: string });
  const quizId = resolvedParams?.quizId;

  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!quizId) {
      setQuiz(null);
      return;
    }
    const found = getQuizById(quizId);
    setQuiz(found || null);
    if (!found) {
      setAvailableQuizzes(getQuizzes());
    }
  }, [quizId]);

  if (quiz === undefined) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-xs text-[#64748B]">
        Memuat lembar ujian CBT...
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1E293B]">Paket Soal Ujian Tidak Ditemukan</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Paket soal dengan ID <code className="bg-slate-100 text-[#1B3D7B] px-1.5 py-0.5 rounded font-mono text-[11px]">{quizId}</code> mungkin belum dibuat atau telah diperbarui oleh admin.
          </p>
        </div>

        {availableQuizzes.length > 0 && (
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-4 text-left shadow-sm space-y-2.5">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Paket Soal Ujian yang Tersedia:
            </p>
            <div className="space-y-2">
              {availableQuizzes.map((q) => (
                <Link
                  key={q.id}
                  href={`/kuis/${q.id}`}
                  className="block p-3 rounded border border-[#E2E8EF] hover:border-[#1B3D7B] hover:bg-blue-50/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E293B]">{q.title}</span>
                    <span className="text-[10px] font-semibold text-[#1B3D7B] bg-blue-50 px-2 py-0.5 rounded">
                      {q.quizType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {q.questions.length} Soal • {q.durationMinutes} Menit • KKM {q.passingScore}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link
            href="/kuis"
            className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portal Kuis
          </Link>
        </div>
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
