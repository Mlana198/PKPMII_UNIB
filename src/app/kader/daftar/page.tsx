'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveCadre, getRayons } from '@/lib/storage';
import { FormalCadreLevel } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

export default function DaftarKaderPage() {
  const router = useRouter();
  const rayons = getRayons();

  const [form, setForm] = useState({
    fullName: '',
    nim: '',
    university: 'Universitas Ibrahimy',
    rayonId: rayons[0]?.id || 'ryn-1',
    faculty: rayons[0]?.faculty || 'Fakultas Sains dan Teknologi',
    studyProgram: '',
    entryYear: 2024,
    mapabaYear: 2024,
    cadreLevel: 'MAPABA' as FormalCadreLevel,
    phoneNumber: '',
    email: '',
    address: '',
    specializationInterest: 'Biro Kaderisasi',
    avatarUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleRayonChange = (id: string) => {
    const r = rayons.find((x) => x.id === id);
    setForm((p) => ({
      ...p,
      rayonId: id,
      faculty: r?.faculty || p.faculty,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = rayons.find((x) => x.id === form.rayonId);
      const newCadre = saveCadre({
        ...form,
        entryYear: Number(form.entryYear),
        mapabaYear: Number(form.mapabaYear),
        rayonName: r?.name,
      });
      router.push(`/kader/kta/${newCadre.id}`);
    } catch {
      alert('Gagal menyimpan data.');
      setSubmitting(false);
    }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass =
    'w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/kader"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Database Kader
      </Link>

      <div className="mb-8">
        <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
          Formulir Keanggotaan
        </p>
        <h1 className="text-3xl font-semibold text-[#1E293B]">Registrasi Kader PMII</h1>
        <p className="text-[#64748B] text-sm mt-1">
          PK PMII Universitas Ibrahimy — Penerbitan Kartu Tanda Anggota (E-KTA) Digital.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8EF] rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Identitas Diri */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            1. Identitas Personal & Akademik
          </h2>
          <div className="space-y-4">
            <Field label="Nama Lengkap *">
              <input
                required
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nama lengkap sesuai KTM"
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
              <Field label="Rayon PMII *">
                <select
                  value={form.rayonId}
                  onChange={(e) => handleRayonChange(e.target.value)}
                  className={inputClass}
                >
                  {rayons.map((r) => (
                    <option key={r.id} value={r.id}>
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
                  placeholder="Contoh: Teknologi Informasi / PAI"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tahun Angkatan Kuliah">
                <input
                  type="number"
                  min={2018}
                  max={2030}
                  value={form.entryYear}
                  onChange={(e) => setForm({ ...form, entryYear: Number(e.target.value) })}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Tahun Mengikuti MAPABA">
                <input
                  type="number"
                  min={2018}
                  max={2030}
                  value={form.mapabaYear}
                  onChange={(e) => setForm({ ...form, mapabaYear: Number(e.target.value) })}
                  className={`${inputClass} font-mono`}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Jenjang Kaderisasi */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            2. Jenjang Kaderisasi & Minat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Jenjang Terakhir">
              <select
                value={form.cadreLevel}
                onChange={(e) => setForm({ ...form, cadreLevel: e.target.value as FormalCadreLevel })}
                className={inputClass}
              >
                <option value="Calon Anggota">Calon Anggota</option>
                <option value="MAPABA">MAPABA</option>
                <option value="PKD">PKD</option>
                <option value="PKL">PKL</option>
              </select>
            </Field>
            <Field label="Minat Pengembangan Diri / Biro">
              <select
                value={form.specializationInterest}
                onChange={(e) => setForm({ ...form, specializationInterest: e.target.value })}
                className={inputClass}
              >
                <option>Biro Kaderisasi</option>
                <option>Biro Media & Teknologi Informasi</option>
                <option>Kajian Pemikiran Aswaja</option>
                <option>Korps PMII Putri (KOPRI)</option>
                <option>Advokasi & Kebijakan Publik</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Kontak & Foto */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            3. Kontak & Pas Foto
          </h2>
          <div className="space-y-4">
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
            <Field label="Alamat Domisili / Pondok">
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Contoh: Sukorejo, Situbondo"
                className={inputClass}
              />
            </Field>
            <Field label="URL Pas Foto (Opsional, untuk E-KTA)">
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... atau link foto"
                className={`${inputClass} font-mono text-[11px]`}
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Biodata & Terbitkan E-KTA'}
        </button>
      </form>
    </div>
  );
}
