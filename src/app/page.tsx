'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getArticles, getEvents, getCadres, getRayons } from '@/lib/storage';
import { Article, TrainingEvent, CadreProfile, Rayon } from '@/lib/types';
import { INITIAL_ARTICLES, INITIAL_EVENTS, INITIAL_RAYONS, INITIAL_CADRES } from '@/lib/mockData';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [events, setEvents] = useState<TrainingEvent[]>(INITIAL_EVENTS);
  const [cadres, setCadres] = useState<CadreProfile[]>(INITIAL_CADRES);
  const [rayons, setRayons] = useState<Rayon[]>(INITIAL_RAYONS);

  const loadData = () => {
    setArticles(getArticles());
    setEvents(getEvents());
    setCadres(getCadres());
    setRayons(getRayons());
  };

  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => loadData();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('pmii-storage-updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('pmii-storage-updated', handleStorageUpdate);
    };
  }, []);

  const latestArticles = articles.slice(0, 3);
  const activeEvents = events.slice(0, 2);

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION - Benhur + Gold Kunyit Minimalist */}
      <section className="bg-[#1B3D7B] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/15 text-[#D4A017] text-xs font-semibold uppercase tracking-wider">
              <span>Portal Resmi PK PMII Universitas Ibrahimy</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-tight">
              Dzikir, Fikir, <br />
              <span className="font-bold text-[#D4A017]">Amal Sholeh.</span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Selamat datang di portal informasi, pangkalan data keanggotaan digital, serta sistem uji kaderisasi Computer-Based Test (CBT) PK PMII Universitas Ibrahimy (UNIB) Sukorejo Situbondo.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/kegiatan"
                className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold px-6 py-3 rounded text-sm transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                Pendaftaran Pelatihan <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/kader/daftar"
                className="border border-white/40 hover:border-white text-white px-6 py-3 rounded text-sm transition-colors"
              >
                Registrasi Kader & E-KTA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS & 2 RAYONS STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white border border-[#E2E8EF] rounded-lg shadow-sm grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E8EF]">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#1B3D7B]">{cadres.length}</div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide mt-1">Kader Terdata</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#D4A017]">{rayons.length}</div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide mt-1">Rayon Binaan</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#1B3D7B]">{events.length}</div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide mt-1">Agenda Kaderisasi</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-[#D4A017]">{articles.length}</div>
            <div className="text-xs text-[#64748B] uppercase tracking-wide mt-1">Warta & Opini</div>
          </div>
        </div>
      </section>

      {/* 2 RAYON BINAAN SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="border-b border-[#E2E8EF] pb-4 mb-8">
          <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-wider mb-1">Struktur Binaan</p>
          <h2 className="text-2xl font-semibold text-[#1E293B]">2 Rayon di Bawah Naungan Komisariat</h2>
          <p className="text-sm text-[#64748B] mt-1">Kaderisasi tingkat fakultas di lingkungan kampus Universitas Ibrahimy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rayons.map((rayon) => {
            const logoPath = rayon.id === 'ryn-2'
              ? '/images/logos/rayon-raden-umar-said.png'
              : '/images/logos/rayon-raden-rahmat.png';

            // Hitung secara dinamis jumlah kader terdata pada rayon ini
            const dynamicCadresCount = cadres.filter(
              (c) => c.rayonId === rayon.id || 
                     (rayon.id === 'ryn-1' && c.faculty?.toLowerCase().includes('sains')) ||
                     (rayon.id === 'ryn-2' && c.faculty?.toLowerCase().includes('tarbiyah'))
            ).length;

            return (
              <div key={rayon.id} className="bg-white border border-[#E2E8EF] rounded-xl p-6 hover:border-[#1B3D7B] transition-colors shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-[#E2E8EF] p-1.5 shrink-0 flex items-center justify-center shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPath} alt={rayon.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#1B3D7B] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                        {rayon.code}
                      </span>
                      <h3 className="text-lg font-bold text-[#1E293B] mt-1.5">{rayon.name}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">{rayon.faculty}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-[#D4A017]">{dynamicCadresCount}</div>
                    <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Kader Terdata</div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E2E8EF] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Berdiri sejak tahun {rayon.establishedYear}</span>
                  <Link href="/kader" className="text-[#1B3D7B] font-medium hover:underline inline-flex items-center gap-1">
                    Lihat Anggota <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AGENDA PELATIHAN SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between border-b border-[#E2E8EF] pb-4 mb-8">
          <div>
            <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-wider mb-1">Kaderisasi Formal</p>
            <h2 className="text-2xl font-semibold text-[#1E293B]">Agenda Pelatihan PMII</h2>
            <p className="text-sm text-[#64748B] mt-1">Daftar sekarang untuk mengikuti MAPABA atau PKD</p>
          </div>
          <Link href="/kegiatan" className="text-[#1B3D7B] text-xs font-semibold hover:underline inline-flex items-center gap-1">
            Semua Agenda <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeEvents.map((evt) => (
            <div key={evt.id} className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden hover:border-[#1B3D7B] transition-colors flex flex-col">
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#1B3D7B] text-white text-[10px] font-bold px-2 py-1 rounded">
                  {evt.eventType}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-base text-[#1E293B] mb-2 leading-snug line-clamp-2">
                    {evt.title}
                  </h3>
                  <p className="text-[#64748B] text-xs line-clamp-2 mb-4 leading-relaxed">
                    {evt.theme}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E2E8EF] flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">
                    Terisi: <strong className="text-[#1E293B]">{evt.currentRegistered}</strong> / {evt.maxQuota} peserta
                  </span>
                  <Link
                    href={`/kegiatan/${evt.slug}/daftar`}
                    className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-medium px-4 py-2 rounded transition-colors"
                  >
                    Daftar Sekarang
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CBT ASSESSMENT CALLOUT STRIP */}
      <section className="bg-white border-y border-[#E2E8EF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">Computer-Based Test (CBT)</span>
            <h2 className="text-2xl font-bold text-[#1B3D7B]">Pre-Test & Post-Test Kaderisasi Online</h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Sistem ujian digital mandiri untuk calon anggota dan kader PK PMII Universitas Ibrahimy dengan timer otomatis, pengawasan anti-curang, dan pembahasan soal materi Aswaja & Ke-PMII-an.
            </p>
          </div>
          <Link
            href="/kuis"
            className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-bold px-6 py-3 rounded text-sm transition-colors shrink-0 shadow-sm inline-flex items-center gap-2"
          >
            Masuk Portal Ujian <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* WARTA & OPINI SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between border-b border-[#E2E8EF] pb-4 mb-8">
          <div>
            <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-wider mb-1">Publikasi Intelektual</p>
            <h2 className="text-2xl font-semibold text-[#1E293B]">Warta & Opini Kader</h2>
            <p className="text-sm text-[#64748B] mt-1">Refleksi gerakan, analisis pemikiran, dan kabar komisariat</p>
          </div>
          <Link href="/berita" className="text-[#1B3D7B] text-xs font-semibold hover:underline inline-flex items-center gap-1">
            Arsip Lengkap <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestArticles.map((art) => (
            <article key={art.id} className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden hover:border-[#1B3D7B] transition-colors flex flex-col">
              <div className="h-40 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/95 text-[#1B3D7B] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  {art.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[#1E293B] mb-2 leading-snug line-clamp-2 hover:text-[#1B3D7B]">
                    <Link href={`/berita/${art.slug}`}>{art.title}</Link>
                  </h3>
                  <p className="text-[#64748B] text-xs line-clamp-2 leading-relaxed mb-4">
                    {art.excerpt}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E2E8EF] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>{art.authorName}</span>
                  <span>{art.readTimeMinutes} min baca</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
