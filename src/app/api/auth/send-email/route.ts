import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Ambil RESEND_API_KEY dari env, jika belum diatur buat fallback log server
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || 'PMII UNIB <onboarding@resend.dev>';

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

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email dan kode verifikasi wajib disertakan.' },
        { status: 400 }
      );
    }

    const isVerification = type === 'verification';
    const subject = isVerification
      ? `[PK PMII UNIB] Kode Verifikasi Email Anda: ${code}`
      : `[PK PMII UNIB] Kode Reset Kata Sandi Anda: ${code}`;

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
                Salam pergerakan, ${fullName ? `<strong>${fullName}</strong>` : 'Sahabat/Sahabati'}.<br/>
                ${desc}
              </p>
              
              <div style="background-color: #f8fafc; border: 2px dashed #1B3D7B; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Kode Keamanan Anda</span>
                <span style="font-size: 34px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #1B3D7B;">${code}</span>
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

    // Jika RESEND_API_KEY tersedia, kirim email secara nyata
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
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
        message: 'Email verifikasi berhasil dikirim ke alamat email tujuan.',
        id: data?.id,
        sentReal: true
      });
    } else {
      // Jika RESEND_API_KEY belum dipasang di .env.local, log ke console server
      console.warn(`[OTP Server Log] RESEND_API_KEY tidak terdeteksi. Kode OTP untuk ${email} adalah: ${code}`);
      return NextResponse.json({
        success: true,
        message: 'Kode OTP telah diproses.',
        sentReal: false,
        warning: 'RESEND_API_KEY belum dikonfigurasi di file environment (.env.local). Pastikan untuk menambahkan RESEND_API_KEY agar email terkirim langsung ke inbox.'
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server saat mengirim email.';
    console.error('[Send Email Route Error]', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
