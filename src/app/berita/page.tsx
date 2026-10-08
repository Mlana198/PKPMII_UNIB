'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getArticles } from '@/lib/storage';

const CATEGORIES = ['Semua', 'Warta Komisariat', 'Opini Kader', 'Kajian Aswaja', 'Warta KOPRI'] as const;

export default function BeritaPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const articles = getArticles();

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = selectedCategory === 'Semua' || a.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQ = a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8EF] pb-6">
        <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
          Portal Berita & Opini
        </p>
        <h1 className="text-3xl font-semibold text-[#1E293B]">
          Warta PK PMII Universitas Ibrahimy
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Kabar kegiatan komisariat, esai intelektual kader, dan kajian pemikiran Aswaja An-Nahdliyyah.
        </p>
      </div>

      {/* Filter and Search Bar */}
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
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau topik..."
            className="w-full border border-[#E2E8EF] rounded pl-9 pr-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#1B3D7B] bg-white"
          />
        </div>
      </div>

      {/* Article Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[#64748B]">
          <p className="text-sm">Tidak ada artikel yang sesuai dengan pencarian Anda.</p>
          <button
            onClick={() => {
              setSelectedCategory('Semua');
              setSearchQuery('');
            }}
            className="text-[#1B3D7B] text-xs mt-2 underline"
          >
            Reset filter pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <article
              key={art.id}
              className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden hover:border-[#1B3D7B] transition-colors flex flex-col"
            >
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-[#1B3D7B] text-[#D4A017] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  {art.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#1E293B] mb-2 leading-snug line-clamp-2 hover:text-[#1B3D7B]">
                    <Link href={`/berita/${art.slug}`}>{art.title}</Link>
                  </h2>
                  <p className="text-[#64748B] text-xs line-clamp-2 leading-relaxed mb-4">
                    {art.excerpt}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E2E8EF] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span className="truncate max-w-[170px]">{art.authorName}</span>
                  <span>{art.readTimeMinutes} min</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
