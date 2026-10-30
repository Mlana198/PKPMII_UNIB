import { 
  CadreProfile, 
  Article, 
  TrainingEvent, 
  EventRegistration, 
  Quiz, 
  QuizAttempt, 
  ELibraryItem, 
  Rayon,
  AuthAccount,
  ExternalUser
} from './types';
import { 
  INITIAL_CADRES, 
  INITIAL_ARTICLES, 
  INITIAL_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_QUIZZES, 
  INITIAL_ELIBRARY, 
  INITIAL_RAYONS 
} from './mockData';

const STORAGE_KEYS = {
  CADRES: 'pmii_cadres',
  ARTICLES: 'pmii_articles',
  EVENTS: 'pmii_events',
  REGISTRATIONS: 'pmii_registrations',
  QUIZZES: 'pmii_quizzes',
  ATTEMPTS: 'pmii_quiz_attempts',
  ELIBRARY: 'pmii_elibrary',
  RAYONS: 'pmii_rayons',
  ACCOUNTS: 'pmii_auth_accounts',
  EXTERNAL_USERS: 'pmii_external_users',
};

// Akun bawaan (Admin & Kader Demo)
const INITIAL_ACCOUNTS: AuthAccount[] = [
  {
    email: 'admin@pmii-unib.org',
    password: 'admin123',
    cadreId: 'admin-001',
    isEmailVerified: true, // Admin bebas verifikasi
    role: 'superadmin',
    createdAt: new Date().toISOString(),
  },
  // Buat default account untuk setiap INITIAL_CADRES agar bisa langsung login
  ...INITIAL_CADRES.map((c) => ({
    email: c.email.toLowerCase(),
    password: 'kader123', // Password default untuk data demo
    cadreId: c.id,
    isEmailVerified: true,
    role: 'kader' as const,
    createdAt: c.createdAt || new Date().toISOString(),
  })),
];

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('pmii-storage-updated', { detail: { key } }));
  } catch (e) {
    console.error('Storage error:', e);
    // Jika quota penuh (QuotaExceededError), coba bersihkan cache yang tidak kritis
    try {
      localStorage.removeItem('pmii_quiz_attempts');
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('pmii-storage-updated', { detail: { key } }));
    } catch (retryErr) {
      console.error('Retry setItem failed:', retryErr);
    }
  }
}

export function notifyStorageUpdated(key?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pmii-storage-updated', { detail: { key } }));
  }
}

// Rayons
export function getRayons(): Rayon[] {
  return getItem<Rayon[]>(STORAGE_KEYS.RAYONS, INITIAL_RAYONS);
}

export function updateRayon(rayonId: string, updates: Partial<Rayon>): Rayon | null {
  const rayons = getRayons();
  const index = rayons.findIndex(r => r.id === rayonId);
  if (index === -1) return null;
  const updatedRayon = { ...rayons[index], ...updates };
  rayons[index] = updatedRayon;
  setItem(STORAGE_KEYS.RAYONS, rayons);
  return updatedRayon;
}

// Cadres
export function getCadres(): CadreProfile[] {
  const cadres = getItem<CadreProfile[]>(STORAGE_KEYS.CADRES, INITIAL_CADRES);
  const OLD_UNHIJAB_AVATAR = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
  const NEW_HIJAB_AVATAR = 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80';
  return cadres.map((c) => {
    if (c.gender === 'Perempuan' && c.avatarUrl === OLD_UNHIJAB_AVATAR) {
      return { ...c, avatarUrl: NEW_HIJAB_AVATAR };
    }
    return c;
  });
}

