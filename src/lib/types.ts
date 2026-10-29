export type UserRole = 'superadmin' | 'kaderisasi' | 'media' | 'rayon' | 'kader' | 'eksternal';

export type FormalCadreLevel = 'Calon Anggota' | 'MAPABA' | 'PKD' | 'PKL' | 'PKN';

export interface ExternalUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  institutionName: string;
  studyProgram?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthAccount {
  email: string;
  password: string;
  cadreId: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  role: UserRole;
  createdAt: string;
}

export interface Rayon {
  id: string;
  name: string;
  faculty: string;
  code: string;
  establishedYear?: number;
  totalCadres?: number;
}

export interface CadreProfile {
  id: string;
  userId?: string;
  fullName: string;
  nim: string;
  university: string;
  rayonId: string;
  rayonName?: string;
  faculty: string;
  studyProgram: string;
  entryYear: number;
  mapabaYear?: number;
  cadreLevel: FormalCadreLevel;
  gender?: 'Laki-laki' | 'Perempuan';
  nonFormalTrainings?: string[];
  phoneNumber: string;
  email: string;
  ktaNumber: string;
  isVerified: boolean;
  avatarUrl?: string;
  specializationInterest?: string;
  address?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Warta Komisariat' | 'Opini Kader' | 'Kajian Aswaja' | 'Warta KOPRI' | 'Literasi';
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  coverImage: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt: string;
  readTimeMinutes: number;
}

export interface TrainingEvent {
  id: string;
  title: string;
  slug: string;
  eventType: 'MAPABA' | 'PKD' | 'Sekolah Pemikiran' | 'Sekolah Advokasi' | 'Pelatihan Jurnalistik' | 'Webinar' | 'Lainnya' | string;
  description: string;
  theme: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxQuota: number;
  currentRegistered: number;
  bannerUrl: string;
  isOpen: boolean;
  requirements: string[];
  contactPerson: {
    name: string;
    phone: string;
  };
  hasPreTest: boolean;
  hasPostTest: boolean;
  preTestId?: string;
  postTestId?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle?: string;
  fullName: string;
  nim: string;
  university: string;
  rayon: string;
  studyProgram: string;
  phoneNumber: string;
  email: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  registeredAt: string;
  qrTicketCode: string;
  attendanceStatus?: 'hadir' | 'tidak hadir';
  preTestScore?: number;
  postTestScore?: number;
  isPassed?: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation?: string;
  category: 'Ke-PMII-an' | 'Aswaja & Ke-NU-an' | 'Keindonesiaan & Pancasila' | 'Paradigma Gerakan' | 'Analisis Sosial' | 'KOPRI';
  points: number;
}

export interface Quiz {
  id: string;
  eventId?: string;
  eventTitle?: string;
  title: string;
  quizType: 'pre_test' | 'post_test' | 'latihan';
  description: string;
  durationMinutes: number;
  passingScore: number;
  isActive: boolean;
  questions: QuizQuestion[];
  instructions: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  quizType: 'pre_test' | 'post_test' | 'latihan';
  participantName: string;
  participantNim: string;
  participantRayon: string;
  answers: Record<string, string>; // questionId -> selectedOptionId
  score: number;
  maxScore: number;
  totalCorrect: number;
  totalQuestions: number;
  isPassed: boolean;
  startedAt: string;
  completedAt: string;
  tabSwitchViolations: number;
}

export interface ELibraryItem {
  id: string;
  title: string;
  author: string;
  category: 'AD/ART' | 'Nilai Dasar Pergerakan' | 'Materi Mapaba' | 'Materi PKD' | 'Pemikiran Tokoh' | 'Pedoman Organisasi';
  description: string;
  fileSize: string;
  downloadUrl: string;
  pageCount: number;
  publishedYear: number;
}
