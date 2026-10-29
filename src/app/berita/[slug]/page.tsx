'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticleBySlug, getArticles, getCadres } from '@/lib/storage';
import { Article, CadreProfile } from '@/lib/types';
import { ArrowLeft, Share2, ZoomIn, X } from 'lucide-react';

// Kata kunci yang mengidentifikasi penulis sebagai tim redaksi/humas, bukan kader individual
const HUMAS_KEYWORDS = [
  'biro humas', 'tim humas', 'redaksi', 'panitia', 'pengurus', 'komisariat',
];

function isHumasAuthor(name: string): boolean {
  const lower = name.toLowerCase();
  return HUMAS_KEYWORDS.some((kw) => lower.includes(kw));
}

// Logo PK PMII UNIB — digunakan untuk penulis tim/redaksi
const LOGO_PMII = '/images/logos/komisariat.png';

function AuthorAvatar({
  article,
  cadres,
}: {
  article: Article;
  cadres: CadreProfile[];
}) {
  // Prioritas 1: Jika penulis adalah Humas/Redaksi → gunakan logo PK PMII UNIB
  if (isHumasAuthor(article.authorName)) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1B3D7B] shrink-0 flex items-center justify-center p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_PMII}
          alt="PK PMII UNIB"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Prioritas 2: Cari avatar penulis dari database kader (cocokkan nama)
  const cadreMatch = cadres.find(
    (c) => c.fullName.toLowerCase() === article.authorName.toLowerCase()
  );
  if (cadreMatch?.avatarUrl) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E2E8EF] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cadreMatch.avatarUrl} alt={article.authorName} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Prioritas 3: Gunakan authorAvatar yang tersimpan di artikel (jika ada & bukan stok Unsplash laki-laki untuk perempuan)
  if (article.authorAvatar) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E2E8EF] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Prioritas 4 (fallback): Logo PK PMII UNIB jika tidak ada foto sama sekali
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1B3D7B] shrink-0 flex items-center justify-center p-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_PMII} alt="PK PMII UNIB" className="w-full h-full object-contain" />
    </div>
  );
}

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [related, setRelated] = useState<Article[]>([]);
  const [cadres, setCadres] = useState<CadreProfile[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    setCadres(getCadres());
    const found = getArticleBySlug(slug);
    if (found) {
      setArticle(found);
      const other = getArticles()
        .filter((a) => a.id !== found.id)
        .slice(0, 2);
      setRelated(other);
    } else {
      setArticle(null);
    }
  }, [slug]);

  if (article === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center text-xs text-[#64748B]">
        Memuat warta & artikel...
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-[#64748B] space-y-3">
        <h2 className="text-xl font-bold text-[#1E293B]">Artikel Tidak Ditemukan</h2>
        <p className="text-xs text-[#64748B]">
          Warta atau tulisan opini yang Anda cari tidak tersedia atau tautan telah diperbarui.
        </p>
        <div>
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portal Warta & Opini
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back button */}
      <Link
        href="/berita"
        className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1B3D7B] mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Warta
      </Link>

      {/* Meta header */}
      <div className="space-y-3 mb-6">
        <span className="text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
          {article.category}
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E293B] leading-tight">
          {article.title}
        </h1>
      </div>

      {/* Author and Date Strip */}
      <div className="flex items-center gap-3.5 py-4 border-y border-[#E2E8EF] mb-8">
        <AuthorAvatar article={article} cadres={cadres} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#1E293B]">{article.authorName}</p>
          <p className="text-xs text-[#64748B]">{article.authorRole} • {article.readTimeMinutes} menit baca</p>
        </div>
      </div>

      {/* Featured image (Sebelum diklik ukuran tetap seperti saat ini max-h-[420px] object-cover) */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="relative group rounded-lg overflow-hidden border border-[#E2E8EF] mb-8 max-h-[420px] bg-slate-50 cursor-pointer shadow-xs transition-shadow hover:shadow-md"
        title="Klik untuk melihat preview dalam ukuran asli"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover max-h-[420px] transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs transition-opacity opacity-90 group-hover:opacity-100 shadow-sm">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Lihat Ukuran Asli</span>
        </div>
      </div>

      {/* Modal / Mode Preview Menyesuaikan Ukuran Asli Gambar */}
      {isPreviewOpen && (
        <div
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all duration-200 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center"
          >
            {/* Header Toolbar Modal Preview */}
            <div className="w-full flex items-center justify-between pb-2.5 text-white/90 px-1">
              <span className="text-xs font-semibold truncate max-w-xs sm:max-w-lg">
                {article.title} — Foto Warta (Ukuran Asli)
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors flex items-center gap-1 text-xs px-3 shadow"
              >
                <X className="w-4 h-4" />
                <span className="text-[11px] font-medium">Tutup</span>
              </button>
            </div>

            {/* Gambar Menyesuaikan Ukuran Asli Tanpa Terpotong (object-contain) */}
            <div className="overflow-auto max-h-[85vh] max-w-[95vw] rounded-lg border border-white/20 bg-black/50 p-1 flex items-center justify-center shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.title}
                className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Excerpt quote */}
      <div className="border-l-4 border-[#D4A017] pl-4 py-1 italic text-[#64748B] text-base leading-relaxed mb-8 bg-[#F8FAFC]">
        {article.excerpt}
      </div>

      {/* Main Content */}
      <div className="text-[#334155] text-base leading-relaxed space-y-5">
        {article.content.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={index} className="text-lg font-bold text-[#1B3D7B] pt-4 mb-2">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('> ')) {
            return (
              <blockquote key={index} className="border-l-4 border-[#1B3D7B] pl-4 italic text-[#475569] my-4">
                {paragraph.replace('> ', '')}
              </blockquote>
            );
          }
          return <p key={index}>{paragraph}</p>;
        })}
      </div>

      {/* Tags & Share */}
      <div className="mt-12 pt-6 border-t border-[#E2E8EF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs border border-[#E2E8EF] text-[#64748B] px-2.5 py-1 rounded bg-[#F8FAFC]">
              #{tag}
            </span>
          ))}
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - https://pmii-unib.ac.id/berita/${article.slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#1B3D7B] border border-[#1B3D7B] hover:bg-[#1B3D7B] hover:text-white px-3.5 py-2 rounded transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> Bagikan ke WhatsApp
        </a>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="mt-16 pt-8 border-t border-[#E2E8EF]">
          <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
            Artikel Terkait Lainnya
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/berita/${r.slug}`}
                className="p-4 bg-white border border-[#E2E8EF] rounded-lg hover:border-[#1B3D7B] transition-colors block"
              >
                <span className="text-[10px] text-[#D4A017] font-semibold uppercase">{r.category}</span>
                <p className="text-sm font-semibold text-[#1E293B] mt-1 line-clamp-2">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
