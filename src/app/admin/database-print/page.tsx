'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { getCadres } from '@/lib/storage';
import { Printer, ArrowLeft, Download, ShieldAlert, Edit2, Check } from 'lucide-react';
import { getLeadership, setLeadership } from '@/lib/leadership';

export default function DatabasePrintPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [cadres, setCadres] = useState(getCadres());
  const [filterRayon, setFilterRayon] = useState('ALL');
  const [leadership, setLeadershipState] = useState({ ketua: 'M. Rofiul Anam', sekretaris: 'Ahmad Wildan Zainur R' });

  // State untuk kontak kop surat yang dapat diedit langsung
  const [isEditingKop, setIsEditingKop] = useState(false);
  const [kopAddress, setKopAddress] = useState('Sekretariat: Parse, Dawuhan, Ke. Situbondo, Kab. Situbondo Jawa Timur');
  const [kopPhone, setKopPhone] = useState('081336485967/081357661867');
  const [kopEmail, setKopEmail] = useState('komisariatunib@gmail.com');
  const [kopWebsite, setKopWebsite] = useState('http://pmii-unib.or.id');
  const [kopCode, setKopCode] = useState('V-04');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cur = getLeadership();
      setLeadershipState(cur);

      // Muat pengaturan kontak kop jika sudah pernah disimpan
      const savedKop = localStorage.getItem('pmii_kop_settings');
      if (savedKop) {
        try {
          const parsed = JSON.parse(savedKop);
          if (parsed.address) setKopAddress(parsed.address);
          if (parsed.phone) setKopPhone(parsed.phone);
          if (parsed.email) setKopEmail(parsed.email);
          if (parsed.website) setKopWebsite(parsed.website);
          if (parsed.code) setKopCode(parsed.code);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const saveKopSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmii_kop_settings', JSON.stringify({
        address: kopAddress,
        phone: kopPhone,
        email: kopEmail,
        website: kopWebsite,
        code: kopCode,
      }));
    }
    setIsEditingKop(false);
  };

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
            onClick={() => setIsEditingKop(!isEditingKop)}
            className="inline-flex items-center gap-1.5 border border-[#1B3D7B] text-[#1B3D7B] hover:bg-blue-50 text-xs font-semibold px-3.5 py-2 rounded transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" /> {isEditingKop ? 'Tutup Edit Kop' : 'Edit Kontak Kop'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak / Simpan PDF (F4 Landscape)
          </button>
        </div>
      </div>

      {/* Editor Kontak Kop Surat (Hanya Tampil Saat Mode Edit Aktif, No Print) */}
      {isEditingKop && (
        <div className="max-w-[1240px] mx-auto mb-6 bg-white border-2 border-blue-200 rounded-lg p-5 shadow-sm no-print space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-1.5">
              <Edit2 className="w-4 h-4" /> Edit Informasi Kontak & Alamat Kop Surat
            </h3>
            <span className="text-[11px] text-[#64748B]">Perubahan akan tersimpan otomatis untuk pencetakan berikutnya</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Alamat Sekretariat</label>
              <input
                type="text"
                value={kopAddress}
                onChange={(e) => setKopAddress(e.target.value)}
                className="w-full border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#1E293B]"
                placeholder="Sekretariat: ..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Nomor Telepon / HP</label>
              <input
                type="text"
                value={kopPhone}
                onChange={(e) => setKopPhone(e.target.value)}
                className="w-full border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#1E293B]"
                placeholder="081336485967/081357661867"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Email Resmi</label>
              <input
                type="email"
                value={kopEmail}
                onChange={(e) => setKopEmail(e.target.value)}
                className="w-full border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#1E293B]"
                placeholder="komisariatunib@gmail.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Website Resmi</label>
              <input
                type="text"
                value={kopWebsite}
                onChange={(e) => setKopWebsite(e.target.value)}
                className="w-full border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#1E293B]"
                placeholder="http://pmii-unib.or.id"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Kode Wilayah / Komisariat</label>
              <input
                type="text"
                value={kopCode}
                onChange={(e) => setKopCode(e.target.value)}
                className="w-full border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#1E293B]"
                placeholder="V-04"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={saveKopSettings}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> Simpan Perubahan Kop
            </button>
          </div>
        </div>
      )}

      {/* Area Dokumen Resmi Cetak F4 Landscape */}
      <div
        id="printable-area"
        className="max-w-[1240px] mx-auto bg-white p-8 sm:p-10 border border-slate-300 shadow-md print:border-none print:shadow-none print:p-0"
        style={{
          fontFamily: "'Arial Narrow', Arial, 'Helvetica Neue', Helvetica, sans-serif",
          fontSize: '11pt',
        }}
      >
        {/* KOP SURAT RESMI SESUAI STANDAR PEDOMAN ADMINISTRASI PMII */}
        <div className="relative pb-1 mb-4">
          <div className="flex items-center justify-between">
            {/* Logo Resmi PMII & Kode Wilayah V-04 (Sebelah Kiri) */}
            <div className="flex flex-col items-center justify-center shrink-0 w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/pmii-official.png"
                alt="Logo Resmi PMII"
                className="w-20 h-auto max-h-24 object-contain"
              />
              <span 
                className="font-bold text-black tracking-wider mt-1"
                style={{ fontFamily: "'Arial Narrow', sans-serif", fontSize: '11pt' }}
              >
                {kopCode}
              </span>
            </div>

            {/* Tulisan Kop Surat Sesuai Pedoman: Arial Narrow 14pt Bold Biru, Monotype Corsiva 11pt, Arial Narrow 11pt */}
            <div 
              className="flex-1 text-center px-2"
              style={{
                color: '#0047AB',
                lineHeight: 1.0,
              }}
            >
              {/* Baris 1: Tingkat Kepengurusan (Arial Narrow Bold 14pt Biru) */}
              <h2 
                className="font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: '14pt', margin: '0 0 2px 0', lineHeight: 1.0 }}
              >
                PENGURUS KOMISARIAT
              </h2>

              {/* Baris 2: Nama Organisasi (Arial Narrow Bold 14pt Biru) */}
              <h1 
                className="font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: '14pt', margin: '0 0 2px 0', lineHeight: 1.0 }}
              >
                PERGERAKAN MAHASISWA ISLAM INDONESIA
              </h1>

              {/* Baris 3: Bahasa Inggris Semua Tingkat Kepengurusan (Monotype Corsiva 11pt Biru) */}
              <p 
                style={{
                  fontFamily: "'Monotype Corsiva', 'Apple Chancery', cursive, serif",
                  fontSize: '11pt',
                  fontStyle: 'italic',
                  margin: '1px 0 2px 0',
                  lineHeight: 1.0,
                }}
              >
                (Commissariat Board of Indonesian Moslem Student Movement)
              </p>

              {/* Baris 4: Lembaga / Kampus (Arial Narrow Bold 14pt Biru) */}
              <h3 
                className="font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: '14pt', margin: '2px 0 3px 0', lineHeight: 1.0 }}
              >
                UNIVERSITAS IBRAHIMY SITUBONDO
              </h3>

              {/* Baris 5: Alamat (Arial Narrow 11pt Biru, Spasi 1.0) */}
              <p 
                style={{
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontSize: '11pt',
                  margin: '1px 0',
                  lineHeight: 1.1,
                }}
              >
                {kopAddress}
              </p>

              {/* Baris 6: CP, Email, Website (Arial Narrow 11pt Biru, Spasi 1.0) */}
              <p 
                style={{
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontSize: '11pt',
                  margin: '1px 0',
                  lineHeight: 1.1,
                }}
              >
                Telp: {kopPhone} &nbsp;|&nbsp; Email: <span className="underline">{kopEmail}</span>
                {kopWebsite && <span> &nbsp;|&nbsp; Website: {kopWebsite}</span>}
              </p>
            </div>

            {/* Spacer simetris sebelah kanan */}
            <div className="w-28 shrink-0 hidden sm:block"></div>
          </div>

          {/* 
            Garis Pembatas Sesuai Aturan Pedoman Administrasi PMII:
            (5) Garis atas ukuran 1 1/2 pt (1.5pt) berwarna biru
            (6) Garis bawah ukuran 2 1/4 pt (2.25pt) berwarna abu-abu
          */}
          <div className="mt-3">
            <div style={{ borderTop: '1.5pt solid #0047AB' }}></div>
            <div style={{ height: '2pt' }}></div>
            <div style={{ borderTop: '2.25pt solid #808080' }}></div>
          </div>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-4">
          <h2 className="text-[13pt] font-extrabold tracking-wide uppercase text-black">
            DATABASE KOMISARIAT UNIVERSITAS IBRAHIMY SITUBONDO
          </h2>
        </div>

        {/* TABEL DATABASE SESUAI FORMAT LAMPIRAN RESMI */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[11pt]">
            <thead>
              <tr className="bg-[#EAB308] text-black font-extrabold uppercase text-center border-b border-black">
                <th className="border border-black px-2 py-2 w-10">NO</th>
                <th className="border border-black px-2 py-2">NAMA</th>
                <th className="border border-black px-2 py-2 w-32">FAKULTAS</th>
                <th className="border border-black px-2 py-2 w-16">JURUSAN</th>
                <th className="border border-black px-2 py-2 w-32">NO.TLP</th>
                <th className="border border-black px-2 py-2">E-MAIL</th>
                <th className="border border-black px-2 py-2 w-20">FOTO</th>
                <th className="border border-black px-2 py-2 w-20">ANGKATAN</th>
                <th className="border border-black px-2 py-2 w-36">ALAMAT</th>
              </tr>
            </thead>
            <tbody>
              {filteredCadres.map((cadre, index) => (
                <tr
                  key={cadre.id}
                  className="border-b border-black hover:bg-yellow-50/50 print:hover:bg-transparent"
                >
                  {/* NO */}
                  <td className="border border-black px-2 py-1.5 text-center font-bold">
                    {index + 1}.
                  </td>

                  {/* NAMA */}
                  <td className="border border-black px-2 py-1.5 font-bold uppercase tracking-wide">
                    {cadre.fullName}
                  </td>

                  {/* FAKULTAS */}
                  <td className="border border-black px-2 py-1.5 text-center uppercase font-medium">
                    {cadre.faculty?.includes('SAINS')
                      ? 'SAINS & TEKNOLOGI'
                      : cadre.faculty?.includes('TARBIYAH')
                      ? 'TARBIYAH'
                      : cadre.faculty}
                  </td>

                  {/* JURUSAN */}
                  <td className="border border-black px-2 py-1.5 text-center font-bold uppercase">
                    {cadre.studyProgram === 'Teknologi Informasi' ? 'TI' : cadre.studyProgram}
                  </td>

                  {/* NO.TLP */}
                  <td className="border border-black px-2 py-1.5 text-center">
                    {cadre.phoneNumber}
                  </td>

                  {/* E-MAIL */}
                  <td className="border border-black px-2 py-1.5 text-center text-blue-700 underline">
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
                  <td className="border border-black px-2 py-1.5 text-center font-bold">
                    {cadre.mapabaYear || cadre.entryYear}
                  </td>

                  {/* ALAMAT */}
                  <td className="border border-black px-2 py-1.5 uppercase font-medium">
                    {cadre.address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Pengurus Pengesah (Kaki Dokumen Resmi) */}
        <div className="mt-8 pt-4 flex justify-between items-end text-[11pt] text-black print:break-inside-avoid">
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
