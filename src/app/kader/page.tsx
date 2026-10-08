'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { getCadres, getRayons } from '@/lib/storage';

export default function KaderDirectoryPage() {
  const [selectedRayon, setSelectedRayon] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const cadres = getCadres();
  const rayons = getRayons();

  const filtered = useMemo(() => {
    return cadres.filter((c) => {
      const matchR = selectedRayon === 'all' || c.rayonId === selectedRayon;
      const matchL = selectedLevel === 'all' || c.cadreLevel === selectedLevel;
      const q = searchQuery.toLowerCase();
      const matchQ = c.fullName.toLowerCase().includes(q) || c.nim.includes(q);
      return matchR && matchL && matchQ;
    });
  }, [cadres, selectedRayon, selectedLevel, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E8EF] pb-6">
        <div>
          <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
            Pangkalan Data Anggota
          </p>
          <h1 className="text-3xl font-semibold text-[#1E293B]">
            Database Kader PK PMII UNIB
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Daftar anggota terverifikasi dari Rayon Raden Rahmat dan Rayon Raden Umar Said.
          </p>
        </div>
        <Link
          href="/kader/daftar"
          className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold text-xs px-4 py-2.5 rounded transition-colors self-start md:self-auto shadow-sm"
        >
          + Registrasi Kader Baru
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E2E8EF] rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
            Filter Rayon
          </label>
          <select
            value={selectedRayon}
            onChange={(e) => setSelectedRayon(e.target.value)}
            className="w-full border border-[#E2E8EF] rounded px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white"
          >
            <option value="all">Semua Rayon</option>
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
            Cari Nama / NIM
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama atau NIM..."
              className="w-full border border-[#E2E8EF] rounded pl-8 pr-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#1B3D7B] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Kader List Table */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[#64748B] bg-white border border-[#E2E8EF] rounded-lg">
          <p className="text-sm">Tidak ditemukan data kader sesuai kriteria.</p>
          <button
            onClick={() => {
              setSelectedRayon('all');
              setSelectedLevel('all');
              setSearchQuery('');
            }}
            className="text-[#1B3D7B] text-xs mt-2 underline"
          >
            Reset semua filter
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF] text-[#64748B]">
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider">Kader</th>
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider hidden md:table-cell">Rayon & Program Studi</th>
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider">Jenjang</th>
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold uppercase tracking-wider">Kartu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8EF] shrink-0 bg-[#F1F5F9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.avatarUrl || ''} alt={c.fullName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1E293B] text-sm">{c.fullName}</div>
                        <div className="text-[11px] text-[#64748B] font-mono">{c.nim}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="font-medium text-[#1E293B]">{c.rayonName}</div>
                    <div className="text-[11px] text-[#64748B]">{c.studyProgram}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-semibold text-[#1B3D7B] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {c.cadreLevel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {c.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/kader/kta/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[#1B3D7B] font-semibold hover:text-[#D4A017] transition-colors"
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
