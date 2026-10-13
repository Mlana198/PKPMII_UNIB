'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizAttempt } from '@/lib/types';
import { saveQuizAttempt } from '@/lib/storage';
import { Clock, AlertTriangle, RotateCcw, BookOpen, ArrowRight, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function QuizEngine({ quiz }: { quiz: Quiz }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantNim, setParticipantNim] = useState('');
  const [participantRayon, setParticipantRayon] = useState('Rayon Raden Rahmat');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [violations, setViolations] = useState(0);
  const [violationAlert, setViolationAlert] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = useCallback(() => {
    setShowConfirm(false);
    let total = 0;
    let max = 0;
    let correct = 0;

    quiz.questions.forEach((q) => {
      max += q.points;
      if (answers[q.id] === q.correctOptionId) {
        total += q.points;
        correct++;
      }
    });

    const score = max > 0 ? Math.round((total / max) * 100) : 0;
    const attempt: Omit<QuizAttempt, 'id'> = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizType: quiz.quizType,
      participantName: participantName || 'Kader PMII UNIB',
      participantNim: participantNim || '2026001',
      participantRayon,
      answers,
      score,
      maxScore: 100,
      totalCorrect: correct,
      totalQuestions: quiz.questions.length,
      isPassed: score >= quiz.passingScore,
      startedAt: new Date(Date.now() - (quiz.durationMinutes * 60 - timeLeft) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      tabSwitchViolations: violations,
    };

    setAttemptResult(saveQuizAttempt(attempt));
    setIsCompleted(true);
  }, [answers, participantName, participantNim, participantRayon, quiz, timeLeft, violations]);

  useEffect(() => {
    if (!hasStarted || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isCompleted, handleSubmit]);

  // Anti-cheat tab switch detector
  useEffect(() => {
    if (!hasStarted || isCompleted) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const next = prev + 1;
          setViolationAlert(`Peringatan: Terdeteksi meninggalkan layar ujian (${next}x)`);
          setTimeout(() => setViolationAlert(null), 4000);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [hasStarted, isCompleted]);

  const fmtTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const q = quiz.questions?.[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const inputClass =
    'w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]';

  // Guard: Jika paket soal belum memiliki butir pertanyaan
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E2E8EF] rounded-lg p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#1E293B]">{quiz.title}</h2>
        <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
          Paket ujian ini belum memiliki butir soal yang diinput oleh panitia/instruktur kaderisasi. Silakan hubungi admin komisariat atau kembali ke daftar kuis.
        </p>
        <div className="pt-2">
          <Link
            href="/kuis"
            className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portal Kuis
          </Link>
        </div>
      </div>
    );
  }

  // 1. FORM PRA-UJIAN
  if (!hasStarted) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E2E8EF] rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              quiz.quizType === 'pre_test'
                ? 'bg-blue-50 text-[#1B3D7B]'
                : quiz.quizType === 'post_test'
                ? 'bg-amber-50 text-amber-800'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {quiz.quizType === 'pre_test'
              ? 'Pre-Test'
              : quiz.quizType === 'post_test'
              ? 'Post-Test'
              : 'Latihan'}
          </span>
          <h1 className="text-xl font-bold text-[#1E293B] mt-2">{quiz.title}</h1>
          <p className="text-xs text-[#64748B] mt-1">{quiz.description}</p>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded p-4 text-xs space-y-1.5">
          <p className="font-semibold text-[#1B3D7B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Ketentuan & Tata Tertib Ujian
          </p>
          {quiz.instructions.map((ins, i) => (
            <p key={i} className="text-[#475569]">
              • {ins}
            </p>
          ))}
          <p className="text-[#475569] font-medium pt-1">
            • Jumlah Soal: {quiz.questions.length} butir | Waktu: {quiz.durationMinutes} menit | Standar Lulus: {quiz.passingScore} poin
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!participantName.trim() || !participantNim.trim()) {
              alert('Harap lengkapi nama dan NIM terlebih dahulu.');
              return;
            }
            setHasStarted(true);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              Nama Lengkap Peserta *
            </label>
            <input
              type="text"
              required
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Ketik nama lengkap"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                NIM *
              </label>
              <input
                type="text"
                required
                value={participantNim}
                onChange={(e) => setParticipantNim(e.target.value)}
                placeholder="Nomor induk mahasiswa"
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Rayon Asal *
              </label>
              <select
                value={participantRayon}
                onChange={(e) => setParticipantRayon(e.target.value)}
                className={inputClass}
              >
                <option value="Rayon Raden Rahmat">Rayon Raden Rahmat (Saintek)</option>
                <option value="Rayon Raden Umar Said">Rayon Raden Umar Said (Tarbiyah)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Mulai Ujian Sekarang ({quiz.durationMinutes} Menit) <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // 2. HASIL UJIAN
  if (isCompleted && attemptResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div
          className={`bg-white border-2 rounded-lg p-6 sm:p-8 text-center shadow-sm ${
            attemptResult.isPassed ? 'border-emerald-500' : 'border-amber-400'
          }`}
        >
          <div
            className={`inline-flex p-3 rounded-full mb-3 ${
              attemptResult.isPassed ? 'bg-emerald-50' : 'bg-amber-50'
            }`}
          >
            {attemptResult.isPassed ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            ) : (
              <XCircle className="w-10 h-10 text-amber-600" />
            )}
          </div>
          <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-semibold mb-1">
            Hasil Ujian CBT PMII UNIB
          </p>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
            {attemptResult.isPassed ? 'Selamat, Anda Lulus!' : 'Belum Memenuhi Passing Grade'}
          </h2>
          <p className="text-[#64748B] text-xs max-w-md mx-auto mb-6">
            {attemptResult.isPassed
              ? 'Anda telah menunjukkan pemahaman materi kaderisasi dengan sangat baik.'
              : `Batas minimal kelulusan adalah ${quiz.passingScore} poin. Anda dapat mempelajari modul di E-Library.`}
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto mb-6">
            <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded p-3">
              <span className="text-[10px] text-[#64748B] uppercase">Nilai</span>
              <p className="text-xl font-bold text-[#D4A017]">{attemptResult.score}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded p-3">
              <span className="text-[10px] text-[#64748B] uppercase">Benar</span>
              <p className="text-xl font-bold text-emerald-600">
                {attemptResult.totalCorrect}/{attemptResult.totalQuestions}
              </p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded p-3">
              <span className="text-[10px] text-[#64748B] uppercase">Passing</span>
              <p className="text-xl font-bold text-[#1B3D7B]">{quiz.passingScore}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded p-3">
              <span className="text-[10px] text-[#64748B] uppercase">Pindah Tab</span>
              <p
                className={`text-xl font-bold ${
                  attemptResult.tabSwitchViolations > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {attemptResult.tabSwitchViolations}x
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href="/kuis"
              className="border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] hover:text-[#1B3D7B] px-4 py-2 rounded text-xs transition-colors"
            >
              Kembali ke Portal
            </Link>
            <button
              onClick={() => {
                setHasStarted(false);
                setIsCompleted(false);
                setAnswers({});
                setCurrentIndex(0);
                setTimeLeft(quiz.durationMinutes * 60);
              }}
              className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold px-4 py-2 rounded text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ulangi Ujian
            </button>
          </div>
        </div>

        {/* Pembahasan Soal */}
        <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-xs text-[#1B3D7B] uppercase tracking-wider pb-3 border-b border-[#E2E8EF]">
            Kunci Jawaban & Pembahasan Materi
          </h3>
          <div className="space-y-4">
            {quiz.questions.map((item, idx) => {
              const userAns = attemptResult.answers[item.id];
              const isCorrect = userAns === item.correctOptionId;

              return (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 text-xs ${
                    isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#64748B]">
                      Soal #{idx + 1} • {item.category}
                    </span>
                    <span
                      className={`font-bold ${
                        isCorrect ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {isCorrect ? `+${item.points} Poin` : '0 Poin'}
                    </span>
                  </div>

                  <p className="font-medium text-[#1E293B] text-sm mb-3">
                    {item.questionText}
                  </p>

                  <div className="space-y-1.5 mb-3">
                    {item.options.map((opt) => {
                      const optIsUser = opt.id === userAns;
                      const optIsCorrect = opt.id === item.correctOptionId;

                      return (
                        <div
                          key={opt.id}
                          className={`px-3 py-2 rounded flex justify-between items-center text-xs ${
                            optIsCorrect
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : optIsUser && !isCorrect
                              ? 'bg-red-100 text-red-700 line-through'
                              : 'bg-[#F8FAFC] text-[#64748B]'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {optIsCorrect && <span className="text-[10px]">✓ Kunci</span>}
                          {optIsUser && !optIsCorrect && <span className="text-[10px]">✗ Jawaban Anda</span>}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="text-[#475569] bg-[#F8FAFC] border border-[#E2E8EF] rounded p-2.5 text-[11px]">
                      <strong className="text-[#1B3D7B]">Pembahasan: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. LEMBAR UJIAN AKTIF
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Violation Alert Banner */}
      {violationAlert && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{violationAlert}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border border-[#E2E8EF] rounded-lg px-5 py-3 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] text-[#D4A017] uppercase tracking-wider font-bold">
            {quiz.title}
          </span>
          <p className="text-xs font-semibold text-[#1E293B]">
            {participantName} • {participantNim}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold ${
              timeLeft < 180
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-[#F8FAFC] text-[#1B3D7B] border border-[#E2E8EF]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> {fmtTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-sm"
          >
            Selesaikan
          </button>
        </div>
      </div>

      {/* Soal & Navigasi */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Kolom Soal */}
        <div className="lg:col-span-3 bg-white border border-[#E2E8EF] rounded-lg p-6 flex flex-col justify-between shadow-sm min-h-[360px]">
          <div>
            <div className="flex justify-between items-center border-b border-[#E2E8EF] pb-3 mb-4">
              <span className="text-xs font-bold text-[#1B3D7B] bg-blue-50 px-2.5 py-0.5 rounded">
                Soal {currentIndex + 1} dari {quiz.questions.length}
              </span>
              <span className="text-xs text-[#64748B] font-medium">{q?.category}</span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-[#1E293B] mb-5 leading-relaxed">
              {q?.questionText || 'Soal tidak ditemukan'}
            </p>

            <div className="space-y-2.5 mb-6">
              {q?.options?.map((opt) => {
                const isSelected = q ? answers[q.id] === opt.id : false;
                return (
                  <button
                    key={opt.id}
                    onClick={() => q && setAnswers({ ...answers, [q.id]: opt.id })}
                    className={`w-full text-left px-4 py-3 rounded border text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'border-[#1B3D7B] bg-blue-50 text-[#1B3D7B] font-semibold'
                        : 'border-[#E2E8EF] text-[#334155] hover:border-[#1B3D7B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between border-t border-[#E2E8EF] pt-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1B3D7B] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Soal Sebelumnya
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="inline-flex items-center gap-1 text-xs text-[#1B3D7B] font-semibold hover:underline"
              >
                Soal Selanjutnya <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-1 text-xs bg-[#1B3D7B] text-white font-semibold px-4 py-2 rounded transition-colors shadow-sm hover:bg-[#122852]"
              >
                Kirim Ujian <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Kolom Nomor Soal */}
        <div className="lg:col-span-1 bg-white border border-[#E2E8EF] rounded-lg p-4 shadow-sm h-fit">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Navigasi Nomor Soal
          </p>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {quiz.questions.map((item, idx) => {
              const isAnswered = Boolean(answers[item.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 rounded text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-[#1B3D7B] text-white shadow-sm'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8EF] hover:border-[#1B3D7B]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-[#64748B] space-y-1.5 pt-2 border-t border-[#E2E8EF]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#1B3D7B]"></span> Sedang Dibuka
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-200"></span> Terjawab
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#F8FAFC] border border-[#E2E8EF]"></span> Belum Terjawab
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8EF] text-xs text-[#64748B] font-medium text-center">
            {answeredCount} dari {quiz.questions.length} terjawab
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8EF] rounded-lg max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-[#1E293B]">Selesaikan Ujian?</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Anda telah menjawab <strong>{answeredCount}</strong> dari{' '}
              <strong>{quiz.questions.length}</strong> butir soal.
              {answeredCount < quiz.questions.length && (
                <span className="text-amber-700 block mt-1">
                  Masih terdapat {quiz.questions.length - answeredCount} butir soal yang belum Anda jawab.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="border border-[#E2E8EF] text-[#64748B] px-3.5 py-1.5 rounded text-xs hover:border-[#1B3D7B] transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold px-4 py-1.5 rounded text-xs transition-colors shadow-sm"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