export function saveCadre(cadre: Omit<CadreProfile, 'id' | 'createdAt' | 'ktaNumber' | 'isVerified'>): CadreProfile {
  const cadres = getCadres();
  const year = new Date().getFullYear();
  const rayon = getRayons().find(r => r.id === cadre.rayonId);
  const code = rayon?.code || 'KOM';
  const sequence = String(cadres.length + 1).padStart(4, '0');
  
  const newCadre: CadreProfile = {
    ...cadre,
    id: `kdr-${Date.now()}`,
    ktaNumber: `PMII-KOM/${year}/${code}/${sequence}`,
    isVerified: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [newCadre, ...cadres];
  setItem(STORAGE_KEYS.CADRES, updated);
  return newCadre;
}

export function toggleVerifyCadre(cadreId: string): CadreProfile[] {
  const cadres = getCadres();
  const updated = cadres.map(c => c.id === cadreId ? { ...c, isVerified: !c.isVerified } : c);
  setItem(STORAGE_KEYS.CADRES, updated);
  return updated;
}

export function updateCadre(cadreId: string, updates: Partial<CadreProfile>): CadreProfile | null {
  const cadres = getCadres();
  const index = cadres.findIndex(c => c.id === cadreId);
  if (index === -1) return null;

  const updatedProfile: CadreProfile = {
    ...cadres[index],
    ...updates,
  };

  cadres[index] = updatedProfile;
  setItem(STORAGE_KEYS.CADRES, cadres);
  return updatedProfile;
}

export function deleteCadre(cadreId: string): CadreProfile[] {
  const cadres = getCadres();
  const target = cadres.find(c => c.id === cadreId);
  const updated = cadres.filter(c => c.id !== cadreId);
  setItem(STORAGE_KEYS.CADRES, updated);

  // Jika kader memiliki auth account, hapus juga akun loginnya
  if (target?.email) {
    deleteAuthAccount(target.email);
  }
  return updated;
}

export function deleteAuthAccount(email: string): AuthAccount[] {
  const accounts = getAuthAccounts();
  const clean = email.trim().toLowerCase();
  const updated = accounts.filter(a => a.email.toLowerCase() !== clean);
  setItem(STORAGE_KEYS.ACCOUNTS, updated);
  return updated;
}

// ==================== EXTERNAL USERS ====================
export function getExternalUsers(): ExternalUser[] {
  return getItem<ExternalUser[]>(STORAGE_KEYS.EXTERNAL_USERS, []);
}

export function saveExternalUser(user: ExternalUser): ExternalUser {
  const users = getExternalUsers();
  const cleanEmail = user.email.trim().toLowerCase();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  let updated: ExternalUser[];
  if (existingIdx !== -1) {
    users[existingIdx] = user;
    updated = [...users];
  } else {
    updated = [user, ...users];
  }
  setItem(STORAGE_KEYS.EXTERNAL_USERS, updated);
  return user;
}

export function deleteExternalUser(id: string): ExternalUser[] {
  const users = getExternalUsers();
  const updated = users.filter((u) => u.id !== id);
  setItem(STORAGE_KEYS.EXTERNAL_USERS, updated);
  return updated;
}

// ==================== UNIQUE DATA CHECKERS ====================
export function normalizePhoneNumber(phone: string): string {
  // Buang karakter selain angka (spasi, strip, tanda kurung, dll)
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('62')) {
    clean = '0' + clean.slice(2);
  }
  return clean;
}

export function isEmailRegistered(email: string): boolean {
  if (!email || !email.trim()) return false;
  const clean = email.trim().toLowerCase();
  
  // Periksa di auth accounts
  const accounts = getAuthAccounts();
  if (accounts.some(a => a.email.toLowerCase() === clean)) return true;

  // Periksa di database kader
  const cadres = getCadres();
  if (cadres.some(c => c.email && c.email.toLowerCase() === clean)) return true;

  // Periksa di database pengguna eksternal
  const externals = getExternalUsers();
  if (externals.some(e => e.email && e.email.toLowerCase() === clean)) return true;

  return false;
}

export function isNimRegistered(nim: string): boolean {
  if (!nim || !nim.trim()) return false;
  const clean = nim.trim().toLowerCase();
  if (clean === '-' || clean === '') return false;

  const cadres = getCadres();
  return cadres.some(c => c.nim && c.nim.trim().toLowerCase() === clean);
}

export function isPhoneRegistered(phoneNumber: string): boolean {
  if (!phoneNumber || !phoneNumber.trim()) return false;
  const target = normalizePhoneNumber(phoneNumber);
  if (!target || target.length < 7) return false;

  const cadres = getCadres();
  if (cadres.some(c => c.phoneNumber && normalizePhoneNumber(c.phoneNumber) === target)) {
    return true;
  }

  const externals = getExternalUsers();
  if (externals.some(e => e.phoneNumber && normalizePhoneNumber(e.phoneNumber) === target)) {
    return true;
  }

  return false;
}

