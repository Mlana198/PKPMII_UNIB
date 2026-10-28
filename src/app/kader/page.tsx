'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Search, CheckCircle, Clock, CreditCard, ShieldCheck, Printer, FileSpreadsheet } from 'lucide-react';
import { getCadres, getRayons } from '@/lib/storage';
import { CadreProfile, Rayon } from '@/lib/types';

export default function KaderDirectoryPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [selectedRayon, setSelectedRayon] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cadres, setCadres] = useState<CadreProfile[]>([]);
  const [rayons, setRayons] = useState<Rayon[]>([]);

  useEffect(() => {
    setCadres(getCadres());
    setRayons(getRayons());

    const handleUpdate = () => {
      setCadres(getCadres());
      setRayons(getRayons());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('pmii-storage-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('pmii-storage-updated', handleUpdate);
    };
  }, []);

  // Proteksi Akses: Hanya Admin / Pengurus yang bisa melihat seluruh database kader
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/kader');
      } else if (!isAdmin) {
        // Jika login sebagai kader biasa, alihkan ke dashboard pribadi miliknya
        router.push('/kader/dashboard');
      }
    }
  }, [user, isAdmin, isLoading, router]);

  const filtered = useMemo(() => {
    return cadres.filter((c) => {
      const matchR = selectedRayon === 'all' || c.rayonId === selectedRayon;
      const matchL = selectedLevel === 'all' || c.cadreLevel === selectedLevel;
      const q = searchQuery.toLowerCase();
      const matchQ =
        c.fullName.toLowerCase().includes(q) ||
        c.nim.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q));
      return matchR && matchL && matchQ;
    });
  }, [cadres, selectedRayon, selectedLevel, searchQuery]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-[#64748B]">
        Memeriksa hak akses database...
      </div>
    );
  }

  const thClass = 'px-3 py-3 text-xs font-semibold uppercase tracking-wider border-b border-[#E2E8EF]';
  const tdClass = 'px-3 py-3 text-xs text-[#1E293B] border-b border-[#E2E8EF]';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E8EF] pb-6">
        <div>
          <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Database Internal Pengurus
          </p>
          <h1 className="text-3xl font-semibold text-[#1E293B]">
            Pangkalan Data Kader PK PMII UNIB
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Data resmi kader Rayon Raden Rahmat (Saintek) dan Rayon Raden Umar Said (Tarbiyah).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/admin/database-print"
            className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-bold text-xs px-4 py-2.5 rounded transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak / Download PDF (F4)
          </Link>
          <Link
            href="/admin"
            className="border border-[#1B3D7B] text-[#1B3D7B] hover:bg-[#1B3D7B] hover:text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            Dashboard Admin
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E2E8EF] rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
            Filter Rayon
          </label>
          <select
            value={selectedRayon}
            onChange={(e) => setSelectedRayon(e.target.value)}
            className="w-full border border-[#E2E8EF] rounded px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white"
          >
            <option value="all">Semua Rayon / Fakultas</option>
            {rayons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
            Jenjang Kaderisasi
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full border border-[#E2E8EF] rounded px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white"
          >
            <option value="all">Semua Jenjang</option>
            <option value="MAPABA">MAPABA</option>
            <option value="PKD">PKD</option>
            <option value="PKL">PKL</option>
            <option value="Calon Anggota">Calon Anggota</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
            Cari Nama / Alamat / Email
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik pencarian..."
              className="w-full border border-[#E2E8EF] rounded pl-8 pr-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#1B3D7B] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tabel Database 9 Kolom Baku */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[#64748B] bg-white border border-[#E2E8EF] rounded-lg">
          <p className="text-sm">Tidak ditemukan data kader sesuai kriteria pencarian.</p>
          <button
            onClick={() => {
              setSelectedRayon('all');
              setSelectedLevel('all');
              setSearchQuery('');
            }}
            className="text-[#1B3D7B] text-xs mt-2 underline"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#EAB308]/20 text-[#1E293B] font-bold">
                <th className={`${thClass} w-10 text-center`}>NO</th>
                <th className={thClass}>NAMA</th>
                <th className={thClass}>FAKULTAS</th>
                <th className={`${thClass} text-center`}>JURUSAN</th>
                <th className={thClass}>NO.TLP</th>
                <th className={thClass}>E-MAIL</th>
                <th className={`${thClass} text-center`}>FOTO</th>
                <th className={`${thClass} text-center`}>ANGKATAN</th>
                <th className={thClass}>ALAMAT</th>
                <th className={`${thClass} text-right`}>KTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {filtered.map((c, idx) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className={`${tdClass} text-center font-bold`}>{idx + 1}.</td>
                  <td className={`${tdClass} font-bold uppercase tracking-wide whitespace-nowrap`}>
                    {c.fullName}
                  </td>
                  <td className={`${tdClass} uppercase whitespace-nowrap`}>
                    {c.faculty?.includes('SAINS')
                      ? 'SAINS & TEKNOLOGI'
                      : c.faculty?.includes('TARBIYAH')
                      ? 'TARBIYAH'
                      : c.faculty}
                  </td>
                  <td className={`${tdClass} text-center font-bold uppercase`}>
                    {c.studyProgram === 'Teknologi Informasi' ? 'TI' : c.studyProgram}
                  </td>
                  <td className={`${tdClass} font-mono whitespace-nowrap`}>
                    {c.phoneNumber}
                  </td>
                  <td className={`${tdClass} text-blue-700 underline font-sans`}>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </td>
                  <td className={`${tdClass} text-center p-1.5`}>
                    <div className="w-9 h-11 mx-auto rounded border border-[#CBD5E1] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          c.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150'
                        }
                        alt={c.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className={`${tdClass} text-center font-bold`}>
                    {c.mapabaYear || c.entryYear}
                  </td>
                  <td className={`${tdClass} uppercase font-medium whitespace-nowrap`}>
                    {c.address}
                  </td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <Link
                      href={`/kader/kta/${c.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-[#1B3D7B] hover:text-[#D4A017] font-semibold"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> E-KTA
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
