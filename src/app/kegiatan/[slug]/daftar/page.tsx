'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug, saveRegistration, getRayons } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';

export default function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reg = saveRegistration({
        eventId: event.id,
        eventTitle: event.title,
        ...form,
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
          Formulir Pendaftaran
        </span>
        <h1 className="text-2xl font-bold text-[#1E293B] mt-1">
          {event.title}
        </h1>
        <p className="text-[#64748B] text-xs mt-1">
          PK PMII Universitas Ibrahimy Sukorejo Situbondo
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
