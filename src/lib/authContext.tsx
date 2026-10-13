'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CadreProfile } from '@/lib/types';
import { getCadres, updateCadre } from '@/lib/storage';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  cadreProfile: CadreProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, cadreData: Partial<CadreProfile>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<CadreProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  cadreProfile: null,
  isLoading: true,
  isAdmin: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [cadreProfile, setCadreProfile] = useState<CadreProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync profile from local/Supabase based on email/user ID
  const fetchProfile = (userId: string, email?: string) => {
    const cadres = getCadres();
    // Cari kader berdasarkan email atau user id
    const matched = cadres.find((c) => c.email.toLowerCase() === email?.toLowerCase() || (c as unknown as { userId?: string }).userId === userId);
    if (matched) {
      setCadreProfile(matched);
    } else {
      // Default dummy profile jika tidak ditemukan
      setCadreProfile(null);
    }
  };

  useEffect(() => {
    // 1. Cek sesi lokal atau Supabase
    if (typeof window !== 'undefined') {
      const savedLocalUser = localStorage.getItem('pmii_current_user');
      if (savedLocalUser) {
        try {
          const parsed = JSON.parse(savedLocalUser);
          setUser(parsed);
          fetchProfile(parsed.id, parsed.email);
        } catch {
          // ignore error
        }
      }
    }

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email };
          setUser(u);
          fetchProfile(u.id, u.email);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pmii_current_user', JSON.stringify(u));
          }
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email };
          setUser(u);
          fetchProfile(u.id, u.email);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pmii_current_user', JSON.stringify(u));
          }
        } else {
          setUser(null);
          setCadreProfile(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pmii_current_user');
          }
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Akun Admin Pengurus
    if (cleanEmail === 'admin@pmii-unib.org' && password === 'admin123') {
      const adminUser = { id: 'admin-001', email: cleanEmail };
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmii_current_user', JSON.stringify(adminUser));
      }
      setIsLoading(false);
      return { success: true };
    }

    // 2. Jika Supabase terkonfigurasi, coba Supabase Auth terlebih dahulu
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          const u = { id: data.user.id, email: data.user.email || cleanEmail };
          setUser(u);
          fetchProfile(u.id, u.email);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pmii_current_user', JSON.stringify(u));
          }
          setIsLoading(false);
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase auth failed, falling back to local database:', err);
      }
    }

    // 3. Fallback / Mode Lokal: Cari kader berdasarkan email di local storage
    const cadres = getCadres();
    const matched = cadres.find((c) => c.email.trim().toLowerCase() === cleanEmail);
    if (matched) {
      const u = { id: matched.id, email: matched.email };
      setUser(u);
      setCadreProfile(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pmii_current_user', JSON.stringify(u));
      }
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Email atau kata sandi tidak ditemukan dalam data kader.' };
  };

  const register = async (email: string, password: string, cadreData: Partial<CadreProfile>) => {
    setIsLoading(true);
    let userId = `kdr-${Date.now()}`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: cadreData.fullName,
            nim: cadreData.nim,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.user) {
        userId = data.user.id;
      }
    }

    // Buat profil kader lokal & simpan
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
      email,
      ktaNumber: cadreData.ktaNumber || `PMII-UNIB/${new Date().getFullYear()}/${cadreData.rayonId === 'ryn-2' ? 'RUS' : 'RR'}/${cadreData.nim?.slice(-4) || '0001'}`,
      isVerified: false,
      avatarUrl: cadreData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300',
      specializationInterest: cadreData.specializationInterest || 'Kaderisasi',
      address: cadreData.address || '',
      createdAt: new Date().toISOString(),
    };

    // Simpan ke storage lokal
    const cadres = getCadres();
    cadres.unshift(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmii_cadres', JSON.stringify(cadres));
    }

    const u = { id: userId, email };
    setUser(u);
    setCadreProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmii_current_user', JSON.stringify(u));
    }

    // Jika Supabase aktif, simpan juga ke tabel cadres di database Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from('cadres').insert({
          id: userId,
          full_name: newProfile.fullName,
          gender: newProfile.gender,
          nim: newProfile.nim,
          university: newProfile.university,
          faculty: newProfile.faculty,
          study_program: newProfile.studyProgram,
          entry_year: newProfile.entryYear,
          mapaba_year: newProfile.mapabaYear,
          cadre_level: newProfile.cadreLevel,
          phone_number: newProfile.phoneNumber,
          email: newProfile.email,
          kta_number: newProfile.ktaNumber,
          is_verified: false,
          avatar_url: newProfile.avatarUrl,
          specialization_interest: newProfile.specializationInterest,
          address: newProfile.address,
        });
      } catch (err) {
        console.error('Error inserting into Supabase:', err);
      }
    }

    setIsLoading(false);
    return { success: true };
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

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('cadres')
          .update({
            full_name: updated.fullName,
            gender: updated.gender,
            phone_number: updated.phoneNumber,
            faculty: updated.faculty,
            study_program: updated.studyProgram,
            entry_year: updated.entryYear,
            mapaba_year: updated.mapabaYear,
            rayon_id: updated.rayonId,
            rayon_name: updated.rayonName,
            address: updated.address,
            avatar_url: updated.avatarUrl,
            specialization_interest: updated.specializationInterest,
          })
          .eq('id', updated.id);
      } catch (err) {
        console.warn('Supabase profile update sync error:', err);
      }
    }

    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setCadreProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmii_current_user');
    }
  };

  const isAdmin = Boolean(user?.email === 'admin@pmii-unib.org' || user?.email?.includes('admin'));

  return (
    <AuthContext.Provider
      value={{
        user,
        cadreProfile,
        isLoading,
        isAdmin,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
