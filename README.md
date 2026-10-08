# 🏛️ Sistem Informasi, Kaderisasi & CBT PMII Komisariat

Sistem Terpadu Pengurus Komisariat PMII (Pergerakan Mahasiswa Islam Indonesia) yang menggabungkan portal informasi & warta publik, basis data keanggotaan kader, pendaftaran pelatihan formal (Mapaba & PKD), serta ujian evaluasi pembelajaran berbasis komputer (CBT Pre-Test & Post-Test).

---

## 🌟 Fitur Utama Sistem

1. **🌐 Portal Publik & Literasi Pemikiran**:
   - Berita resmi kegiatan komisariat dan rilis pers.
   - Kanal opini, esai, dan karya intelektual kader dengan waktu baca dan tag topik.
   - E-Library dokumen & modul kaderisasi (AD/ART PMII, NDP, Modul Mapaba, Buku Saku).
2. **👥 Basis Data Kader & E-KTA Digital**:
   - Pangkalan data anggota berbasis Rayon (Fakultas) dan jenjang kaderisasi (Mapaba/PKD/PKL).
   - Formulir pendaftaran/pemutakhiran data kader online dengan nomor KTA unik terstandarisasi.
   - Kartu Tanda Anggota (E-KTA) Digital interaktif 3D Flip dilengkapi kode verifikasi QR dan siap cetak ke PDF.
3. **📅 Manajemen Pelatihan & Kegiatan (Event Management)**:
   - Pendaftaran pelatihan kaderisasi formal (MAPABA Raya, PKD) dan pelatihan non-formal.
   - Penerbitan E-Ticket resmi kegiatan dengan QR Presensi dan link grup WhatsApp.
   - Sistem skrining berkas kelayakan peserta oleh panitia.
4. **📝 Computer Based Test (CBT) Pre-Test & Post-Test**:
   - Bank soal materi ke-PMII-an, Aswaja An-Nahdliyyah, dan Paradigma Kritis Transformatif.
   - Countdown timer otomatis dengan *auto-submission*.
   - Deteksi perpindahan layar / tab-switching (*anti-cheat integrity guard*).
   - Penilaian instan (skor & passing grade) disertai pembahasan kunci jawaban.
5. **🛡️ Portal Pengurus & Administrator**:
   - Verifikasi keabsahan data kader secara instan.
   - Skrining pendaftar kegiatan (Lolos / Tolak).
   - Monitoring rekap nilai CBT peserta.
   - Ekspor seluruh basis data ke format CSV / Excel.

---

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + Turbopack
- **Styling**: Tailwind CSS v4 dengan palet identitas resmi PMII (Deep Blue & Golden Amber)
- **Komponen & Ikon**: Lucide React + Tailwind
- **QR Code Engine**: `qrcode` untuk E-KTA dan Presensi E-Ticket
- **Database & Auth Ready**: PostgreSQL via Supabase (Skrip migrasi SQL siap pakai di `supabase/schema.sql`)
- **Offline / Standalone Fallback**: Built-in reactive storage layer sehingga aplikasi langsung berfungsi penuh saat pertama kali dijalankan.

---

## 🚀 Panduan Menjalankan Sistem

### 1. Menjalankan Server Pengembangan (Development)
```bash
npm run dev
```
Buka browser pada alamat: [http://localhost:3000](http://localhost:3000)

### 2. Membangun Versi Produksi (Production Build)
```bash
npm run build
npm run start
```

---

## 📁 Struktur Halaman & Routing

- `/` — Beranda (Hero, statistik kader, agenda aktif, warta pilihan)
- `/berita` — Indeks warta & opini dengan filter kategori dan pencarian
- `/berita/[slug]` — Halaman artikel lengkap dengan bio penulis dan share WhatsApp
- `/kader` — Direktori database kader terverifikasi se-komisariat
- `/kader/daftar` — Formulir registrasi anggota baru & generate KTA
- `/kader/kta/[id]` — Tampilan Kartu Tanda Anggota (E-KTA) Digital 3D Flip
- `/kegiatan` — Agenda pelatihan kaderisasi dan pendaftaran
- `/kegiatan/[slug]` — Detail kegiatan & persyaratan
- `/kegiatan/[slug]/daftar` — Formulir registrasi peserta pelatihan
- `/kegiatan/tiket/[registrationId]` — E-Ticket kegiatan dengan QR Presensi
- `/kuis` — Portal CBT Pre-Test & Post-Test
- `/kuis/[quizId]` — Lembar pengerjaan ujian interaktif & hasil evaluasi
- `/elibrary` — Arsip modul, AD/ART, dan buku saku NDP PMII
- `/admin` — Dashboard backoffice pengurus komisariat

---

## 🏛️ Nilai Dasar Organisasi
- **Tri Motto**: Dzikir, Fikir, Amal Sholeh
- **Tri Khidmah**: Taqwa, Intelektualitas, Advokasi
- **Tri Komitmen**: Kejujuran, Kebenaran, Keadilan
