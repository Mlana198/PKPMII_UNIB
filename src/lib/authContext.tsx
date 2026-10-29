'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CadreProfile, AuthAccount } from '@/lib/types';
import { 
  getCadres, 
  updateCadre, 
  getAuthAccountByEmail, 
  saveAuthAccount, 
  updateAuthAccount,
  verifyEmailAccount,
  resetPasswordAccount,
  saveExternalUser,
  getExternalUsers
} from '@/lib/storage';
import { ExternalUser } from '@/lib/types';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  cadreProfile: CadreProfile | null;
  externalProfile?: ExternalUser | null;
  account: AuthAccount | null;
  isLoading: boolean;
  isAdmin: boolean;
  isExternal: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requireVerification?: boolean; unverifiedEmail?: string }>;
  register: (email: string, password: string, cadreData: Partial<CadreProfile> & { institutionType?: 'internal' | 'external'; customInstitutionName?: string }) => Promise<{ success: boolean; error?: string; verificationCode?: string; email?: string; emailSent?: boolean; emailError?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  changeAccountCredentials: (params: { currentPassword?: string; newPassword?: string; newEmail?: string }) => Promise<{ success: boolean; error?: string }>;
  adminUpdateCadreAccount: (cadreId: string, updates: { email?: string; password?: string; isEmailVerified?: boolean }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<CadreProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  cadreProfile: null,
  externalProfile: null,
  account: null,
  isLoading: true,
  isAdmin: false,
  isExternal: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  verifyEmail: async () => ({ success: false }),
  resendVerificationCode: async () => ({ success: false }),
  requestPasswordReset: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  changeAccountCredentials: async () => ({ success: false }),
  adminUpdateCadreAccount: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [cadreProfile, setCadreProfile] = useState<CadreProfile | null>(null);
  const [externalProfile, setExternalProfile] = useState<ExternalUser | null>(null);
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync profile & auth account from storage based on email / user ID
  const fetchProfileAndAccount = (userId: string, email?: string) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cadres = getCadres();
    const matchedCadre = cadres.find(
      (c) => (cleanEmail && c.email.toLowerCase() === cleanEmail) || c.id === userId
    );
    setCadreProfile(matchedCadre || null);

    // Cari juga di data external users jika bukan kader internal
    const extUsers = getExternalUsers();
    const matchedExt = extUsers.find(
      (u) => (cleanEmail && u.email.toLowerCase() === cleanEmail) || u.id === userId
    );
    setExternalProfile(matchedExt || null);

    if (cleanEmail) {
      const acc = getAuthAccountByEmail(cleanEmail);
      setAccount(acc || null);
    } else if (matchedCadre) {
      const acc = getAuthAccountByEmail(matchedCadre.email);
      setAccount(acc || null);
    } else if (matchedExt) {
      const acc = getAuthAccountByEmail(matchedExt.email);
      setAccount(acc || null);
    } else {
      setAccount(null);
    }
  };

  useEffect(() => {
    let hasLocalSession = false;

    if (typeof window !== 'undefined') {
      const savedLocalUser = localStorage.getItem('pmii_current_user');
      if (savedLocalUser) {
        try {
          const parsed = JSON.parse(savedLocalUser);
          if (parsed && (parsed.id || parsed.email)) {
            setUser(parsed);
            fetchProfileAndAccount(parsed.id, parsed.email);
            hasLocalSession = true;
          }
        } catch {
          // ignore
        }
      }
    }

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email };
          setUser(u);
          fetchProfileAndAccount(u.id, u.email);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pmii_current_user', JSON.stringify(u));
          }
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email };
          setUser(u);
          fetchProfileAndAccount(u.id, u.email);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pmii_current_user', JSON.stringify(u));
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // Hanya bersihkan sesi lokal jika pengguna secara eksplisit melakukan sign out dari Supabase
          setUser(null);
          setCadreProfile(null);
          setAccount(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pmii_current_user');
          }
          setIsLoading(false);
        } else {
          // Event INITIAL_SESSION tanpa session aktif: jangan langsung hapus local-storage session
          // jika user sedang login via akun lokal/admin
          setIsLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Akun Admin Khusus: Langsung login tanpa verifikasi email
    if (cleanEmail === 'admin@pmii-unib.org') {
      const adminAcc = getAuthAccountByEmail(cleanEmail);
      const expectedPass = adminAcc ? adminAcc.password : 'admin123';

      if (password !== expectedPass) {
        setIsLoading(false);
        return { success: false, error: 'Kata sandi akun admin salah.' };
      }

      const adminUser = { id: 'admin-001', email: cleanEmail };
      setUser(adminUser);
      setAccount(adminAcc || {
        email: cleanEmail,
        password: expectedPass,
        cadreId: 'admin-001',
        isEmailVerified: true,
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('pmii_current_user', JSON.stringify(adminUser));
      }
      setIsLoading(false);
      return { success: true };
    }

    // 2. Cek Akun di Auth Storage (Strict Password Matching)
    const storedAccount = getAuthAccountByEmail(cleanEmail);
    if (!storedAccount) {
      setIsLoading(false);
      return { success: false, error: 'Akun dengan email ini belum terdaftar.' };
    }

    // Validasi Password Benar
    if (storedAccount.password !== password) {
      setIsLoading(false);
      return { success: false, error: 'Kata sandi yang Anda masukkan salah. Periksa kembali atau gunakan fitur lupa sandi.' };
    }

    // Validasi Verifikasi Email untuk User Biasa (Admin sudah dilewati di atas)
    if (!storedAccount.isEmailVerified) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Email Anda belum diverifikasi. Silakan masukkan kode verifikasi email terlebih dahulu.',
        requireVerification: true,
        unverifiedEmail: cleanEmail
      };
    }

    // Jika Supabase aktif, jalankan background signIn
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      } catch (err) {
        console.warn('Supabase auth background sync note:', err);
      }
    }

    // Login Sukses
    const u = { id: storedAccount.cadreId, email: storedAccount.email };
    setUser(u);
    setAccount(storedAccount);
    fetchProfileAndAccount(storedAccount.cadreId, storedAccount.email);

    if (typeof window !== 'undefined') {
      localStorage.setItem('pmii_current_user', JSON.stringify(u));
    }

    setIsLoading(false);
    return { success: true };
  };

  const register = async (
    email: string, 
    password: string, 
    cadreData: Partial<CadreProfile> & { institutionType?: 'internal' | 'external'; customInstitutionName?: string }
  ) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // Cek apakah email sudah terdaftar
    const existing = getAuthAccountByEmail(cleanEmail);
    if (existing) {
      setIsLoading(false);
      return { success: false, error: 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.' };
    }

    // Buat kode verifikasi 6 digit acak
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const isInternal = cadreData.institutionType === 'internal' && (cadreData.rayonId === 'ryn-1' || cadreData.rayonId === 'ryn-2');

    let createdId = '';
    let displayName = cadreData.fullName || 'Pengguna PMII';

    if (isInternal) {
      // 1. Pendaftar asal UNIB (Rayon Raden Rahmat / Rayon Raden Umar Said) -> Masuk ke Database Kader
      const userId = `kdr-${Date.now()}`;
      createdId = userId;
      const newProfile: CadreProfile = {
        id: userId,
        fullName: cadreData.fullName || 'Kader PMII',
        nim: cadreData.nim || '',
        university: 'Universitas Ibrahimy',
        rayonId: cadreData.rayonId || 'ryn-1',
        rayonName: cadreData.rayonName || 'Rayon Raden Rahmat',
        faculty: cadreData.faculty || 'Fakultas Sains dan Teknologi',
        studyProgram: cadreData.studyProgram || '',
        entryYear: cadreData.entryYear || 2024,
        mapabaYear: cadreData.mapabaYear || 2024,
        cadreLevel: cadreData.cadreLevel || 'MAPABA',
        gender: cadreData.gender || 'Laki-laki',
        nonFormalTrainings: [],
        phoneNumber: cadreData.phoneNumber || '',
        email: cleanEmail,
        ktaNumber: cadreData.ktaNumber || `PMII-UNIB/${new Date().getFullYear()}/${cadreData.rayonId === 'ryn-2' ? 'RUS' : 'RR'}/${cadreData.nim?.slice(-4) || '0001'}`,
        isVerified: false,
        avatarUrl: cadreData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300',
        specializationInterest: cadreData.specializationInterest || 'Kaderisasi',
        address: cadreData.address || '',
        createdAt: new Date().toISOString(),
      };

      const cadres = getCadres();
      cadres.unshift(newProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmii_cadres', JSON.stringify(cadres));
      }
      displayName = newProfile.fullName;
    } else {
      // 2. Pendaftar Luar UNIB (Lainnya / Eksternal) -> Dialihkan ke Data Pengguna Eksternal (bukan database kader)
      const extId = `ext-${Date.now()}`;
      createdId = extId;
      const extUser: ExternalUser = {
        id: extId,
        fullName: cadreData.fullName || 'Pengguna Eksternal',
        email: cleanEmail,
        phoneNumber: cadreData.phoneNumber || '',
        institutionName: cadreData.customInstitutionName?.trim() || cadreData.university || 'Luar Universitas Ibrahimy',
        studyProgram: cadreData.studyProgram || '',
        gender: cadreData.gender || 'Laki-laki',
        avatarUrl: cadreData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300',
        createdAt: new Date().toISOString(),
      };

      saveExternalUser(extUser);
      displayName = extUser.fullName;
    }

    // Buat Akun Kredensial Baru dengan verificationCode
    const newAccount: AuthAccount = {
      email: cleanEmail,
      password,
      cadreId: createdId,
      isEmailVerified: false,
      verificationCode,
      role: isInternal ? 'kader' : 'eksternal',
      createdAt: new Date().toISOString(),
    };
    saveAuthAccount(newAccount);

    // Kirim email OTP nyata via server endpoint dengan timeout 8 detik agar form tidak stuck
    let emailStatusNote: { success: boolean; error?: string; sentReal?: boolean; warning?: string } | undefined;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const emailRes = await fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: cleanEmail,
          code: verificationCode,
          type: 'verification',
          fullName: displayName,
        }),
      });

      clearTimeout(timeoutId);
      emailStatusNote = await emailRes.json().catch(() => undefined);
      if (!emailRes.ok || !emailStatusNote?.success) {
        console.warn('API send-email response warning:', emailStatusNote);
      }
    } catch (emailErr) {
      console.warn('Gagal memanggil API kirim email OTP (atau timeout):', emailErr);
    }

    setIsLoading(false);
    return { 
      success: true, 
      verificationCode, 
      email: cleanEmail,
      emailSent: emailStatusNote?.sentReal ?? false,
      emailError: emailStatusNote?.error || emailStatusNote?.warning,
    };
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = verifyEmailAccount(email, code);
    if (res.success) {
      const cleanEmail = email.trim().toLowerCase();
      const updatedAcc = getAuthAccountByEmail(cleanEmail);
      if (updatedAcc) {
        setAccount(updatedAcc);
        // Otomatis buat sesi login jika berhasil verifikasi
        const u = { id: updatedAcc.cadreId, email: updatedAcc.email };
        setUser(u);
        fetchProfileAndAccount(updatedAcc.cadreId, updatedAcc.email);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pmii_current_user', JSON.stringify(u));
        }
      }
    }
    return res;
  };

  const resendVerificationCode = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const acc = getAuthAccountByEmail(cleanEmail);
    if (!acc) {
      return { success: false, error: 'Email akun tidak terdaftar dalam sistem.' };
    }
    if (acc.isEmailVerified) {
      return { success: false, error: 'Email akun ini sudah diverifikasi sebelumnya.' };
    }

    // Buat kode OTP baru
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    updateAuthAccount(cleanEmail, { verificationCode: newCode });

    // Cari nama kader jika ada
    const cadres = getCadres();
    const cadre = cadres.find((c) => c.email.toLowerCase() === cleanEmail || c.id === acc.cadreId);

    // Kirim email OTP nyata via endpoint
    try {
      await fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: newCode,
          type: 'verification',
          fullName: cadre?.fullName,
        }),
      });
    } catch (err) {
      console.warn('Gagal memanggil API kirim email OTP:', err);
    }

    return { success: true, code: newCode };
  };

  const requestPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const acc = getAuthAccountByEmail(cleanEmail);
    if (!acc) {
      return { success: false, error: 'Email akun tidak terdaftar dalam sistem.' };
    }
    // Buat kode OTP reset 6 digit
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    updateAuthAccount(cleanEmail, { verificationCode: resetCode });

    // Cari nama kader jika ada
    const cadres = getCadres();
    const cadre = cadres.find((c) => c.email.toLowerCase() === cleanEmail || c.id === acc.cadreId);

    // Kirim email OTP reset nyata
    try {
      await fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: resetCode,
          type: 'reset',
          fullName: cadre?.fullName,
        }),
      });
    } catch (err) {
      console.warn('Gagal memanggil API kirim email reset OTP:', err);
    }

    return { success: true, code: resetCode };
  };

  const resetPassword = async (email: string, newPass: string) => {
    return resetPasswordAccount(email, newPass);
  };

  // User mandiri: ubah password / email di Pengaturan Akun
  const changeAccountCredentials = async ({ currentPassword, newPassword, newEmail }: { currentPassword?: string; newPassword?: string; newEmail?: string }) => {
    if (!user || !user.email) {
      return { success: false, error: 'Sesi akun tidak aktif.' };
    }

    const curAcc = getAuthAccountByEmail(user.email);
    if (!curAcc) {
      return { success: false, error: 'Data akun tidak ditemukan.' };
    }

    // Jika ingin ganti password, verifikasi password saat ini
    if (newPassword) {
      if (!currentPassword) {
        return { success: false, error: 'Masukkan kata sandi saat ini untuk konfirmasi.' };
      }
      if (curAcc.password !== currentPassword) {
        return { success: false, error: 'Kata sandi saat ini tidak cocok.' };
      }
      if (newPassword.length < 6) {
        return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
      }
    }

    const updates: Partial<AuthAccount> = {};
    if (newPassword) updates.password = newPassword;

    // Jika ada pergantian email
    if (newEmail && newEmail.trim().toLowerCase() !== curAcc.email) {
      const cleanNewEmail = newEmail.trim().toLowerCase();
      // Pastikan email baru belum digunakan akun lain
      const existing = getAuthAccountByEmail(cleanNewEmail);
      if (existing) {
        return { success: false, error: 'Email baru tersebut sudah digunakan oleh akun lain.' };
      }
      updates.email = cleanNewEmail;
      
      // Update juga email di CadreProfile
      if (cadreProfile) {
        updateCadre(cadreProfile.id, { email: cleanNewEmail });
      }

      // Update sesi aktif
      const updatedUser = { ...user, email: cleanNewEmail };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmii_current_user', JSON.stringify(updatedUser));
      }
    }

    const updated = updateAuthAccount(curAcc.email, updates);
    if (updated) {
      setAccount(updated);
      return { success: true };
    }
    return { success: false, error: 'Gagal memperbarui pengaturan akun.' };
  };

  // Admin bantuan: update akun kader (reset password / verifikasi manual / koreksi email)
  const adminUpdateCadreAccount = async (cadreId: string, updates: { email?: string; password?: string; isEmailVerified?: boolean }) => {
    const cadres = getCadres();
    const targetCadre = cadres.find((c) => c.id === cadreId);
    if (!targetCadre) {
      return { success: false, error: 'Data kader tidak ditemukan.' };
    }

    let acc = getAuthAccountByEmail(targetCadre.email);
    if (!acc) {
      // Jika belum ada akun auth sebelumnya, buatkan otomatis
      acc = saveAuthAccount({
        email: targetCadre.email,
        password: updates.password || 'kader123',
        cadreId: targetCadre.id,
        isEmailVerified: updates.isEmailVerified !== undefined ? updates.isEmailVerified : true,
        role: 'kader',
        createdAt: new Date().toISOString(),
      });
    }

    const accUpdates: Partial<AuthAccount> = {};
    if (updates.password && updates.password.trim().length >= 6) {
      accUpdates.password = updates.password.trim();
    }
    if (updates.isEmailVerified !== undefined) {
      accUpdates.isEmailVerified = updates.isEmailVerified;
    }
    if (updates.email && updates.email.trim().toLowerCase() !== acc.email) {
      accUpdates.email = updates.email.trim().toLowerCase();
      updateCadre(cadreId, { email: updates.email.trim().toLowerCase() });
    }

    const res = updateAuthAccount(acc.email, accUpdates);
    if (res) {
      return { success: true };
    }
    return { success: false, error: 'Gagal mengupdate akun kader.' };
  };

  const updateProfile = async (updates: Partial<CadreProfile>) => {
    if (!cadreProfile) {
      return { success: false, error: 'Tidak ada profil kader yang aktif.' };
    }

    const updated = updateCadre(cadreProfile.id, updates);
    if (!updated) {
      return { success: false, error: 'Gagal memperbarui profil di penyimpanan.' };
    }

    setCadreProfile(updated);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setCadreProfile(null);
    setAccount(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmii_current_user');
    }
  };

  const isAdmin = Boolean(
    user?.email === 'admin@pmii-unib.org' ||
    account?.role === 'superadmin'
  );

  const isExternal = Boolean(account?.role === 'eksternal');

  return (
    <AuthContext.Provider
      value={{
        user,
        cadreProfile,
        externalProfile,
        account,
        isLoading,
        isAdmin,
        isExternal,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        changeAccountCredentials,
        adminUpdateCadreAccount,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
