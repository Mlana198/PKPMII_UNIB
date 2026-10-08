import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/authContext';

export const metadata: Metadata = {
  title: 'PK PMII Universitas Ibrahimy (UNIB) — Portal Resmi',
  description: 'Portal Resmi Pengurus Komisariat Pergerakan Mahasiswa Islam Indonesia (PK PMII) Universitas Ibrahimy Sukorejo Situbondo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#1E293B]">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-[#1B3D7B]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
