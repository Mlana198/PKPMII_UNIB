'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { getEventBySlug, saveRegistration, getRayons } from '@/lib/storage';
import { ArrowLeft, Lock, LogIn, CheckCircle, Upload, FileText, X } from 'lucide-react';

export default function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, cadreProfile, isLoading } = useAuth();
  const event = getEventBySlug(slug);
  const rayons = getRayons();

  const [form, setForm] = useState({
    fullName: '',
    nim: '',
    university: 'Universitas Ibrahimy',
    rayon: rayons[0]?.name || 'Rayon Raden Rahmat',
    studyProgram: '',
    phoneNumber: '',
    email: '',
    motivation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [requirementFileUrl, setRequirementFileUrl] = useState('');
  const [requirementFileName, setRequirementFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran berkas persyaratan maksimal 2 MB.');
      return;
    }

    setRequirementFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setRequirementFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Auto-fill profil kader yang login
  useEffect(() => {
    if (cadreProfile) {
      setForm((prev) => ({
        ...prev,
        fullName: cadreProfile.fullName || prev.fullName,
        nim: cadreProfile.nim || prev.nim,
        university: cadreProfile.university || prev.university,
        rayon: cadreProfile.rayonName || prev.rayon,
        studyProgram: cadreProfile.studyProgram || prev.studyProgram,
        phoneNumber: cadreProfile.phoneNumber || prev.phoneNumber,
        email: cadreProfile.email || user?.email || prev.email,
      }));
    } else if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [cadreProfile, user]);

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-[#64748B]">
        <p className="text-sm">Kegiatan pelatihan tidak ditemukan.</p>
        <Link href="/kegiatan" className="text-[#1B3D7B] text-xs underline mt-2 inline-block">
          Kembali ke agenda
        </Link>
      </div>
    );
  }

  // Jika Belum Login: Tampilkan Notifikasi Wajib Login
  if (!isLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <Link
          href={`/kegiatan/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Deskripsi Acara
        </Link>

        <div className="bg-white border border-[#E2E8EF] rounded-xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-[#1B3D7B] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-[#1B3D7B]" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
              Pendaftaran Resmi
            </span>
            <h1 className="text-xl font-bold text-[#1E293B] mt-2">
              Masuk Akun untuk Mendaftar Pelatihan
            </h1>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Pendaftaran kegiatan <strong>{event.title}</strong> mewajibkan akun kader agar tiket presensi, modul materi, dan sertifikat ujian terhubung otomatis.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`/auth/login?redirect=/kegiatan/${event.slug}/daftar`}
              className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-5 py-2.5 rounded transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun Sekarang
            </Link>
            <Link
              href="/auth/register"
              className="border border-[#CBD5E1] text-[#1E293B] hover:border-[#1B3D7B] text-xs font-semibold px-4 py-2.5 rounded transition-colors"
            >
              Daftar Akun Kader Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reg = saveRegistration({
        eventId: event.id,
        eventTitle: event.title,
        ...form,
        requirementFileUrl: requirementFileUrl || undefined,
        requirementFileName: requirementFileName || undefined,
      });
      router.push(`/kegiatan/tiket/${reg.id}`);
    } catch {
      alert('Gagal mendaftar. Silakan coba kembali.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]';

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href={`/kegiatan/${event.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Deskripsi Acara
      </Link>

      <div className="mb-8">
        <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
          Formulir Pendaftaran Resmi
        </span>
        <h1 className="text-2xl font-bold text-[#1E293B] mt-1">
          {event.title}
        </h1>
        <p className="text-[#64748B] text-xs mt-1">
          Data pendaftaran otomatis disinkronkan dengan profil keanggotaan Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8EF] rounded-lg p-6 sm:p-8 space-y-4 shadow-sm">
        <Field label="Nama Lengkap Sesuai KTM *">
          <input
            required
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Ketik nama lengkap"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nomor Induk Mahasiswa (NIM) *">
            <input
              required
              type="text"
              value={form.nim}
              onChange={(e) => setForm({ ...form, nim: e.target.value })}
              placeholder="Contoh: 240501110077"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Perguruan Tinggi">
            <input
              type="text"
              disabled
              value={form.university}
              className={`${inputClass} bg-[#F8FAFC] cursor-not-allowed text-[#64748B]`}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Asal Rayon *">
            <select
              value={form.rayon}
              onChange={(e) => setForm({ ...form, rayon: e.target.value })}
              className={inputClass}
            >
              {rayons.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Program Studi *">
            <input
              required
              type="text"
              value={form.studyProgram}
              onChange={(e) => setForm({ ...form, studyProgram: e.target.value })}
              placeholder="Nama program studi"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nomor WhatsApp *">
            <input
              required
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="0812xxxxxxxx"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Email Aktif *">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Motivasi Mengikuti Pelatihan *">
          <textarea
            required
            rows={3}
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
            placeholder="Tuliskan motivasi dan komitmen Anda..."
            className={inputClass}
          />
        </Field>

        {/* Upload Berkas Persyaratan */}
        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
            Unggah Berkas Persyaratan (PDF / Gambar)
          </label>
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-lg p-4 text-center hover:border-[#1B3D7B] hover:bg-blue-50/20 transition-colors">
            {requirementFileName ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs">
                <div className="flex items-center gap-2 text-[#1B3D7B] truncate">
                  <FileText className="w-4 h-4 shrink-0 text-[#1B3D7B]" />
                  <span className="font-medium truncate">{requirementFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRequirementFileName('');
                    setRequirementFileUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-red-500 hover:text-red-700 p-1 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload className="w-6 h-6 text-[#94A3B8] mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-[#1B3D7B] hover:underline">
                  Klik untuk unggah berkas persyaratan
                </span>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">
                  Format PDF, JPG, atau PNG (Maksimal 2 MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {event.requirements && event.requirements.length > 0 && (
            <div className="mt-2 bg-[#F8FAFC] border border-[#E2E8EF] rounded p-2.5">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                Persyaratan yang diperlukan:
              </p>
              <ul className="text-[11px] text-[#475569] list-disc list-inside space-y-0.5">
                {event.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 mt-2 shadow-sm"
        >
          {submitting ? 'Memproses...' : 'Kirim Pendaftaran & Ambil E-Tiket'}
        </button>
      </form>
    </div>
  );
}
