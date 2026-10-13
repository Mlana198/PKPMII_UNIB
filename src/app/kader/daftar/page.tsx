'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveCadre, getRayons } from '@/lib/storage';
import { FormalCadreLevel } from '@/lib/types';
import { ArrowLeft, Upload, X, User } from 'lucide-react';

export default function DaftarKaderPage() {
  const router = useRouter();
  const rayons = getRayons();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  const handleRayonChange = (id: string) => {
    const r = rayons.find((x) => x.id === id);
    setForm((p) => ({
      ...p,
      rayonId: id,
      faculty: r?.faculty || p.faculty,
    }));
  };

  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, avatarUrl: reader.result as string }));
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
  };

  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(true);
  };

  const handleAvatarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAvatarFile(file);
  };

  const removeAvatar = () => {
    setForm((p) => ({ ...p, avatarUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = rayons.find((x) => x.id === form.rayonId);
      const defaultAvatar = form.gender === 'Perempuan'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300';

      const newCadre = saveCadre({
        ...form,
        avatarUrl: form.avatarUrl || defaultAvatar,
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

      <div className="mb-8 flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-[#E2E8EF] shadow-sm shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/komisariat.png" alt="Logo PK PMII UNIB" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1">
            Formulir Keanggotaan
          </p>
          <h1 className="text-3xl font-semibold text-[#1E293B]">Registrasi Kader PMII</h1>
          <p className="text-[#64748B] text-sm mt-1">
            PK PMII Universitas Ibrahimy — Penerbitan Kartu Tanda Anggota (E-KTA) Digital.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8EF] rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Pas Foto Upload */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            1. Pas Foto Profil (Untuk E-KTA)
          </h2>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">
              {errorMsg}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDraggingAvatar
                ? 'border-[#1B3D7B] bg-blue-50'
                : 'border-[#CBD5E1] bg-[#F8FAFC]'
            }`}
            onDragOver={handleAvatarDragOver}
            onDragLeave={handleAvatarDragLeave}
            onDrop={handleAvatarDrop}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview */}
              <div className="relative w-20 h-24 rounded border-2 border-[#1B3D7B] overflow-hidden bg-white shrink-0 shadow-sm flex items-center justify-center">
                {form.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-[#94A3B8]">
                    <User className="w-8 h-8 mx-auto opacity-40 mb-1" />
                    <span className="text-[9px] leading-tight block">Pas Foto Formal</span>
                  </div>
                )}
                {form.avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700"
                    title="Hapus Foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-2.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatar-upload-cadre"
                  />
                  <label
                    htmlFor="avatar-upload-cadre"
                    className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" /> Pilih / Cari Foto di Perangkat
                  </label>
                  {form.avatarUrl && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="inline-flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Hapus Foto
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#1E293B] font-medium">
                  atau <span className="text-[#1B3D7B] font-bold">tarik &amp; lepas (drag and drop)</span> file foto ke area ini.
                </p>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Format didukung: <strong>JPG, PNG, WEBP</strong> (Maks. 2 MB). Gunakan pas foto resmi berlatar biru/polos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Identitas Diri */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            2. Identitas Personal & Akademik
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
              <Field label="Jenis Kelamin *">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as 'Laki-laki' | 'Perempuan' })}
                  className={inputClass}
                >
                  <option value="Laki-laki">Laki-laki (Sahabat)</option>
                  <option value="Perempuan">Perempuan (Sahabati / KOPRI)</option>
                </select>
              </Field>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Perguruan Tinggi">
                <input
                  type="text"
                  disabled
                  value={form.university}
                  className={`${inputClass} bg-[#F8FAFC] cursor-not-allowed text-[#64748B]`}
                />
              </Field>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </div>
        </div>

        {/* Jenjang Kaderisasi */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            3. Jenjang Kaderisasi & Minat
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

        {/* Kontak */}
        <div>
          <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider pb-2 border-b border-[#E2E8EF] mb-4">
            4. Kontak & Alamat
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
