'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  getCadres,
  getRegistrations,
  getQuizAttempts,
  getArticles,
  toggleVerifyCadre,
  updateRegistrationStatus,
  saveArticle,
} from '@/lib/storage';
import {
  Users,
  Calendar,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'kader' | 'pendaftaran' | 'cbt' | 'artikel'>('kader');
  const [cadres, setCadres] = useState(getCadres());
  const [registrations, setRegistrations] = useState(getRegistrations());
  const [attempts] = useState(getQuizAttempts());
  const [articles, setArticles] = useState(getArticles());

  // Form publish artikel
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Warta Komisariat' | 'Opini Kader' | 'Kajian Aswaja'>('Warta Komisariat');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newAuthor, setNewAuthor] = useState('Biro Humas PK PMII UNIB');

  const tabs = [
    { id: 'kader', label: 'Verifikasi Kader', count: cadres.length, icon: Users },
    { id: 'pendaftaran', label: 'Skrining Pelatihan', count: registrations.length, icon: Calendar },
    { id: 'cbt', label: 'Hasil Ujian CBT', count: attempts.length, icon: Award },
    { id: 'artikel', label: 'Manajemen Warta', count: articles.length, icon: BookOpen },
  ] as const;

  const exportCSV = () => {
    const rows = cadres.map((c) => [
      `"${c.fullName}"`,
      `"${c.nim}"`,
      `"${c.rayonName || ''}"`,
      `"${c.studyProgram}"`,
      c.entryYear,
      c.cadreLevel,
      `"${c.ktaNumber}"`,
      c.isVerified ? 'Terverifikasi' : 'Pending',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nama Lengkap,NIM,Rayon,Prodi,Angkatan,Jenjang,No KTA,Status', ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_kader_pmii_unib_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const created = saveArticle({
      title: newTitle,
      slug,
      excerpt: newExcerpt,
      content: newExcerpt + '\n\nDipublikasikan secara resmi oleh Biro Humas PK PMII Universitas Ibrahimy.',
      category: newCategory,
      authorName: newAuthor,
      authorRole: 'Redaksi Komisariat',
      coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      tags: ['Warta', 'PMII UNIB'],
      status: 'published',
      readTimeMinutes: 3,
    });

    setArticles([created, ...articles]);
    setNewTitle('');
    setNewExcerpt('');
    alert('Warta berhasil diterbitkan!');
  };

  const thClass = 'text-left px-5 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider';
  const tdClass = 'px-5 py-3.5 text-xs text-[#1E293B]';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E8EF] pb-6">
        <div>
          <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
            Backoffice Administrasi
          </p>
          <h1 className="text-3xl font-semibold text-[#1E293B]">
            Dashboard Pengurus Komisariat
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            PK PMII Universitas Ibrahimy Sukorejo Situbondo
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 border border-[#1B3D7B] text-[#1B3D7B] hover:bg-[#1B3D7B] hover:text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors self-start md:self-auto shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV Kader
        </button>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Kader', value: cadres.length, sub: `${cadres.filter((c) => c.isVerified).length} Terverifikasi` },
          { label: 'Pendaftar Acara', value: registrations.length, sub: `${registrations.filter((r) => r.status === 'pending').length} Menunggu` },
          { label: 'Riwayat Ujian CBT', value: attempts.length, sub: 'Hasil Pre/Post Test' },
          { label: 'Warta Terbit', value: articles.length, sub: 'Publikasi' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E2E8EF] rounded-lg p-5 shadow-sm">
            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-2xl font-bold text-[#1B3D7B] mt-1">{s.value}</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs Toolbar */}
      <div className="border-b border-[#E2E8EF]">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-[#1B3D7B] text-[#1B3D7B]'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === id ? 'bg-blue-50 text-[#1B3D7B]' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Kader */}
      {activeTab === 'kader' && (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF]">
                <th className={thClass}>Kader</th>
                <th className={`${thClass} hidden md:table-cell`}>Rayon & Prodi</th>
                <th className={thClass}>Jenjang</th>
                <th className={`${thClass} hidden sm:table-cell`}>Status</th>
                <th className={`${thClass} text-right`}>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {cadres.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className={tdClass}>
                    <div className="font-semibold text-[#1E293B] text-sm">{c.fullName}</div>
                    <div className="text-[11px] text-[#64748B] font-mono">{c.nim}</div>
                  </td>
                  <td className={`${tdClass} hidden md:table-cell`}>
                    <div className="font-medium">{c.rayonName}</div>
                    <div className="text-[11px] text-[#64748B]">{c.studyProgram}</div>
                  </td>
                  <td className={tdClass}>
                    <span className="text-[11px] font-semibold text-[#1B3D7B] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {c.cadreLevel}
                    </span>
                  </td>
                  <td className={`${tdClass} hidden sm:table-cell`}>
                    {c.isVerified ? (
                      <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Menunggu
                      </span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setCadres(toggleVerifyCadre(c.id))}
                        className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
                          c.isVerified
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {c.isVerified ? 'Batalkan' : 'Verifikasi'}
                      </button>
                      <Link
                        href={`/kader/kta/${c.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-[#1B3D7B] hover:underline font-semibold"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> KTA
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Pendaftaran */}
      {activeTab === 'pendaftaran' && (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF]">
                <th className={thClass}>Peserta</th>
                <th className={`${thClass} hidden md:table-cell`}>Kegiatan</th>
                <th className={thClass}>Status Skrining</th>
                <th className={`${thClass} text-right`}>Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {registrations.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className={tdClass}>
                    <div className="font-semibold text-sm">{r.fullName}</div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      {r.nim} • {r.rayon}
                    </div>
                  </td>
                  <td className={`${tdClass} hidden md:table-cell text-[#64748B]`}>
                    {r.eventTitle}
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        r.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : r.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {r.status === 'approved'
                        ? 'Lolos Skrining'
                        : r.status === 'rejected'
                        ? 'Ditolak'
                        : 'Menunggu Review'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setRegistrations(updateRegistrationStatus(r.id, 'approved'))}
                        className="text-xs px-2.5 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => setRegistrations(updateRegistrationStatus(r.id, 'rejected'))}
                        className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: CBT */}
      {activeTab === 'cbt' && (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
          {attempts.length === 0 ? (
            <div className="py-20 text-center text-[#64748B] text-xs">
              <Award className="w-8 h-8 text-[#E2E8EF] mx-auto mb-2" />
              Belum ada riwayat hasil pengerjaan kuis CBT.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF]">
                  <th className={thClass}>Peserta</th>
                  <th className={`${thClass} hidden md:table-cell`}>Paket Soal</th>
                  <th className={thClass}>Nilai Akhir</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} hidden sm:table-cell`}>Catatan Integritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className={tdClass}>
                      <div className="font-semibold text-sm">{att.participantName}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">
                        {att.participantNim} • {att.participantRayon}
                      </div>
                    </td>
                    <td className={`${tdClass} hidden md:table-cell text-[#64748B]`}>
                      {att.quizTitle}
                    </td>
                    <td className={tdClass}>
                      <span className="font-bold text-[#1B3D7B] text-sm">{att.score}</span>
                      <span className="text-[#94A3B8]"> / 100</span>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          att.isPassed
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {att.isPassed ? 'Lulus' : 'Remidial'}
                      </span>
                    </td>
                    <td className={`${tdClass} hidden sm:table-cell`}>
                      {att.tabSwitchViolations > 0 ? (
                        <span className="text-amber-600 text-[11px] font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {att.tabSwitchViolations}x ganti layar
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px]">Integritas Bersih</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Artikel */}
      {activeTab === 'artikel' && (
        <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-[#1B3D7B] uppercase tracking-wider mb-1">
            Terbitkan Rilis Warta atau Opini Baru
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Publikasi berita kegiatan komisariat atau tulisan kader ke halaman portal warta.
          </p>

          <form onSubmit={handlePublish} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Judul Warta *
              </label>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul artikel atau berita"
                className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                >
                  <option value="Warta Komisariat">Warta Komisariat</option>
                  <option value="Opini Kader">Opini Kader</option>
                  <option value="Kajian Aswaja">Kajian Aswaja</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Penulis / Redaksi
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                Ringkasan / Isi Warta *
              </label>
              <textarea
                required
                rows={4}
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
                placeholder="Tuliskan poin penting warta..."
                className="w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Terbitkan Warta
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
