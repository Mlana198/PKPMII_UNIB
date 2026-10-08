'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

const navLinks = [
  { name: 'Beranda', href: '/' },
  { name: 'Warta & Opini', href: '/berita' },
  { name: 'Database Kader', href: '/kader' },
  { name: 'Pelatihan', href: '/kegiatan' },
  { name: 'CBT Ujian', href: '/kuis' },
  { name: 'E-Library', href: '/elibrary' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, cadreProfile, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 bg-[#1B3D7B] ${
      scrolled ? 'shadow-md border-b border-[#122852]' : 'border-b border-[#2552a5]/40'
    }`}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded bg-[#D4A017] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <span className="text-[#1B3D7B] font-extrabold text-xs tracking-tight">PMII</span>
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold text-sm tracking-wide">PK PMII UNIB</div>
            <div className="text-[#D4A017] text-[10px] font-medium tracking-wider uppercase">Universitas Ibrahimy</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded transition-colors ${
                  active
                    ? 'text-[#D4A017] bg-white/10'
                    : 'text-white/85 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Actions / Right Buttons (Adaptive to Auth) */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                >
                  Admin Portal
                </Link>
              ) : null}

              <Link
                href="/kader/dashboard"
                className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold text-xs px-3.5 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>{cadreProfile?.fullName?.split(' ')[0] || 'Dashboard'}</span>
              </Link>

              <button
                onClick={() => logout()}
                className="text-white/60 hover:text-white p-1.5 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-white/80 hover:text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold text-xs px-3.5 py-2 rounded transition-colors shadow-sm"
              >
                Daftar Kader
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white/90 p-2 rounded hover:bg-white/10 transition"
          aria-label="Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#122852] border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  active
                    ? 'text-[#D4A017] bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 mt-3 grid grid-cols-2 gap-2">
            {user ? (
              <>
                <Link
                  href="/kader/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 bg-[#D4A017] text-[#1B3D7B] font-semibold text-xs rounded"
                >
                  Dashboard Kader
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-center py-2 text-red-300 border border-red-500/30 text-xs rounded"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 text-white/80 text-xs rounded border border-white/20 hover:bg-white/5 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-semibold text-xs rounded transition"
                >
                  Daftar Kader
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
