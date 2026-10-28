'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { getCadres } from '@/lib/storage';
import { Printer, ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { getLeadership, setLeadership } from '@/lib/leadership';

export default function DatabasePrintPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [cadres, setCadres] = useState(getCadres());
  const [filterRayon, setFilterRayon] = useState('ALL');
  const [leadership, setLeadershipState] = useState({ ketua: 'M. Rofiul Anam', sekretaris: 'Ahmad Wildan Zainur R' });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cur = getLeadership();
      setLeadershipState(cur);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/unauthorized');
    }
  }, [user, isAdmin, isLoading, router]);  const filteredCadres = cadres.filter((c) => {
    if (filterRayon === 'ALL') return true;
    if (filterRayon === 'SAINTEK') return c.rayonId === 'ryn-1' || c.faculty?.includes('SAINS');
    if (filterRayon === 'TARBIYAH') return c.rayonId === 'ryn-2' || c.faculty?.includes('TARBIYAH');
    return true;
  });

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-[#64748B]">
        Memvalidasi otorisasi pengurus...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      {/* Control bar / toolbar no-print */}
      <div className="max-w-[1240px] mx-auto mb-6 bg-white border border-[#CBD5E1] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <span className="text-[#CBD5E1]">|</span>
          <span className="text-xs font-semibold text-[#1E293B]">
            Format Resmi Cetak / Unduh PDF (Kertas F4 / Legal Landscape)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterRayon}
            onChange={(e) => setFilterRayon(e.target.value)}
            className="border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#1B3D7B] bg-white"
          >
            <option value="ALL">Semua Fakultas / Rayon</option>
            <option value="SAINTEK">Rayon Raden Rahmat (Sains & Teknologi)</option>
            <option value="TARBIYAH">Rayon Raden Umar Said (Tarbiyah)</option>
          </select>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak / Simpan PDF (F4 Landscape)
          </button>
        </div>
      </div>

      {/* Area Dokumen Resmi Cetak F4 Landscape */}
      <div
        id="printable-area"
        className="max-w-[1240px] mx-auto bg-white p-8 sm:p-10 border border-slate-300 shadow-md print:border-none print:shadow-none print:p-0"
        style={{
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
        {/* KOP SURAT RESMI */}
        <div className="relative border-b-4 border-double border-blue-900 pb-3 mb-6">
          <div className="flex items-start justify-between">
            {/* Logo PMII & Kode Wilayah V-04 */}
            <div className="flex flex-col items-center justify-center shrink-0 w-28">
              {/* Logo Bintang 9 PMII */}
              <div className="w-16 h-16 rounded-full bg-[#1B3D7B] border-2 border-[#D4A017] flex flex-col items-center justify-center text-white relative shadow-sm">
                <div className="text-[7px] text-[#D4A017] font-bold tracking-widest leading-none mb-0.5">★★★★★</div>
                <span className="font-extrabold text-sm tracking-wider text-white">PMII</span>
                <div className="text-[7px] text-[#D4A017] font-bold tracking-widest leading-none mt-0.5">★★★★</div>
              </div>
              <span className="font-bold text-xs text-[#1B3D7B] tracking-wider mt-1.5">
                V-04
              </span>
            </div>

            {/* Tulisan Kop Surat */}
            <div className="flex-1 text-center px-4">
              <h2 className="text-base sm:text-lg font-bold text-blue-900 uppercase tracking-wide leading-tight">
                PENGURUS KOMISARIAT
              </h2>
              <h1 className="text-lg sm:text-xl font-extrabold text-blue-900 uppercase tracking-wider leading-tight">
                PERGERAKAN MAHASISWA ISLAM INDONESIA
              </h1>
              <p className="text-xs italic text-blue-800 font-semibold leading-tight">
                (Indonesian Moslem Student Movement)
              </p>
              <h3 className="text-base sm:text-lg font-bold text-blue-900 uppercase tracking-wide leading-tight mt-0.5">
                UNIVERSITAS IBRAHIMY SITUBONDO
              </h3>
              <p className="text-[11px] text-gray-700 leading-snug mt-1 font-sans">
                Sekretariat: Parse, Dawuhan, Kec. Situbondo, Kab. Situbondo Jawa Timur
              </p>
              <p className="text-[11px] text-gray-700 leading-snug font-sans">
                Telp: 081336485967 / 081357661867 &nbsp;|&nbsp; Email: <span className="text-blue-700 underline">komisariatunib@gmail.com</span>
              </p>
            </div>

            {/* Dummy placeholder spacer for symmetrical center */}
            <div className="w-28 shrink-0 hidden sm:block"></div>
          </div>

          {/* Garis Ganda Pembatas */}
          <div className="mt-3 border-t-2 border-blue-900"></div>
          <div className="mt-0.5 border-t border-black"></div>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-5">
          <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-black">
            DATABASE KOMISARIAT UNIVERSITAS IBRAHIMY SITUBONDO
          </h2>
        </div>

        {/* TABEL DATABASE SESUAI FORMAT LAMPIRAN RESMI */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-[#EAB308] text-black font-extrabold uppercase text-center border-b border-black">
                <th className="border border-black px-2 py-2.5 w-10">NO</th>
                <th className="border border-black px-3 py-2.5">NAMA</th>
                <th className="border border-black px-3 py-2.5 w-32">FAKULTAS</th>
                <th className="border border-black px-2 py-2.5 w-16">JURUSAN</th>
                <th className="border border-black px-3 py-2.5 w-32">NO.TLP</th>
                <th className="border border-black px-3 py-2.5">E-MAIL</th>
                <th className="border border-black px-2 py-2.5 w-20">FOTO</th>
                <th className="border border-black px-2 py-2.5 w-20">ANGKATAN</th>
                <th className="border border-black px-3 py-2.5 w-36">ALAMAT</th>
              </tr>
            </thead>
            <tbody>
              {filteredCadres.map((cadre, index) => (
                <tr
                  key={cadre.id}
                  className="border-b border-black hover:bg-yellow-50/50 print:hover:bg-transparent"
                >
                  {/* NO */}
                  <td className="border border-black px-2 py-2 text-center font-bold">
                    {index + 1}.
                  </td>

                  {/* NAMA */}
                  <td className="border border-black px-3 py-2 font-bold uppercase tracking-wide">
                    {cadre.fullName}
                  </td>

                  {/* FAKULTAS */}
                  <td className="border border-black px-3 py-2 text-center uppercase font-medium">
                    {cadre.faculty?.includes('SAINS')
                      ? 'SAINS & TEKNOLOGI'
                      : cadre.faculty?.includes('TARBIYAH')
                      ? 'TARBIYAH'
                      : cadre.faculty}
                  </td>

                  {/* JURUSAN */}
                  <td className="border border-black px-2 py-2 text-center font-bold uppercase">
                    {cadre.studyProgram === 'Teknologi Informasi' ? 'TI' : cadre.studyProgram}
                  </td>

                  {/* NO.TLP */}
                  <td className="border border-black px-3 py-2 text-center font-mono">
                    {cadre.phoneNumber}
                  </td>

                  {/* E-MAIL */}
                  <td className="border border-black px-3 py-2 text-center text-blue-700 underline font-sans">
                    {cadre.email}
                  </td>

                  {/* FOTO RESMI BERJAS */}
                  <td className="border border-black p-1 text-center align-middle">
                    <div className="w-12 h-14 mx-auto border border-black overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          cadre.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150'
                        }
                        alt={cadre.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>

                  {/* ANGKATAN MAPABA */}
                  <td className="border border-black px-2 py-2 text-center font-bold">
                    {cadre.mapabaYear || cadre.entryYear}
                  </td>

                  {/* ALAMAT */}
                  <td className="border border-black px-3 py-2 uppercase font-medium">
                    {cadre.address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Pengurus Pengesah (Kaki Dokumen Resmi) */}
        <div className="mt-8 pt-4 flex justify-between items-end text-xs text-black font-sans print:break-inside-avoid">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p className="font-bold">Ketua Mandataris PK PMII UNIB</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{leadership.ketua}</p>
            <p className="text-[10px]">KTA: PMII-UNIB/2021/RR/0001</p>
          </div>

          <div className="text-center w-64">
            <p>Situbondo, 10 Oktober 2026</p>
            <p className="font-bold">Sekretaris Komisariat</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{leadership.sekretaris}</p>
            <p className="text-[10px]">KTA: PMII-UNIB/2023/RUS/0031</p>
          </div>
        </div>
      </div>
    </div>
  );
}
