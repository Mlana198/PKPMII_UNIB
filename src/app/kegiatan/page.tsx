'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Award, Calendar } from 'lucide-react';
import { getEvents } from '@/lib/storage';

export default function KegiatanIndexPage() {
  const events = getEvents();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8EF] pb-6">
        <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5">
          Kaderisasi Formal & Non-Formal
        </p>
        <h1 className="text-3xl font-semibold text-[#1E293B]">
          Agenda Pelatihan PMII
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Jadwal resmi MAPABA, PKD, serta pelatihan keahlian di lingkungan PK PMII Universitas Ibrahimy.
        </p>
      </div>

      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden hover:border-[#1B3D7B] transition-colors flex flex-col shadow-sm"
          >
            <div className="h-48 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-[#1B3D7B] text-[#D4A017] text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                {evt.eventType}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-[#1E293B] mb-1.5 line-clamp-2">
                  {evt.title}
                </h2>
                <p className="text-xs text-[#64748B] italic mb-4 line-clamp-2">
                  &ldquo;{evt.theme}&rdquo;
                </p>

                <div className="space-y-2 text-xs text-[#64748B] mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                    <span className="line-clamp-1">{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                    <span>{evt.currentRegistered} dari {evt.maxQuota} kuota peserta terdaftar</span>
                  </div>
                  {evt.hasPreTest && (
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                      <span>Dilengkapi ujian Pre-Test & Post-Test CBT</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8EF] flex items-center justify-between">
                <Link
                  href={`/kegiatan/${evt.slug}`}
                  className="text-xs text-[#1B3D7B] font-semibold hover:underline"
                >
                  Detail Pelatihan →
                </Link>
                <Link
                  href={`/kegiatan/${evt.slug}/daftar`}
                  className="bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-sm"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
