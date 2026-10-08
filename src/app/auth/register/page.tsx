'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { getRayons } from '@/lib/storage';
import { FormalCadreLevel } from '@/lib/types';
import { Lock, Mail, User, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const rayons = getRayons();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [rayonId, setRayonId] = useState(rayons[0]?.id || 'ryn-1');
  const [studyProgram, setStudyProgram] = useState('');
  const [entryYear, setEntryYear] = useState(2024);
  const [cadreLevel, setCadreLevel] = useState<FormalCadreLevel>('MAPABA');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSubmitting(true);
    const selectedRayonObj = rayons.find((r) => r.id === rayonId);

    const res = await register(email, password, {
      fullName,
      nim,
      university: 'Universitas Ibrahimy',
      rayonId,
      rayonName: selectedRayonObj?.name || 'Rayon Raden Rahmat',
      faculty: selectedRayonObj?.faculty || 'Fakultas Sains dan Teknologi',
      studyProgram,
      entryYear: Number(entryYear),
      mapabaYear: Number(entryYear),
      cadreLevel,
      phoneNumber,
      email,
    });

    if (res.success) {
      router.push('/kader/dashboard');
    } else {
      setErrorMsg(res.error || 'Gagal mendaftar. Silakan coba kembali.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-[#E2E8EF] rounded px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-9 shadow-sm space-y-6">
        {/* Header */}
        <div>
          <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
            Registrasi Akun Anggota
          </span>
          <h1 className="text-2xl font-bold text-[#1E293B] mt-1">
            Daftar Akun Kader PMII UNIB
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Buat akun untuk mengakses Kartu Tanda Anggota (E-KTA) Digital dan portal ujian CBT.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section: Akun Login */}
          <div className="border-b border-[#E2E8EF] pb-4 space-y-3">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> 1. Kredensial Akun
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Email Aktif *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Kata Sandi *
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Ulangi Kata Sandi *
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section: Biodata Kader */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 2. Data Keanggotaan & Akademik
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Nama Lengkap Sesuai KTM *
              </label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Nomor Induk Mahasiswa (NIM) *
                </label>
                <input
                  required
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Contoh: 240501110077"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  required
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Rayon Binaan *
                </label>
                <select
                  value={rayonId}
                  onChange={(e) => setRayonId(e.target.value)}
                  className={inputClass}
                >
                  {rayons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Program Studi *
                </label>
                <input
                  required
                  type="text"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder="Contoh: Teknologi Informasi / PAI"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Tahun Angkatan Kuliah
                </label>
                <input
                  type="number"
                  min={2018}
                  max={2030}
                  value={entryYear}
                  onChange={(e) => setEntryYear(Number(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Jenjang Kaderisasi
                </label>
                <select
                  value={cadreLevel}
                  onChange={(e) => setCadreLevel(e.target.value as FormalCadreLevel)}
                  className={inputClass}
                >
                  <option value="Calon Anggota">Calon Anggota</option>
                  <option value="MAPABA">MAPABA</option>
                  <option value="PKD">PKD</option>
                  <option value="PKL">PKL</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            {submitting ? 'Memproses Akun...' : 'Daftar & Terbitkan Akun Kader'}{' '}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8EF] text-center text-xs text-[#64748B]">
          Sudah memiliki akun?{' '}
          <Link href="/auth/login" className="text-[#1B3D7B] font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