// ==================== AUTH ACCOUNTS ====================
export function getAuthAccounts(): AuthAccount[] {
  return getItem<AuthAccount[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
}

export function getAuthAccountByEmail(email: string): AuthAccount | undefined {
  const accounts = getAuthAccounts();
  const clean = email.trim().toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === clean);
}

export function saveAuthAccount(account: AuthAccount): AuthAccount {
  const accounts = getAuthAccounts();
  const cleanEmail = account.email.trim().toLowerCase();
  const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);

  let updated: AuthAccount[];
  const normalizedAccount: AuthAccount = {
    ...account,
    email: cleanEmail,
  };

  if (existingIdx !== -1) {
    accounts[existingIdx] = normalizedAccount;
    updated = [...accounts];
  } else {
    updated = [normalizedAccount, ...accounts];
  }

  setItem(STORAGE_KEYS.ACCOUNTS, updated);
  return normalizedAccount;
}

export function updateAuthAccount(
  email: string,
  updates: Partial<AuthAccount>
): AuthAccount | null {
  const accounts = getAuthAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
  if (idx === -1) return null;

  const current = accounts[idx];
  const updatedAccount: AuthAccount = {
    ...current,
    ...updates,
    email: updates.email ? updates.email.trim().toLowerCase() : current.email,
  };

  accounts[idx] = updatedAccount;
  setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  return updatedAccount;
}

export function verifyEmailAccount(email: string, code: string): { success: boolean; error?: string } {
  const account = getAuthAccountByEmail(email);
  if (!account) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }
  if (account.isEmailVerified) {
    return { success: true };
  }
  if (account.verificationCode !== code.trim()) {
    return { success: false, error: 'Kode verifikasi tidak sesuai.' };
  }

  updateAuthAccount(email, { isEmailVerified: true, verificationCode: undefined });
  return { success: true };
}

export function resetPasswordAccount(email: string, newPassword: string): { success: boolean; error?: string } {
  const account = getAuthAccountByEmail(email);
  if (!account) {
    return { success: false, error: 'Akun dengan email ini tidak ditemukan.' };
  }
  updateAuthAccount(email, { password: newPassword });
  return { success: true };
}

// Articles
const HUMAS_KEYWORDS_LC = ['biro humas', 'tim humas', 'redaksi', 'panitia', 'pengurus', 'komisariat'];
function isHumasAuthorName(name: string): boolean {
  const lower = name.toLowerCase();
  return HUMAS_KEYWORDS_LC.some((kw) => lower.includes(kw));
}

export function getArticles(): Article[] {
  const articles = getItem<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
  const OLD_UNHIJAB_IMG = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80';
  const NEW_KOPRI_IMG = 'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?auto=format&fit=crop&w=1200&q=80';
  // Avatar yang pernah dipakai sebagai stok untuk art-001 (foto laki-laki asing)
  const OLD_FAKE_MALE_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
  return articles.map((a) => {
    let updated = { ...a };
    // Koreksi cover KOPRI lama
    if (updated.coverImage === OLD_UNHIJAB_IMG) {
      updated = { ...updated, coverImage: NEW_KOPRI_IMG };
    }
    // Hapus avatar stok laki-laki asing pada artikel opini (bukan data kader nyata)
    if (updated.authorAvatar === OLD_FAKE_MALE_AVATAR && updated.id === 'art-001') {
      updated = { ...updated, authorAvatar: undefined };
    }
    // Hapus authorAvatar dari artikel milik Humas/Redaksi (akan digantikan logo di UI)
    if (isHumasAuthorName(updated.authorName) && updated.authorAvatar) {
      updated = { ...updated, authorAvatar: undefined };
    }
    // Koreksi nama penulis artikel KOPRI dari nama rekaan ke nama aktual
    if (updated.id === 'art-002' && updated.authorName === 'Siti Nurhaliza Wardani') {
      updated = { ...updated, authorName: 'Wafiqi Amalia' };
    }
    return updated;
  });
}

