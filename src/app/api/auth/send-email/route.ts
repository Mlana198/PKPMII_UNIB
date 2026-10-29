import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Konfigurasi SMTP (Prioritas Utama jika tersedia atau fallback ke kredensial siapkerja.net)
const smtpHost = process.env.MAIL_HOST || 'mail.siapkerja.net';
const smtpPort = Number(process.env.MAIL_PORT || 465);
const smtpUser = process.env.MAIL_USERNAME || 'noreply@siapkerja.net';
const smtpPass = process.env.MAIL_PASSWORD || 'U5fbwxwu?+Q!F^Rz';
const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@siapkerja.net';
const mailFromName = process.env.MAIL_FROM_NAME || 'PK PMII UNIB';

// Transporter SMTP via Nodemailer
const smtpTransporter = (smtpHost && smtpUser && smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // SSL jika port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Menghindari reject sertifikat self-signed jika ada
      },
    })
  : null;

// Ambil RESEND_API_KEY dari env jika ingin digunakan sebagai fallback
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || `${mailFromName} <${mailFromAddress}>`;

// In-Memory Rate Limiter: Maksimal 5 permintaan OTP per email dalam 10 menit
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}

// Sanitasi string untuk mencegah HTML injection di dalam email
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface SendEmailPayload {
  email: string;
  code: string;
  type: 'verification' | 'reset';
  fullName?: string;
}

export async function POST(req: Request) {
  try {
    const body: SendEmailPayload = await req.json();
    const { email, code, type, fullName } = body;

    // Validasi parameter wajib
    if (!email || !code || !type) {
      return NextResponse.json(
        { success: false, error: 'Email, tipe, dan kode verifikasi wajib disertakan.' },
        { status: 400 }
      );
    }

    // Validasi format email yang ketat
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    // Validasi format kode OTP (hanya alfanumerik 4 - 8 digit)
    const codeRegex = /^[a-zA-Z0-9]{4,8}$/;
    const cleanCode = code.trim();
    if (!codeRegex.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: 'Format kode OTP tidak valid.' },
        { status: 400 }
      );
    }

    // Validasi tipe email
    if (type !== 'verification' && type !== 'reset') {
      return NextResponse.json(
        { success: false, error: 'Tipe permintaan email tidak valid.' },
        { status: 400 }
      );
    }

    // Rate Limiting Protection (Mencegah abuse & credit exhaustion)
    if (isRateLimited(cleanEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Terlalu banyak permintaan kode verifikasi ke email ini. Silakan tunggu beberapa menit sebelum mencoba kembali.' 
        },
        { status: 429 }
      );
    }

    const safeFullName = fullName ? escapeHtml(fullName.trim().slice(0, 80)) : '';
    const safeCode = escapeHtml(cleanCode);

    const isVerification = type === 'verification';
    const subject = isVerification
      ? `[PK PMII UNIB] Kode Verifikasi Email Anda: ${safeCode}`
      : `[PK PMII UNIB] Kode Reset Kata Sandi Anda: ${safeCode}`;

    const title = isVerification ? 'Verifikasi Akun Kader' : 'Permintaan Reset Kata Sandi';
    const desc = isVerification
      ? `Terima kasih telah mendaftarkan akun di portal resmi PK PMII Universitas Ibrahimy Sukorejo. Masukkan kode 6-digit di bawah ini pada sistem untuk mengaktifkan akun Anda:`
      : `Kami menerima permintaan untuk mereset kata sandi akun portal PK PMII Universitas Ibrahimy Anda. Gunakan kode 6-digit di bawah ini untuk melanjutkan:`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #1B3D7B; padding: 28px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">PK PMII UNIVERSITAS IBRAHIMY</h1>
              <p style="color: #D4A017; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Sukorejo - Situbondo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="color: #1B3D7B; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">${title}</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                Salam pergerakan, ${safeFullName ? `<strong>${safeFullName}</strong>` : 'Sahabat/Sahabati'}.<br/>
                ${desc}
              </p>
              
              <div style="background-color: #f8fafc; border: 2px dashed #1B3D7B; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Kode Keamanan Anda</span>
                <span style="font-size: 34px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #1B3D7B;">${safeCode}</span>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
                ⏱️ Kode ini berlaku selama <strong>15 menit</strong>. Jangan berikan kode ini kepada siapa pun termasuk pengurus demi menjaga keamanan akun Anda.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">Pengurus Komisariat Pergerakan Mahasiswa Islam Indonesia</p>
              <p style="margin: 4px 0 0 0;">Universitas Ibrahimy Sukorejo Situbondo Jawa Timur</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 1. Prioritas Utama: Kirim via SMTP Server (mail.siapkerja.net)
    if (smtpTransporter) {
      try {
        const info = await smtpTransporter.sendMail({
          from: `"${mailFromName}" <${mailFromAddress}>`,
          to: cleanEmail,
          subject,
          html: htmlContent,
        });

        return NextResponse.json({
          success: true,
          message: 'Email verifikasi berhasil dikirim via SMTP.',
          messageId: info.messageId,
          sentReal: true,
          provider: 'smtp',
        });
      } catch (smtpError: unknown) {
        console.error('[SMTP Send Error]', smtpError);
        // Jika SMTP gagal dan Resend ada, lanjutkan fallback ke Resend
        if (!resend) {
          const errMsg = smtpError instanceof Error ? smtpError.message : 'Gagal mengirim email melalui SMTP.';
          return NextResponse.json(
            { success: false, error: errMsg, sentReal: false },
            { status: 500 }
          );
        }
      }
    }

    // 2. Fallback: Kirim via Resend API jika dikonfigurasi
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error('[Resend Error]', error);
        return NextResponse.json(
          { 
            success: false, 
            error: error.message || 'Gagal mengirim email verifikasi.',
            sentReal: false 
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Email verifikasi berhasil dikirim via Resend.',
        id: data?.id,
        sentReal: true,
        provider: 'resend',
      });
    }

    // 3. Fallback jika tidak ada mailer aktif
    console.warn(`[OTP Server Log] Mailer tidak terdeteksi. Kode OTP untuk ${cleanEmail} adalah: ${cleanCode}`);
    return NextResponse.json({
      success: true,
      message: 'Kode OTP telah diproses.',
      sentReal: false,
      warning: 'Server mailer belum aktif.'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server saat mengirim email.';
    console.error('[Send Email Route Error]', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
