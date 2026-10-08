import { 
  CadreProfile, 
  Article, 
  TrainingEvent, 
  EventRegistration, 
  Quiz, 
  QuizAttempt, 
  ELibraryItem, 
  Rayon 
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
};

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
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Rayons
export function getRayons(): Rayon[] {
  return getItem<Rayon[]>(STORAGE_KEYS.RAYONS, INITIAL_RAYONS);
}

// Cadres
export function getCadres(): CadreProfile[] {
  return getItem<CadreProfile[]>(STORAGE_KEYS.CADRES, INITIAL_CADRES);
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

// Articles
export function getArticles(): Article[] {
  return getItem<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
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

// Events
export function getEvents(): TrainingEvent[] {
  return getItem<TrainingEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
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
