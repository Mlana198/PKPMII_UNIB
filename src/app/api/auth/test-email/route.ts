import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const fromName = process.env.MAIL_FROM_NAME || 'PK PMII UNIB';

  // Sensor password untuk keamanan (tampilkan panjang karakter saja)
  const passLength = pass ? pass.length : 0;
  const userPreview = user ? `${user.slice(0, 3)}***@${user.split('@')[1] || ''}` : '(belum diisi)';

  if (!host || !user || !pass) {
    return NextResponse.json({
      status: 'CONFIG_MISSING',
      message: 'Variabel Environment SMTP belum lengkap di Vercel.',
      details: {
        MAIL_HOST: host || 'KOSONG',
        MAIL_PORT: port,
        MAIL_USERNAME: user ? 'TERISI' : 'KOSONG',
        MAIL_PASSWORD: pass ? `TERISI (${passLength} karakter)` : 'KOSONG',
      },
      solusi: 'Pastikan MAIL_HOST, MAIL_PORT, MAIL_USERNAME, dan MAIL_PASSWORD sudah diisi di Vercel Environment Variables dan sudah di-Redeploy.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: pass.replace(/\s+/g, ''), // buang spasi jika ada
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verifikasi koneksi handshake dan login
    await transporter.verify();

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Koneksi ke SMTP Server BERHASIL dan SIAP mengirim email!',
      details: {
        host,
        port,
        user: userPreview,
        passLength,
        fromName,
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      status: 'SMTP_ERROR',
      message: 'Server gagal terhubung atau ditolak oleh Google/SMTP.',
      error: message,
      details: {
        host,
        port,
        user: userPreview,
        passLength,
      },
      petunjuk: message.includes('BadCredentials') || message.includes('535') 
        ? 'Password salah atau ditolak Google. Pastikan menggunakan 16 karakter Sandi Aplikasi (App Password) Google, BUKAN password login Gmail biasa.'
        : 'Periksa host, port, atau koneksi jaringan.'
    }, { status: 500 });
  }
}
