'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import { getELibrary } from '@/lib/storage';

const CATEGORIES = ['Semua', 'AD/ART', 'Nilai Dasar Pergerakan', 'Materi Mapaba', 'Materi PKD'] as const;

export default function ELibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const items = getELibrary();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQ =
        item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8EF] pb-6">
        <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
          Perpustakaan Digital
        </p>
        <h1 className="text-3xl font-semibold text-[#1E293B]">
          E-Library & Modul Kaderisasi
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Arsip digital konstitusi AD/ART, modul silabus kaderisasi, dan referensi pemikiran PK PMII Universitas Ibrahimy.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1B3D7B] text-white shadow-sm'
                  : 'bg-white border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] hover:text-[#1B3D7B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul dokumen..."
            className="w-full border border-[#E2E8EF] rounded pl-8 pr-3 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#1B3D7B] bg-white"
          />
        </div>
      </div>

      {/* Table Dokumen */}
      <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[#64748B] text-xs">
            Tidak ada dokumen yang sesuai dengan pencarian Anda.
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF] text-[#64748B]">
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider">Judul Dokumen</th>
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider hidden md:table-cell">Penyusun</th>
                <th className="px-5 py-3.5 font-semibold uppercase tracking-wider hidden sm:table-cell">Spesifikasi</th>
                <th className="px-5 py-3.5 text-right font-semibold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-[#D4A017] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#1E293B] text-sm">{item.title}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{item.description}</p>
                        <span className="inline-block mt-1 text-[10px] text-[#1B3D7B] font-semibold bg-blue-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#64748B] font-medium hidden md:table-cell">
                    {item.author}
                  </td>
                  <td className="px-5 py-4 text-[#64748B] text-[11px] hidden sm:table-cell">
                    {item.pageCount} Hal • {item.fileSize} • {item.publishedYear}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => alert(`Mengunduh file: ${item.title}`)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#1B3D7B] font-semibold hover:text-[#D4A017] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
