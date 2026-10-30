'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { getRayons, isEmailRegistered, isNimRegistered, isPhoneRegistered } from '@/lib/storage';
import { FormalCadreLevel } from '@/lib/types';
import { Lock, Mail, User, AlertCircle, ArrowRight, Upload, X, Camera, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const rayons = getRayons();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [nim, setNim] = useState('');
  const [institutionChoice, setInstitutionChoice] = useState<'ryn-1' | 'ryn-2' | 'lainnya'>('ryn-1');
  const [customInstitution, setCustomInstitution] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [entryYear, setEntryYear] = useState(2024);
  const [cadreLevel, setCadreLevel] = useState<FormalCadreLevel>('MAPABA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  // Status peringatan otomatis untuk data unik
  const [emailDuplicateWarning, setEmailDuplicateWarning] = useState<string | null>(null);
  const [nimDuplicateWarning, setNimDuplicateWarning] = useState<string | null>(null);
  const [phoneDuplicateWarning, setPhoneDuplicateWarning] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Verification modal after successful registration
  const [verifyModal, setVerifyModal] = useState(false);
  const [verificationCodeDisplay, setVerificationCodeDisplay] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<{ sent: boolean; error?: string }>({ sent: false });


  const compressImage = (file: File, maxWidth = 300, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 5 MB.');
      return;
    }
    try {
      const compressed = await compressImage(file, 240, 0.7);
      setAvatarPreview(compressed);
      setErrorMsg(null);
    } catch {
      setErrorMsg('Gagal memproses gambar foto.');
    }
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
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Verifikasi Keunikan Email
    if (isEmailRegistered(email)) {
      setErrorMsg('Email ini sudah terdaftar pada akun lain. Silakan gunakan email lain atau masuk ke akun Anda.');
      setEmailDuplicateWarning('Email ini sudah terdaftar');
      return;
    }

    const isInternal = institutionChoice === 'ryn-1' || institutionChoice === 'ryn-2';

    // Verifikasi Keunikan NIM (Internal UNIB)
    if (isInternal && nim.trim()) {
      if (isNimRegistered(nim)) {
        setErrorMsg(`NIM "${nim}" sudah terdaftar pada akun kader lain. Harap periksa kembali NIM Anda.`);
        setNimDuplicateWarning(`NIM ${nim} sudah terdaftar`);
        return;
      }
    }

    // Verifikasi Keunikan Nomor WhatsApp
    if (phoneNumber.trim()) {
      if (isPhoneRegistered(phoneNumber)) {
        setErrorMsg(`Nomor WhatsApp "${phoneNumber}" sudah terdaftar pada akun lain.`);
        setPhoneDuplicateWarning('Nomor WhatsApp sudah digunakan');
        return;
      }
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSubmitting(true);
    const selectedRayonObj = isInternal ? rayons.find((r) => r.id === institutionChoice) : undefined;

    try {
      const res = await register(email, password, {
        fullName,
        gender,
        nim: isInternal ? nim : (nim || '-'),
        university: isInternal ? 'Universitas Ibrahimy' : (customInstitution.trim() || 'Luar UNIB'),
        rayonId: isInternal ? institutionChoice : 'eksternal',
        rayonName: isInternal ? (selectedRayonObj?.name || 'Rayon Raden Rahmat') : (customInstitution.trim() || 'Lembaga Luar UNIB'),
        faculty: isInternal ? (selectedRayonObj?.faculty || 'Fakultas Sains dan Teknologi') : 'Luar UNIB',
        studyProgram,
        entryYear: Number(entryYear),
        mapabaYear: Number(entryYear),
        cadreLevel: isInternal ? cadreLevel : 'Calon Anggota',
        phoneNumber,
        email,
        institutionType: isInternal ? 'internal' : 'external',
        customInstitutionName: customInstitution.trim(),
        avatarUrl: avatarPreview || (gender === 'Perempuan' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300' 
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300'),
      });

      setSubmitting(false);

      if (res.success) {
        if (res.verificationCode) {
          setVerificationCodeDisplay(res.verificationCode);
          setRegisteredEmail(res.email || email.trim());
          setEmailDeliveryStatus({ sent: Boolean(res.emailSent), error: res.emailError });
          setVerifyModal(true);
        } else {
          router.push('/kader/dashboard');
        }
      } else {
        setErrorMsg(res.error || 'Gagal mendaftar. Silakan coba kembali.');
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);
      setErrorMsg('Terjadi kesalahan saat mendaftar. Silakan coba kembali.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-[#E2E8EF] rounded px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]';

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12" suppressHydrationWarning>
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-9 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white p-1 border border-[#E2E8EF] shadow-sm shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logos/komisariat.png" alt="Logo PK PMII UNIB" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
              Registrasi Akun Anggota
            </span>
            <h1 className="text-2xl font-bold text-[#1E293B] mt-0.5">
              Daftar Akun Kader PMII UNIB
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Buat akun untuk mengakses Kartu Tanda Anggota (E-KTA) Digital dan portal ujian CBT.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
          {/* Section: Upload Pas Foto */}
          <div className="border-b border-[#E2E8EF] pb-5 space-y-3">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> 1. Pas Foto Profil (Untuk E-KTA)
            </h2>

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
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-[#94A3B8]">
                      <User className="w-8 h-8 mx-auto opacity-40 mb-1" />
                      <span className="text-[9px] leading-tight block">Pas Foto Formal</span>
                    </div>
                  )}
                  {avatarPreview && (
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
                      suppressHydrationWarning
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" /> Pilih / Cari Foto di Perangkat
                    </label>
                    {avatarPreview && (
                      <button
                        suppressHydrationWarning
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
                    Format didukung: <strong>JPG, PNG, WEBP</strong> (Maks. 2 MB). Gunakan pas foto resmi berlatar biru/polos — foto akan tercetak pada E-KTA Digital.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Akun Login */}
          <div className="border-b border-[#E2E8EF] pb-4 space-y-3">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> 2. Kredensial Akun
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reg-email" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Email Aktif *
                </label>
                {emailDuplicateWarning && (
                  <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {emailDuplicateWarning}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  name="email"
                  autoComplete="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                  }}
                  onBlur={() => {
                    if (email.trim() && isEmailRegistered(email)) {
                      setEmailDuplicateWarning('Email ini sudah terdaftar pada akun lain');
                    } else {
                      setEmailDuplicateWarning(null);
                    }
                  }}
                  placeholder="nama@email.com"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    autoComplete="new-password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B3D7B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-confirm-password" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Ulangi Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm-password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className={inputClass + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B3D7B]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Biodata Kader */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 3. Data Keanggotaan &amp; Akademik
            </h2>

            <div>
              <label htmlFor="reg-fullname" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Nama Lengkap Sesuai KTM *
              </label>
              <input
                id="reg-fullname"
                name="fullName"
                autoComplete="name"
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>

            {/* JENIS KELAMIN & NIM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-gender" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Jenis Kelamin *
                </label>
                <select
                  id="reg-gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                  className={inputClass}
                >
                  <option value="Laki-laki">Laki-laki (Sahabat)</option>
                  <option value="Perempuan">Perempuan (Sahabati / KOPRI)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="reg-nim" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    {institutionChoice === 'lainnya' ? 'Nomor Induk / Identitas (Opsional)' : 'Nomor Induk Mahasiswa (NIM) *'}
                  </label>
                  {nimDuplicateWarning && (
                    <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {nimDuplicateWarning}
                    </span>
                  )}
                </div>
                <input
                  id="reg-nim"
                  name="nim"
                  autoComplete="off"
                  required={institutionChoice !== 'lainnya'}
                  type="text"
                  value={nim}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNim(val);
                  }}
                  onBlur={() => {
                    if (nim.trim() && isNimRegistered(nim)) {
                      setNimDuplicateWarning(`NIM ${nim} sudah terdaftar`);
                    } else {
                      setNimDuplicateWarning(null);
                    }
                  }}
                  placeholder={institutionChoice === 'lainnya' ? 'NIM / NIK / ID (opsional)' : 'Contoh: 240501110077'}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="reg-phone" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Nomor WhatsApp *
                  </label>
                  {phoneDuplicateWarning && (
                    <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {phoneDuplicateWarning}
                    </span>
                  )}
                </div>
                <input
                  id="reg-phone"
                  name="phoneNumber"
                  autoComplete="tel"
                  required
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhoneNumber(val);
                  }}
                  onBlur={() => {
                    if (phoneNumber.trim() && isPhoneRegistered(phoneNumber)) {
                      setPhoneDuplicateWarning('Nomor WhatsApp sudah terdaftar');
                    } else {
                      setPhoneDuplicateWarning(null);
                    }
                  }}
                  placeholder="0812xxxxxxxx"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label htmlFor="reg-institution-choice" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Lembaga Asal *
                </label>
                <select
                  id="reg-institution-choice"
                  name="institutionChoice"
                  value={institutionChoice}
                  onChange={(e) => setInstitutionChoice(e.target.value as 'ryn-1' | 'ryn-2' | 'lainnya')}
                  className={inputClass}
                >
                  <option value="ryn-1">Rayon Raden Rahmat (UNIB)</option>
                  <option value="ryn-2">Rayon Raden Umar Said (UNIB)</option>
                  <option value="lainnya">Lainnya (Luar UNIB / Umum)</option>
                </select>
              </div>
            </div>

            {institutionChoice === 'lainnya' && (
              <div>
                <label htmlFor="reg-custom-institution" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Nama Lembaga / Kampus / Instansi Asal *
                </label>
                <input
                  id="reg-custom-institution"
                  name="customInstitution"
                  autoComplete="organization"
                  required
                  type="text"
                  value={customInstitution}
                  onChange={(e) => setCustomInstitution(e.target.value)}
                  placeholder="Contoh: Universitas Jember / UIN KHAS / Umum"
                  className={inputClass}
                />
                <p className="text-[10px] text-[#64748B] mt-1">
                  ℹ️ Akun dari luar lembaga UNIB akan terdaftar sebagai <strong>Pengguna Eksternal</strong> (untuk akses pelatihan, e-library, &amp; CBT umum).
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-study-program" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Program Studi *
                </label>
                <input
                  id="reg-study-program"
                  name="studyProgram"
                  autoComplete="off"
                  required
                  type="text"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder="Contoh: Teknologi Informasi / PAI"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reg-entry-year" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Tahun Angkatan Kuliah
                </label>
                <input
                  id="reg-entry-year"
                  name="entryYear"
                  type="number"
                  min={2018}
                  max={2030}
                  value={entryYear}
                  onChange={(e) => setEntryYear(Number(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            {institutionChoice !== 'lainnya' && (
              <div>
                <label htmlFor="reg-cadre-level" className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Jenjang Kaderisasi
                </label>
                <select
                  id="reg-cadre-level"
                  name="cadreLevel"
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
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 mt-4"
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

    {/* ====== Modal: Pemberitahuan Email Verifikasi ====== */}
    {verifyModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-7 space-y-5">
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-[#1E293B]">Pendaftaran Berhasil!</h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Email verifikasi telah dikirimkan ke <strong>{registeredEmail}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1B3D7B] flex items-center justify-center mx-auto mb-1">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#1E293B]">
              Periksa Kotak Masuk / Folder Spam Email Anda
            </p>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Silakan buka email Anda untuk melihat <strong>Kode 6-Digit Verifikasi</strong> yang telah kami kirimkan demi keamanan akun.
            </p>
          </div>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Lanjut ke Halaman Login & Verifikasi
          </button>
        </div>
      </div>
    )}
    </>
  );
}
