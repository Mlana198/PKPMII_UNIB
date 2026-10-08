'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1B3D7B] text-white border-t border-[#122852] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#D4A017] flex items-center justify-center shrink-0">
                <span className="text-[#1B3D7B] font-extrabold text-xs">PMII</span>
              </div>
              <div>
                <div className="font-semibold text-sm tracking-wide">PK PMII Universitas Ibrahimy</div>
                <div className="text-white/60 text-xs">Sukorejo, Situbondo, Jawa Timur</div>
              </div>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              Pengurus Komisariat Pergerakan Mahasiswa Islam Indonesia (PK PMII) Universitas Ibrahimy. Membina kader yang berakhlak karimah, kritis, dan berdaya saing berlandaskan Aswaja An-Nahdliyyah.
            </p>
            <div className="text-[#D4A017] text-xs font-medium italic">
              &quot;Dzikir, Fikir, Amal Sholeh&quot;
            </div>
          </div>

          {/* 2 Rayons */}
          <div>
            <h4 className="text-[#D4A017] text-xs font-semibold uppercase tracking-wider mb-3">
              Rayon Binaan
            </h4>
            <div className="space-y-3 text-xs">
              <div className="bg-white/5 border border-white/10 rounded p-3">
                <div className="font-semibold text-white">Rayon Raden Rahmat</div>
                <div className="text-white/70 text-[11px] mt-0.5">Fakultas Sains dan Teknologi (Saintek)</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded p-3">
                <div className="font-semibold text-white">Rayon Raden Umar Said</div>
                <div className="text-white/70 text-[11px] mt-0.5">Fakultas Tarbiyah</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-[#D4A017] text-xs font-semibold uppercase tracking-wider mb-3">
              Menu Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Database & Verifikasi Kader', href: '/kader' },
                { name: 'Formulir Registrasi Kader', href: '/kader/daftar' },
                { name: 'Informasi Pelatihan & Mapaba', href: '/kegiatan' },
                { name: 'Portal Pre-Test & Post-Test CBT', href: '/kuis' },
                { name: 'E-Library & Modul Kaderisasi', href: '/elibrary' },
                { name: 'Portal Administrasi Pengurus', href: '/admin' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/75 hover:text-[#D4A017] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 PK PMII Universitas Ibrahimy (UNIB). Khidmah untuk Agama dan Bangsa.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">Admin Login</Link>
            <span>•</span>
            <Link href="/elibrary" className="hover:text-white transition-colors">Modul AD/ART</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
