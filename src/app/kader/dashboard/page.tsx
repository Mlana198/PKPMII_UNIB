'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import EKTAViewer from '@/components/EKTAViewer';
import { getRegistrations, getQuizAttempts } from '@/lib/storage';
import {
  CreditCard,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  ArrowRight,
  Edit3,
  Save,
  CheckCircle2,
  Upload,
  X,
  ImageIcon,
  Settings,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  AlertCircle,
} from 'lucide-react';

export default function KaderDashboardPage() {
  const router = useRouter();
  const { user, cadreProfile, isLoading, logout, updateProfile, changeAccountCredentials, account } = useAuth();
  const [activeTab, setActiveTab] = useState<'kta' | 'biodata' | 'pelatihan' | 'cbt' | 'pengaturan'>('kta');

  // Account settings state
  const [settCurrentPassword, setSettCurrentPassword] = useState('');
  const [settNewPassword, setSettNewPassword] = useState('');
  const [settConfirmNewPassword, setSettConfirmNewPassword] = useState('');
  const [settNewEmail, setSettNewEmail] = useState('');
  const [settShowCurrentPass, setSettShowCurrentPass] = useState(false);
  const [settShowNewPass, setSettShowNewPass] = useState(false);
  const [settSaving, setSettSaving] = useState(false);
  const [settSuccess, setSettSuccess] = useState(false);
  const [settError, setSettError] = useState<string | null>(null);

  // Form edit profil state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [entryYear, setEntryYear] = useState<number>(2024);
  const [rayonId, setRayonId] = useState('ryn-1');
  const [rayonName, setRayonName] = useState('Rayon Raden Rahmat');
  const [specializationInterest, setSpecializationInterest] = useState('Kaderisasi');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Drag & drop & file upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state form saat cadreProfile berubah
  useEffect(() => {
    if (cadreProfile) {
      setFullName(cadreProfile.fullName || '');
      setPhoneNumber(cadreProfile.phoneNumber || '');
      setAddress(cadreProfile.address || '');
      setFaculty(cadreProfile.faculty || 'Fakultas Sains dan Teknologi');
      setStudyProgram(cadreProfile.studyProgram || '');
      setEntryYear(cadreProfile.entryYear || 2024);
      setRayonId(cadreProfile.rayonId || 'ryn-1');
      setRayonName(cadreProfile.rayonName || 'Rayon Raden Rahmat');
      setSpecializationInterest(cadreProfile.specializationInterest || 'Kaderisasi');
      setGender(cadreProfile.gender || 'Laki-laki');
      setAvatarUrl(cadreProfile.avatarUrl || '');
    }
  }, [cadreProfile]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSaveError('Format file harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Ukuran pas foto maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setSaveError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const res = await updateProfile({
      fullName,
      phoneNumber,
      address,
      faculty,
      studyProgram,
      entryYear,
      rayonId,
      rayonName,
      specializationInterest,
      gender,
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError(res.error || 'Gagal menyimpan perubahan.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#64748B]">
        Memuat profil anggota...
      </div>
    );
  }

  // Ambil riwayat pendaftaran berdasarkan nama / nim kader
  const myRegistrations = getRegistrations().filter(
    (r) => r.nim === cadreProfile?.nim || r.fullName.toLowerCase() === cadreProfile?.fullName?.toLowerCase()
  );

  // Ambil riwayat ujian CBT
  const myAttempts = getQuizAttempts().filter(
    (a) => a.participantNim === cadreProfile?.nim || a.participantName.toLowerCase() === cadreProfile?.fullName?.toLowerCase()
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4A017] bg-[#F1F5F9] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                cadreProfile?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300'
              }
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1E293B]">
                {cadreProfile?.fullName || user.email}
              </h1>
              {cadreProfile?.isVerified ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Sah
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Verifikasi
                </span>
              )}
            </div>

            <p className="text-xs text-[#64748B] mt-0.5">
              NIM: <span className="font-mono font-semibold text-[#1E293B]">{cadreProfile?.nim || '-'}</span> • {cadreProfile?.rayonName || 'Rayon PMII UNIB'}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              {cadreProfile?.studyProgram} • Angkatan {cadreProfile?.entryYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('biodata')}
            className="text-xs bg-[#1B3D7B] hover:bg-[#122852] text-white px-3.5 py-2 rounded font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Biodata
          </button>
          <Link
            href="/kader"
            className="text-xs border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] hover:text-[#1B3D7B] px-3.5 py-2 rounded font-medium transition-colors"
          >
            Direktori Kader
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E2E8EF]">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { id: 'kta', label: 'E-KTA Digital', icon: CreditCard },
            { id: 'biodata', label: 'Edit Biodata & Profil', icon: Edit3 },
            { id: 'pelatihan', label: 'Tiket & Pelatihan Saya', count: myRegistrations.length, icon: Calendar },
            { id: 'cbt', label: 'Riwayat Ujian CBT', count: myAttempts.length, icon: Award },
            { id: 'pengaturan', label: 'Pengaturan Akun', icon: Settings },
          ].map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-3 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === id
                  ? 'border-[#1B3D7B] text-[#1B3D7B]'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count !== undefined && (
                <span className="text-[10px] bg-[#F1F5F9] px-1.5 py-0.2 rounded font-mono text-[#64748B]">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: E-KTA */}
      {activeTab === 'kta' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <p className="text-[11px] font-bold text-[#D4A017] uppercase tracking-wider">
                  Kartu Tanda Anggota Digital
                </p>
                <h2 className="text-lg font-bold text-[#1E293B]">
                  Identitas Resmi Kader PMII Universitas Ibrahimy
                </h2>
                <p className="text-xs text-[#64748B]">
                  Gunakan kartu ini sebagai identitas resmi dan akses presensi kegiatan.
                </p>
              </div>

              {cadreProfile && <EKTAViewer cadre={cadreProfile} />}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Edit Biodata & Profil */}
      {activeTab === 'biodata' && (
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#E2E8EF] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1B3D7B]" /> Perbarui Data Diri & Biodata Kader
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Perubahan pada data ini akan langsung disinkronkan ke E-KTA Digital dan berkas administrasi Anda.
              </p>
            </div>
            {cadreProfile?.isVerified && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-flex items-center gap-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Resmi
              </span>
            )}
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Biodata dan profil berhasil diperbarui! E-KTA Digital telah disinkronkan secara otomatis.</span>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
            {/* Bagian Identitas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider border-b border-[#F1F5F9] pb-1.5">
                1. Data Pribadi & Kontak
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    required
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as typeof gender)}
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#1B3D7B]"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Pas Foto Upload dengan Drag & Drop / Search File */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1.5">
                  Pas Foto Resmi (Untuk E-KTA Digital)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-center gap-5 ${
                    isDragging
                      ? 'border-[#1B3D7B] bg-blue-50/70 scale-[1.01]'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#1B3D7B]'
                  }`}
                >
                  {/* Preview Container */}
                  <div className="relative w-24 h-28 rounded-lg border-2 border-[#1B3D7B] overflow-hidden bg-white shrink-0 shadow-sm flex items-center justify-center">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Pas Foto Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-[#94A3B8]">
                        <User className="w-8 h-8 mx-auto opacity-40 mb-1" />
                        <span className="text-[9px] leading-tight block">Belum ada foto</span>
                      </div>
                    )}
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
                        title="Hapus / Ganti Foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Drag and Drop & File Browse Trigger */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="kader-avatar-upload"
                      />
                      <label
                        htmlFor="kader-avatar-upload"
                        className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" /> Pilih / Cari Foto di Perangkat
                      </label>
                      {avatarUrl && (
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
                      atau <span className="text-[#1B3D7B] font-bold">tarik & lepas (drag and drop)</span> file foto Anda ke kotak ini.
                    </p>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Format didukung: <strong>JPG, PNG, WEBP</strong> (Maksimal 2 MB). Disarankan pas foto resmi berlatar belakang biru atau polos.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                  Alamat Domisili / Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ketik alamat lengkap atau asrama/pondok pesantren..."
                  className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                />
              </div>
            </div>

            {/* Bagian Akademik & Rayon */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider border-b border-[#F1F5F9] pb-1.5">
                2. Data Akademik & Organisasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    NIM (Nomor Induk Mahasiswa)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={cadreProfile?.nim || '-'}
                    className="w-full border border-[#E2E8EF] bg-slate-100 text-[#64748B] rounded px-3.5 py-2 text-xs font-mono cursor-not-allowed"
                    title="NIM hanya dapat diubah melalui konfirmasi Admin Satu Pintu"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Terkunci demi integritas E-KTA</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Nomor KTA Resmi
                  </label>
                  <input
                    type="text"
                    disabled
                    value={cadreProfile?.ktaNumber || '-'}
                    className="w-full border border-[#E2E8EF] bg-slate-100 text-[#D4A017] font-bold rounded px-3.5 py-2 text-xs font-mono cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Diterbitkan resmi oleh Komisariat</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Jenjang Kaderisasi
                  </label>
                  <input
                    type="text"
                    disabled
                    value={cadreProfile?.cadreLevel || 'MAPABA'}
                    className="w-full border border-[#E2E8EF] bg-slate-100 text-[#1E293B] font-semibold rounded px-3.5 py-2 text-xs cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Diverifikasi via SK kelulusan</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Afiliasi Rayon
                  </label>
                  <select
                    value={rayonId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setRayonId(id);
                      setRayonName(id === 'ryn-2' ? 'Rayon Raden Umar Said' : 'Rayon Raden Rahmat');
                    }}
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#1B3D7B]"
                  >
                    <option value="ryn-1">Rayon Raden Rahmat (Sains & Teknologi)</option>
                    <option value="ryn-2">Rayon Raden Umar Said (Tarbiyah)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="Contoh: Fakultas Sains dan Teknologi"
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Program Studi / Jurusan *
                  </label>
                  <input
                    required
                    type="text"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    placeholder="Contoh: Teknologi Informasi / PAI"
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Tahun Angkatan Kuliah
                  </label>
                  <input
                    type="number"
                    min={2018}
                    max={2030}
                    value={entryYear}
                    onChange={(e) => setEntryYear(Number(e.target.value))}
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                  Peminatan / Minat Bakat Kader
                </label>
                <select
                  value={specializationInterest}
                  onChange={(e) => setSpecializationInterest(e.target.value)}
                  className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#1B3D7B]"
                >
                  <option value="Kaderisasi & Instruktur">Kaderisasi & Instruktur</option>
                  <option value="Kajian Aswaja & Keislaman">Kajian Aswaja & Keislaman</option>
                  <option value="Riset, Literasi & Kepenulisan">Riset, Literasi & Kepenulisan</option>
                  <option value="Media, Jurnalistik & Desain Grafis">Media, Jurnalistik & Desain Grafis</option>
                  <option value="Advokasi, Hukum & Kebijakan Publik">Advokasi, Hukum & Kebijakan Publik</option>
                  <option value="Teknologi Informasi & Digitalisasi">Teknologi Informasi & Digitalisasi</option>
                  <option value="Ekonomi Kreatif & Kewirausahaan">Ekonomi Kreatif & Kewirausahaan</option>
                </select>
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#1B3D7B] hover:bg-[#122852] disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Menyimpan Perubahan...' : 'Simpan Pembaruan Biodata'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kta')}
                className="border border-[#E2E8EF] text-[#64748B] hover:text-[#1E293B] text-xs font-medium px-4 py-2.5 rounded transition-colors"
              >
                Kembali ke E-KTA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Pelatihan */}
      {activeTab === 'pelatihan' && (
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider">
              Pelatihan yang Diikuti
            </h2>
            <Link
              href="/kegiatan"
              className="text-xs text-[#1B3D7B] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Cari Pelatihan Baru <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] text-xs">
              <p>Anda belum terdaftar di kegiatan pelatihan manapun.</p>
              <Link href="/kegiatan" className="text-[#1B3D7B] underline mt-1.5 inline-block">
                Lihat agenda MAPABA / PKD
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRegistrations.map((r) => (
                <div
                  key={r.id}
                  className="border border-[#E2E8EF] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1B3D7B] transition-colors"
                >
                  <div className="space-y-1 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800'
                          : r.status === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.status === 'approved' ? 'Lolos Skrining' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                    </span>
                    <h3 className="font-bold text-sm text-[#1E293B]">{r.eventTitle}</h3>
                    <p className="text-[#64748B] font-mono text-[11px]">Kode Tiket: {r.qrTicketCode}</p>
                  </div>
                  <Link
                    href={`/kegiatan/tiket/${r.id}`}
                    className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors self-start sm:self-auto"
                  >
                    Buka E-Tiket Presensi
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Riwayat CBT */}
      {activeTab === 'cbt' && (
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider">
              Riwayat Skor Pre-Test & Post-Test
            </h2>
            <Link
              href="/kuis"
              className="text-xs text-[#1B3D7B] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Masuk Portal CBT <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myAttempts.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] text-xs">
              <p>Belum ada riwayat pengerjaan kuis CBT.</p>
              <Link href="/kuis" className="text-[#1B3D7B] underline mt-1.5 inline-block">
                Ikuti ujian latihan atau pre-test
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myAttempts.map((att) => (
                <div
                  key={att.id}
                  className="border border-[#E2E8EF] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        att.isPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {att.isPassed ? 'Lulus' : 'Belum Lulus'}
                    </span>
                    <h3 className="font-bold text-sm text-[#1E293B]">{att.quizTitle}</h3>
                    <p className="text-[#64748B]">
                      Benar {att.totalCorrect} dari {att.totalQuestions} butir soal
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1B3D7B]">{att.score}</div>
                    <div className="text-[10px] text-[#94A3B8]">Skor Akhir / 100</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Pengaturan Akun */}
      {activeTab === 'pengaturan' && (
        <div className="bg-white border border-[#E2E8EF] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#E2E8EF] pb-4">
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1B3D7B]" /> Pengaturan Akun
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Kelola email, kata sandi, dan status verifikasi akun Anda.
            </p>
          </div>

          {/* Email & verification status */}
          <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#1B3D7B] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#1E293B]">Email Aktif</p>
                <p className="text-xs text-[#64748B] font-mono">{user?.email || '-'}</p>
              </div>
            </div>
            {account?.isEmailVerified ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" /> Belum Diverifikasi
              </span>
            )}
          </div>

          {settSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pengaturan akun berhasil disimpan!</span>
            </div>
          )}
          {settError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {settError}
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSettSaving(true);
              setSettError(null);
              setSettSuccess(false);
              if (settNewPassword && settNewPassword !== settConfirmNewPassword) {
                setSettError('Konfirmasi kata sandi baru tidak cocok.');
                setSettSaving(false);
                return;
              }
              const res = await changeAccountCredentials({
                currentPassword: settCurrentPassword || undefined,
                newPassword: settNewPassword || undefined,
                newEmail: settNewEmail || undefined,
              });
              setSettSaving(false);
              if (res.success) {
                setSettSuccess(true);
                setSettCurrentPassword('');
                setSettNewPassword('');
                setSettConfirmNewPassword('');
                setSettNewEmail('');
                setTimeout(() => setSettSuccess(false), 4000);
              } else {
                setSettError(res.error || 'Gagal menyimpan pengaturan.');
              }
            }}
            className="space-y-6 max-w-xl"
          >
            {/* Ganti Email */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider border-b border-[#F1F5F9] pb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Ganti Email
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                  Email Baru (kosongkan jika tidak ingin ganti)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settNewEmail}
                    onChange={(e) => setSettNewEmail(e.target.value)}
                    placeholder={user?.email || 'email-baru@contoh.com'}
                    className="w-full border border-[#E2E8EF] rounded pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Ganti Password */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider border-b border-[#F1F5F9] pb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Ganti Kata Sandi
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                  Kata Sandi Saat Ini (wajib diisi jika ingin ganti password)
                </label>
                <div className="relative">
                  <input
                    type={settShowCurrentPass ? 'text' : 'password'}
                    value={settCurrentPassword}
                    onChange={(e) => setSettCurrentPassword(e.target.value)}
                    placeholder="Kata sandi saat ini"
                    className="w-full border border-[#E2E8EF] rounded px-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSettShowCurrentPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B3D7B]"
                  >
                    {settShowCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={settShowNewPass ? 'text' : 'password'}
                      value={settNewPassword}
                      onChange={(e) => setSettNewPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full border border-[#E2E8EF] rounded px-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setSettShowNewPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1B3D7B]"
                    >
                      {settShowNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase mb-1">
                    Ulangi Kata Sandi Baru
                  </label>
                  <input
                    type={settShowNewPass ? 'text' : 'password'}
                    value={settConfirmNewPassword}
                    onChange={(e) => setSettConfirmNewPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full border border-[#E2E8EF] rounded px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={settSaving}
              className="bg-[#1B3D7B] hover:bg-[#122852] disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {settSaving ? 'Menyimpan...' : 'Simpan Pengaturan Akun'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