export function getArticleBySlug(slug: string): Article | undefined {
  const articles = getArticles();
  return articles.find(a => a.slug === slug);
}

export function saveArticle(article: Omit<Article, 'id' | 'publishedAt'>): Article {
  const articles = getArticles();
  const newArticle: Article = {
    ...article,
    id: `art-${Date.now()}`,
    publishedAt: new Date().toISOString(),
  };
  const updated = [newArticle, ...articles];
  setItem(STORAGE_KEYS.ARTICLES, updated);
  return newArticle;
}

export function updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'publishedAt'>>): Article | null {
  const articles = getArticles();
  const idx = articles.findIndex(a => a.id === id);
  if (idx === -1) return null;
  const updated = articles.map(a => a.id === id ? { ...a, ...updates } : a);
  setItem(STORAGE_KEYS.ARTICLES, updated);
  return updated[idx];
}

export function deleteArticle(id: string): Article[] {
  const articles = getArticles();
  const updated = articles.filter(a => a.id !== id);
  setItem(STORAGE_KEYS.ARTICLES, updated);
  return updated;
}

// Events
export function getEvents(): TrainingEvent[] {
  const events = getItem<TrainingEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  return events.map((e) => {
    if (e.id === 'evt-mapaba-2026' && e.title.includes('MAPABA RAYA')) {
      return { ...e, title: e.title.replace('MAPABA RAYA', 'MAPABA') };
    }
    return e;
  });
}

export function getEventBySlug(slug: string): TrainingEvent | undefined {
  const events = getEvents();
  return events.find(e => e.slug === slug);
}

// Registrations
export function getRegistrations(): EventRegistration[] {
  return getItem<EventRegistration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
}

export function saveRegistration(reg: Omit<EventRegistration, 'id' | 'registeredAt' | 'qrTicketCode' | 'status'>): EventRegistration {
  const registrations = getRegistrations();
  const newReg: EventRegistration = {
    ...reg,
    id: `reg-${Date.now()}`,
    status: 'approved', // auto-approve for demonstration
    registeredAt: new Date().toISOString(),
    qrTicketCode: `TCK-${Date.now().toString(36).toUpperCase()}`,
  };
  const updated = [newReg, ...registrations];
  setItem(STORAGE_KEYS.REGISTRATIONS, updated);

  // update currentRegistered on event
  const events = getEvents();
  const eventIdx = events.findIndex(e => e.id === reg.eventId);
  if (eventIdx !== -1) {
    events[eventIdx].currentRegistered += 1;
    setItem(STORAGE_KEYS.EVENTS, events);
  }

  return newReg;
}

export function updateRegistrationStatus(id: string, status: 'pending' | 'approved' | 'rejected'): EventRegistration[] {
  const registrations = getRegistrations();
  const updated = registrations.map(r => r.id === id ? { ...r, status } : r);
  setItem(STORAGE_KEYS.REGISTRATIONS, updated);
  return updated;
}

export function recordAttendance(ticketCode: string): { success: boolean; message: string; registration?: EventRegistration } {
  const registrations = getRegistrations();
  const idx = registrations.findIndex(r => r.qrTicketCode === ticketCode || r.id === ticketCode);
  if (idx === -1) {
    return { success: false, message: 'Tiket presensi tidak ditemukan!' };
  }
  const reg = registrations[idx];
  if (reg.attendanceStatus === 'hadir') {
    return { success: true, message: `Peserta ${reg.fullName} sudah presensi sebelumnya pada ${reg.attendedAt ? new Date(reg.attendedAt).toLocaleTimeString('id-ID') : ''}.`, registration: reg };
  }
  const updatedReg: EventRegistration = {
    ...reg,
    attendanceStatus: 'hadir',
    attendedAt: new Date().toISOString(),
  };
  registrations[idx] = updatedReg;
  setItem(STORAGE_KEYS.REGISTRATIONS, registrations);
  return { success: true, message: `Presensi berhasil dicatat untuk ${reg.fullName}!`, registration: updatedReg };
}

