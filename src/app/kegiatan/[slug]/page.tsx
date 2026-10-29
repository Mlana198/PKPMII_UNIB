'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getEventBySlug, getEvents } from '@/lib/storage';
import { ArrowLeft, MapPin, Users, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { TrainingEvent } from '@/lib/types';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [event, setEvent] = useState<TrainingEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!slug) return;
    const found = getEventBySlug(slug);
    if (found) {
      setEvent(found);
    } else {
      const all = getEvents();
      const bySlug = all.find(e => e.slug === slug);
      if (bySlug) setEvent(bySlug);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pmii-storage-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pmii-storage-updated', handleStorage);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[#64748B] text-xs">
        Memuat detail pelatihan...
      </div>
    );
  }

  if (!event) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/kegiatan"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Jadwal Pelatihan
      </Link>

      <div className="rounded-lg overflow-hidden border border-[#E2E8EF] mb-8 max-h-[380px] bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover max-h-[380px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
              {event.eventType}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mt-1.5 leading-tight">
              {event.title}
            </h1>
            <p className="text-[#64748B] italic text-sm mt-2">&ldquo;{event.theme}&rdquo;</p>
          </div>

          <div>
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider mb-2">
              Deskripsi Acara
            </h2>
            <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          <div>
            <h2 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider mb-3">
              Persyaratan Pendaftaran
            </h2>
            {event.requirements && event.requirements.length > 0 ? (
              <ul className="space-y-2.5">
                {event.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#334155]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#64748B] italic">Tidak ada persyaratan khusus.</p>
            )}
          </div>

          {event.hasPreTest && event.preTestId && (
            <div className="bg-[#F8FAFC] border border-[#E2E8EF] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
                  Evaluasi Pembelajaran
                </span>
                <p className="text-sm font-semibold text-[#1E293B] mt-0.5">
                  Ujian Pre-Test &amp; Post-Test CBT Wajib
                </p>
                <p className="text-xs text-[#64748B]">Kerjakan ujian sebelum pembukaan kegiatan resmi.</p>
              </div>
              <Link
                href={`/kuis/${event.preTestId}`}
                className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-medium px-4 py-2 rounded transition-colors shrink-0 shadow-sm"
              >
                Buka Pre-Test <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider border-b border-[#E2E8EF] pb-2">
              Informasi Pelaksanaan
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Lokasi</div>
                  <div className="text-[#64748B] mt-0.5">{event.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Kuota Peserta</div>
                  <div className="text-[#64748B] mt-0.5">
                    {event.currentRegistered} / {event.maxQuota} peserta terdaftar
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Narahubung Panitia</div>
                  <div className="text-[#64748B] mt-0.5">{event.contactPerson?.name || 'Panitia'}</div>
                  <div className="text-[#1B3D7B] font-mono mt-0.5">{event.contactPerson?.phone || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href={`/kegiatan/${event.slug}/daftar`}
            className="block w-full bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-bold py-3 rounded text-center text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Daftar Pelatihan Ini
          </Link>
        </div>
      </div>
    </div>
  );
}
