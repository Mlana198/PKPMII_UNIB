import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const targetEmail = url.searchParams.get('to') || process.env.MAIL_USERNAME;

  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const fromName = process.env.MAIL_FROM_NAME || 'PK PMII UNIB';

  if (!targetEmail) {
    return NextResponse.json({ error: 'Parameter "to" diperlukan (contoh: ?to=nama@gmail.com)' }, { status: 400 });
  }

  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Konfigurasi SMTP belum lengkap di Vercel.' }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: pass.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: targetEmail,
      subject: '[PK PMII UNIB] Uji Coba Pengiriman Email Berhasil!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1B3D7B;">Uji Coba Pengiriman Email Sukses!</h2>
          <p>Halo Sahabat,</p>
          <p>Jika Anda membaca email ini, berarti integrasi SMTP Gmail untuk website resmi PK PMII Universitas Ibrahimy telah <strong>aktif dan berhasil mengirimkan email</strong> secara nyata!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Pengurus Komisariat PMII Universitas Ibrahimy Sukorejo Situbondo</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Email uji coba berhasil dikirim ke ${targetEmail}!`,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}