// Quizzes
export function getQuizzes(): Quiz[] {
  return getItem<Quiz[]>(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
}

export function getQuizById(id: string): Quiz | undefined {
  const quizzes = getQuizzes();
  return quizzes.find(q => q.id === id);
}

// Quiz Attempts
export function getQuizAttempts(): QuizAttempt[] {
  return getItem<QuizAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
}

export function saveQuizAttempt(attempt: Omit<QuizAttempt, 'id'>): QuizAttempt {
  const attempts = getQuizAttempts();
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: `att-${Date.now()}`,
  };
  const updated = [newAttempt, ...attempts];
  setItem(STORAGE_KEYS.ATTEMPTS, updated);
  return newAttempt;
}

// E-Library
export function getELibrary(): ELibraryItem[] {
  return getItem<ELibraryItem[]>(STORAGE_KEYS.ELIBRARY, INITIAL_ELIBRARY);
}

export function saveELibrary(item: Omit<ELibraryItem, 'id'>): ELibraryItem {
  const library = getELibrary();
  const newItem: ELibraryItem = {
    ...item,
    id: `lib-${Date.now()}`,
  };
  const updated = [newItem, ...library];
  setItem(STORAGE_KEYS.ELIBRARY, updated);
  return newItem;
}

export function updateELibrary(id: string, updates: Partial<Omit<ELibraryItem, 'id'>>): ELibraryItem | null {
  const library = getELibrary();
  const idx = library.findIndex(item => item.id === id);
  if (idx === -1) return null;
  const updated = library.map(item => item.id === id ? { ...item, ...updates } : item);
  setItem(STORAGE_KEYS.ELIBRARY, updated);
  return updated[idx];
}

export function deleteELibrary(id: string): ELibraryItem[] {
  const library = getELibrary();
  const updated = library.filter(item => item.id !== id);
  setItem(STORAGE_KEYS.ELIBRARY, updated);
  return updated;
}

// Events – Add new training event
export function saveEvent(event: Omit<TrainingEvent, 'id' | 'currentRegistered'>): TrainingEvent {
  const events = getEvents();
  const newEvent: TrainingEvent = {
    ...event,
    id: `ev-${Date.now()}`,
    currentRegistered: 0,
  };
  const updated = [newEvent, ...events];
  setItem(STORAGE_KEYS.EVENTS, updated);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<Omit<TrainingEvent, 'id' | 'currentRegistered'>>): TrainingEvent | null {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  const updated = events.map(e => e.id === id ? { ...e, ...updates } : e);
  setItem(STORAGE_KEYS.EVENTS, updated);
  return updated[idx];
}

export function deleteEvent(id: string): TrainingEvent[] {
  const events = getEvents();
  const updated = events.filter(e => e.id !== id);
  setItem(STORAGE_KEYS.EVENTS, updated);
  return updated;
}

// Quizzes – Add new CBT quiz
export function saveQuiz(quiz: Omit<Quiz, 'id'>): Quiz {
  const quizzes = getQuizzes();
  const newQuiz: Quiz = {
    ...quiz,
    id: `quiz-${Date.now()}`,
  };
  const updated = [newQuiz, ...quizzes];
  setItem(STORAGE_KEYS.QUIZZES, updated);
  return newQuiz;
}

export function updateQuiz(quizId: string, updatedFields: Partial<Quiz>): Quiz[] {
  const quizzes = getQuizzes();
  const updated = quizzes.map((q) => (q.id === quizId ? { ...q, ...updatedFields } : q));
  setItem(STORAGE_KEYS.QUIZZES, updated);
  return updated;
}

export function deleteQuiz(quizId: string): Quiz[] {
  const quizzes = getQuizzes();
  const updated = quizzes.filter(q => q.id !== quizId);
  setItem(STORAGE_KEYS.QUIZZES, updated);
  return updated;
}

export function addQuestionToQuiz(quizId: string, question: Omit<Quiz['questions'][0], 'id'>): Quiz[] {
  const quizzes = getQuizzes();
  const newQuestion = {
    ...question,
    id: `q-${Date.now()}`,
  };
  const updated = quizzes.map((q) =>
    q.id === quizId ? { ...q, questions: [...q.questions, newQuestion] } : q
  );
  setItem(STORAGE_KEYS.QUIZZES, updated);
  return updated;
}
