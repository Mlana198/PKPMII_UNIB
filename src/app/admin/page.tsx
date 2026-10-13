'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  getCadres,
  getRegistrations,
  getQuizAttempts,
  getArticles,
  getEvents,
  getQuizzes,
  toggleVerifyCadre,
  updateRegistrationStatus,
  saveArticle,
  updateArticle,
  deleteArticle,
  saveEvent,
  updateEvent,
  deleteEvent,
  saveQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestionToQuiz,
  getELibrary,
  saveELibrary,
  updateELibrary,
  deleteELibrary,
} from '@/lib/storage';
import {
  Users,
  Calendar,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  CreditCard,
  Printer,
  ShieldCheck,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Download,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { getLeadership, setLeadership } from '@/lib/leadership';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'kader' | 'pendaftaran' | 'cbt' | 'artikel' | 'pelatihan' | 'quiz' | 'elibrary' | 'pengaturan'>('kader');
  const [cadres, setCadres] = useState(getCadres());
  const [registrations, setRegistrations] = useState(getRegistrations());
  const [attempts] = useState(getQuizAttempts());
  const [articles, setArticles] = useState(getArticles());
  const [events, setEvents] = useState(getEvents());
  const [quizzes, setQuizzes] = useState(getQuizzes());
  const [elibrary, setELibrary] = useState(getELibrary());

  // Form E-Library
  const [libTitle, setLibTitle] = useState('');
  const [libAuthor, setLibAuthor] = useState('PB PMII / Kader UNIB');
  const [libCategory, setLibCategory] = useState<'AD/ART' | 'Nilai Dasar Pergerakan' | 'Materi Mapaba' | 'Materi PKD' | 'Pemikiran Tokoh' | 'Pedoman Organisasi'>('Materi Mapaba');
  const [libDesc, setLibDesc] = useState('');
  const [libFileSize, setLibFileSize] = useState('2.4 MB');
  const [libDownloadUrl, setLibDownloadUrl] = useState('');
  const [libPageCount, setLibPageCount] = useState(45);
  const [libYear, setLibYear] = useState(2024);
  const [isDraggingLib, setIsDraggingLib] = useState(false);
  const [libFileName, setLibFileName] = useState('');
  const libFileRef = useRef<HTMLInputElement>(null);

  const processLibFile = (file: File) => {
    const isPdf = file.type === 'application/pdf';
    const isDoc = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isPdf && !isDoc) {
      alert('Hanya file PDF atau DOC/DOCX yang diperbolehkan.');
      return;
    }
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setLibFileSize(`${sizeMB} MB`);
    setLibFileName(file.name);
    // For local demo: create a blob URL so the download link works within the session
    const url = URL.createObjectURL(file);
    setLibDownloadUrl(url);
  };

  const handleLibFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLibFile(file);
  };

  const handleLibDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLib(true);
  };

  const handleLibDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLib(false);
  };

  const handleLibDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLib(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLibFile(file);
  };

  const removeLibFile = () => {
    setLibFileName('');
    setLibDownloadUrl('');
    setLibFileSize('2.4 MB');
    if (libFileRef.current) libFileRef.current.value = '';
  };

  // Form artikel
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Warta Komisariat' | 'Opini Kader' | 'Kajian Aswaja'>('Warta Komisariat');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newAuthor, setNewAuthor] = useState('Biro Humas PK PMII UNIB');
  const [newCoverImage, setNewCoverImage] = useState('');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const coverImageRef = useRef<HTMLInputElement>(null);

  const processCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Format file harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCoverFile(file);
  };

  const handleCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processCoverFile(file);
  };

  const removeCoverImage = () => {
    setNewCoverImage('');
    if (coverImageRef.current) coverImageRef.current.value = '';
  };

  // Edit artikel state
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'Warta Komisariat' | 'Opini Kader' | 'Kajian Aswaja' | 'Warta KOPRI' | 'Literasi'>('Warta Komisariat');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [isDraggingEditCover, setIsDraggingEditCover] = useState(false);
  const editCoverRef = useRef<HTMLInputElement>(null);

  const processEditCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) { alert('Format file harus berupa gambar.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setEditCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const openEditArticle = (art: { id: string; title: string; category: 'Warta Komisariat' | 'Opini Kader' | 'Kajian Aswaja' | 'Warta KOPRI' | 'Literasi'; excerpt: string; authorName: string; coverImage: string }) => {
    setEditingArticleId(art.id);
    setEditTitle(art.title);
    setEditCategory(art.category);
    setEditExcerpt(art.excerpt);
    setEditAuthor(art.authorName);
    setEditCoverImage(art.coverImage);
  };

  const handleSaveEditArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticleId || !editTitle.trim()) return;
    const updated = updateArticle(editingArticleId, {
      title: editTitle,
      category: editCategory,
      excerpt: editExcerpt,
      content: editExcerpt + '\n\nDipublikasikan secara resmi oleh Biro Humas PK PMII Universitas Ibrahimy.',
      authorName: editAuthor,
      coverImage: editCoverImage,
    });
    if (updated) {
      setArticles(prev => prev.map(a => a.id === editingArticleId ? { ...a, ...updated } : a));
    }
    setEditingArticleId(null);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus warta "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    const updated = deleteArticle(id);
    setArticles(updated);
  };

  // Edit Pelatihan State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEvTitle, setEditEvTitle] = useState('');
  const [editEvType, setEditEvType] = useState<'MAPABA' | 'PKD' | 'Sekolah Pemikiran' | 'Sekolah Advokasi' | 'Pelatihan Jurnalistik' | 'Webinar'>('MAPABA');
  const [editEvTheme, setEditEvTheme] = useState('');
  const [editEvLocation, setEditEvLocation] = useState('');
  const [editEvStart, setEditEvStart] = useState('');
  const [editEvEnd, setEditEvEnd] = useState('');
  const [editEvDeadline, setEditEvDeadline] = useState('');
  const [editEvQuota, setEditEvQuota] = useState(30);
  const [editEvIsOpen, setEditEvIsOpen] = useState(true);
  const [editEvCP, setEditEvCP] = useState('');
  const [editEvCPPhone, setEditEvCPPhone] = useState('');

  // Edit Quiz State
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editQzTitle, setEditQzTitle] = useState('');
  const [editQzType, setEditQzType] = useState<'pre_test' | 'post_test' | 'latihan'>('latihan');
  const [editQzDesc, setEditQzDesc] = useState('');
  const [editQzDuration, setEditQzDuration] = useState(30);
  const [editQzPassing, setEditQzPassing] = useState(70);
  const [editQzIsActive, setEditQzIsActive] = useState(true);

  // Edit E-Library State
  const [editingLibId, setEditingLibId] = useState<string | null>(null);
  const [editLibTitle, setEditLibTitle] = useState('');
  const [editLibAuthor, setEditLibAuthor] = useState('');
  const [editLibCategory, setEditLibCategory] = useState<'AD/ART' | 'Nilai Dasar Pergerakan' | 'Materi Mapaba' | 'Materi PKD' | 'Pemikiran Tokoh' | 'Pedoman Organisasi'>('Materi Mapaba');
  const [editLibDesc, setEditLibDesc] = useState('');
  const [editLibFileSize, setEditLibFileSize] = useState('');
  const [editLibDownloadUrl, setEditLibDownloadUrl] = useState('');
  const [editLibPageCount, setEditLibPageCount] = useState(30);
  const [editLibYear, setEditLibYear] = useState(2024);

  // Form tambah pelatihan
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState<'MAPABA' | 'PKD' | 'Sekolah Pemikiran' | 'Sekolah Advokasi' | 'Pelatihan Jurnalistik' | 'Webinar'>('MAPABA');
  const [evTheme, setEvTheme] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evStart, setEvStart] = useState('');
  const [evEnd, setEvEnd] = useState('');
  const [evDeadline, setEvDeadline] = useState('');
  const [evQuota, setEvQuota] = useState(30);
  const [evCP, setEvCP] = useState('');
  const [evCPPhone, setEvCPPhone] = useState('');

  // Form tambah quiz
  const [qzTitle, setQzTitle] = useState('');
  const [qzType, setQzType] = useState<'pre_test' | 'post_test' | 'latihan'>('latihan');
  const [qzDesc, setQzDesc] = useState('');
  const [qzDuration, setQzDuration] = useState(30);
  const [qzPassing, setQzPassing] = useState(70);

  // Soal state untuk menambah pertanyaan ke paket kuis
  const [selectedQuizIdForQuestion, setSelectedQuizIdForQuestion] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [qCategory, setQCategory] = useState<'Ke-PMII-an' | 'Aswaja & Ke-NU-an' | 'Keindonesiaan & Pancasila' | 'Paradigma Gerakan' | 'Analisis Sosial' | 'KOPRI'>('Ke-PMII-an');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<'a' | 'b' | 'c' | 'd'>('a');
  const [qExplanation, setQExplanation] = useState('');

  // Form kepemimpinan
  const [leadership, setLeadershipState] = useState({ ketua: '', sekretaris: '' });
  const [leaderSaved, setLeaderSaved] = useState(false);

  useEffect(() => {
    const cur = getLeadership();
    setLeadershipState(cur);
  }, []);

  // Proteksi Akses Admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/unauthorized');
    }
  }, [user, isAdmin, isLoading, router]);

  const tabs = [
    { id: 'kader', label: 'Database & Verifikasi Kader', count: cadres.length, icon: Users },
    { id: 'pendaftaran', label: 'Skrining Pelatihan', count: registrations.length, icon: Calendar },
    { id: 'pelatihan', label: 'Tambah Pelatihan', count: events.length, icon: Calendar },
    { id: 'cbt', label: 'Hasil Ujian CBT', count: attempts.length, icon: Award },
    { id: 'quiz', label: 'Tambah Paket Soal CBT', count: quizzes.length, icon: Award },
    { id: 'elibrary', label: 'Kelola E-Library', count: elibrary.length, icon: FileText },
    { id: 'artikel', label: 'Manajemen Warta', count: articles.length, icon: BookOpen },
    { id: 'pengaturan', label: 'Kepengurusan', count: undefined, icon: Settings },
  ] as const;

  const exportCSV = () => {
    const rows = cadres.map((c, idx) => [
      idx + 1,
      `"${c.fullName}"`,
      `"${c.faculty?.includes('SAINS') ? 'SAINS & TEKNOLOGI' : c.faculty || ''}"`,
      `"${c.studyProgram === 'Teknologi Informasi' ? 'TI' : c.studyProgram}"`,
      `"'${c.phoneNumber}"`,
      `"${c.email}"`,
      c.mapabaYear || c.entryYear,
      `"${c.address || ''}"`,
      c.isVerified ? 'Terverifikasi' : 'Pending',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['NO,NAMA,FAKULTAS,JURUSAN,NO.TLP,E-MAIL,ANGKATAN,ALAMAT,STATUS', ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `database_komisariat_unib_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const created = saveArticle({
      title: newTitle,
      slug,
      excerpt: newExcerpt,
      content: newExcerpt + '\n\nDipublikasikan secara resmi oleh Biro Humas PK PMII Universitas Ibrahimy.',
      category: newCategory,
      authorName: newAuthor,
      authorRole: 'Redaksi Komisariat',
      coverImage: newCoverImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      tags: ['Warta', 'PMII UNIB'],
      status: 'published',
      readTimeMinutes: 3,
    });

    setArticles([created, ...articles]);
    setNewTitle('');
    setNewExcerpt('');
    setNewCoverImage('');
    if (coverImageRef.current) coverImageRef.current.value = '';
    alert('Warta berhasil diterbitkan!');
  };


  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim() || !evStart) return;
    const slug = evTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = saveEvent({
      title: evTitle,
      slug,
      eventType: evType,
      description: evTheme,
      theme: evTheme,
      location: evLocation,
      startDate: evStart,
      endDate: evEnd || evStart,
      registrationDeadline: evDeadline || evStart,
      maxQuota: evQuota,
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      isOpen: true,
      requirements: ['Mahasiswa aktif Universitas Ibrahimy', 'Mengisi formulir pendaftaran', 'Bersedia mengikuti seluruh rangkaian acara'],
      contactPerson: { name: evCP || 'Panitia', phone: evCPPhone || '-' },
      hasPreTest: false,
      hasPostTest: false,
    });
    setEvents([created, ...events]);
    setEvTitle(''); setEvTheme(''); setEvLocation(''); setEvStart(''); setEvEnd(''); setEvDeadline(''); setEvCP(''); setEvCPPhone(''); setEvQuota(30);
    alert(`Pelatihan "${created.title}" berhasil ditambahkan!`);
  };

  const handleAddQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qzTitle.trim()) return;
    const created = saveQuiz({
      title: qzTitle,
      quizType: qzType,
      description: qzDesc,
      durationMinutes: qzDuration,
      passingScore: qzPassing,
      isActive: true,
      questions: [],
      instructions: [
        'Baca soal dengan cermat sebelum menjawab.',
        'Dilarang membuka tab lain selama ujian berlangsung.',
        'Kerjakan secara jujur dan mandiri.',
      ],
    });
    setQuizzes([created, ...quizzes]);
    setQzTitle(''); setQzDesc(''); setQzDuration(30); setQzPassing(70);
    alert(`Paket soal "${created.title}" berhasil dibuat! Silakan tambah butir soal.`);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizIdForQuestion || !qText.trim() || !qOptA.trim() || !qOptB.trim()) {
      alert('Harap lengkapi pertanyaan dan minimal opsi A dan B.');
      return;
    }
    const updated = addQuestionToQuiz(selectedQuizIdForQuestion, {
      questionText: qText,
      category: qCategory,
      options: [
        { id: 'a', text: qOptA },
        { id: 'b', text: qOptB },
        ...(qOptC.trim() ? [{ id: 'c', text: qOptC }] : []),
        ...(qOptD.trim() ? [{ id: 'd', text: qOptD }] : []),
      ],
      correctOptionId: qCorrect,
      explanation: qExplanation.trim() || undefined,
      points: 20,
    });
    setQuizzes(updated);
    setQText(''); setQOptA(''); setQOptB(''); setQOptC(''); setQOptD(''); setQExplanation('');
    alert('Soal berhasil ditambahkan ke paket ujian!');
  };

  const handleAddELibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libTitle.trim()) return;
    const created = saveELibrary({
      title: libTitle,
      author: libAuthor || 'PB PMII / Kader UNIB',
      category: libCategory,
      description: libDesc || 'Modul kaderisasi dan pedoman organisasi resmi PK PMII Universitas Ibrahimy.',
      fileSize: libFileSize || '2.0 MB',
      downloadUrl: libDownloadUrl || 'https://raw.githubusercontent.com/pmii-unib/docs/main/modul-pmii.pdf',
      pageCount: libPageCount || 30,
      publishedYear: libYear || 2024,
    });
    setELibrary([created, ...elibrary]);
    setLibTitle('');
    setLibDesc('');
    setLibDownloadUrl('');
    setLibFileName('');
    setLibFileSize('2.4 MB');
    if (libFileRef.current) libFileRef.current.value = '';
    alert(`Buku/Modul "${created.title}" berhasil diunggah ke E-Library!`);
  };

  const handleDeleteELibrary = (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus dokumen "${title}" dari E-Library?`)) {
      const updated = deleteELibrary(id);
      setELibrary(updated);
    }
  };

  // Event Handlers (Edit & Delete)
  const openEditEvent = (ev: typeof events[0]) => {
    setEditingEventId(ev.id);
    setEditEvTitle(ev.title);
    setEditEvType(ev.eventType);
    setEditEvTheme(ev.theme);
    setEditEvLocation(ev.location);
    setEditEvStart(ev.startDate);
    setEditEvEnd(ev.endDate);
    setEditEvDeadline(ev.registrationDeadline);
    setEditEvQuota(ev.maxQuota);
    setEditEvIsOpen(ev.isOpen);
    setEditEvCP(ev.contactPerson.name);
    setEditEvCPPhone(ev.contactPerson.phone);
  };

  const handleSaveEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId || !editEvTitle.trim()) return;
    const updated = updateEvent(editingEventId, {
      title: editEvTitle,
      eventType: editEvType,
      theme: editEvTheme,
      description: editEvTheme,
      location: editEvLocation,
      startDate: editEvStart,
      endDate: editEvEnd || editEvStart,
      registrationDeadline: editEvDeadline || editEvStart,
      maxQuota: editEvQuota,
      isOpen: editEvIsOpen,
      contactPerson: { name: editEvCP || 'Panitia', phone: editEvCPPhone || '-' },
    });
    if (updated) {
      setEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...updated } : ev));
      alert(`Agenda pelatihan "${editEvTitle}" berhasil diperbarui!`);
    }
    setEditingEventId(null);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus agenda pelatihan "${title}"?`)) return;
    const updated = deleteEvent(id);
    setEvents(updated);
  };

  // Quiz Handlers (Edit & Delete)
  const openEditQuiz = (q: typeof quizzes[0]) => {
    setEditingQuizId(q.id);
    setEditQzTitle(q.title);
    setEditQzType(q.quizType);
    setEditQzDesc(q.description);
    setEditQzDuration(q.durationMinutes);
    setEditQzPassing(q.passingScore);
    setEditQzIsActive(q.isActive);
  };

  const handleSaveEditQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuizId || !editQzTitle.trim()) return;
    const updated = updateQuiz(editingQuizId, {
      title: editQzTitle,
      quizType: editQzType,
      description: editQzDesc,
      durationMinutes: editQzDuration,
      passingScore: editQzPassing,
      isActive: editQzIsActive,
    });
    setQuizzes(updated);
    alert(`Paket ujian "${editQzTitle}" berhasil diperbarui!`);
    setEditingQuizId(null);
  };

  const handleDeleteQuiz = (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus paket soal CBT "${title}"?`)) return;
    const updated = deleteQuiz(id);
    setQuizzes(updated);
  };

  // E-Library Handlers (Edit)
  const openEditELibrary = (item: typeof elibrary[0]) => {
    setEditingLibId(item.id);
    setEditLibTitle(item.title);
    setEditLibAuthor(item.author);
    setEditLibCategory(item.category);
    setEditLibDesc(item.description);
    setEditLibFileSize(item.fileSize);
    setEditLibDownloadUrl(item.downloadUrl);
    setEditLibPageCount(item.pageCount);
    setEditLibYear(item.publishedYear);
  };

  const handleSaveEditELibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLibId || !editLibTitle.trim()) return;
    const updated = updateELibrary(editingLibId, {
      title: editLibTitle,
      author: editLibAuthor,
      category: editLibCategory,
      description: editLibDesc,
      fileSize: editLibFileSize || '2.0 MB',
      downloadUrl: editLibDownloadUrl || 'https://raw.githubusercontent.com/pmii-unib/docs/main/modul-pmii.pdf',
      pageCount: editLibPageCount,
      publishedYear: editLibYear,
    });
    if (updated) {
      setELibrary(prev => prev.map(item => item.id === editingLibId ? { ...item, ...updated } : item));
      alert(`Dokumen "${editLibTitle}" berhasil diperbarui!`);
    }
    setEditingLibId(null);
  };

  const handleSaveLeadership = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadership(leadership);
    setLeaderSaved(true);
    setTimeout(() => setLeaderSaved(false), 3000);
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-[#64748B]">
        Memvalidasi hak akses pengurus...
      </div>
    );
  }

  const thClass = 'px-3 py-3 text-xs font-semibold uppercase tracking-wider border-b border-[#E2E8EF]';
  const tdClass = 'px-3 py-3 text-xs text-[#1E293B] border-b border-[#E2E8EF]';
  const inputClass = 'w-full border border-[#E2E8EF] rounded px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white placeholder-[#94A3B8]';
  const labelClass = 'block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E8EF] pb-6">
        <div>
          <p className="text-[#D4A017] text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Backoffice Otoritas Pengurus (Kode: V-04)
          </p>
          <h1 className="text-3xl font-semibold text-[#1E293B]">
            Dashboard Pengurus Komisariat
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            PK PMII Universitas Ibrahimy Sukorejo Situbondo
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/admin/database-print"
            className="inline-flex items-center gap-1.5 bg-[#D4A017] hover:bg-[#BF8E10] text-[#1B3D7B] font-bold text-xs px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Download PDF (F4 Landscape)
          </Link>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 border border-[#1B3D7B] text-[#1B3D7B] hover:bg-[#1B3D7B] hover:text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Kader Terdata', value: cadres.length, sub: `${cadres.filter((c) => c.isVerified).length} Terverifikasi Sah` },
          { label: 'Pendaftar Pelatihan', value: registrations.length, sub: `${registrations.filter((r) => r.status === 'pending').length} Menunggu Skrining` },
          { label: 'Ujian CBT Terlaksana', value: attempts.length, sub: 'Hasil Pre/Post Test' },
          { label: 'Warta Terbit', value: articles.length, sub: 'Publikasi Media' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E2E8EF] rounded-lg p-5 shadow-sm">
            <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">{s.label}</p>
            <p className="text-2xl font-bold text-[#1B3D7B] mt-1">{s.value}</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs Toolbar */}
      <div className="border-b border-[#E2E8EF]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-[#1B3D7B] text-[#1B3D7B]'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    activeTab === id ? 'bg-blue-50 text-[#1B3D7B]' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Database Kader */}
      {activeTab === 'kader' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
            <p>
              Menampilkan format database resmi komisariat (Nama, Fakultas, Jurusan, No.Tlp, E-Mail, Foto, Angkatan, Alamat).
            </p>
            <Link
              href="/admin/database-print"
              className="text-[#1B3D7B] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Buka Format Cetak Kop Surat F4 →
            </Link>
          </div>

          <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#EAB308]/20 text-[#1E293B] font-bold">
                  <th className={`${thClass} w-10 text-center`}>NO</th>
                  <th className={thClass}>NAMA</th>
                  <th className={thClass}>FAKULTAS</th>
                  <th className={`${thClass} text-center`}>JURUSAN</th>
                  <th className={thClass}>NO.TLP</th>
                  <th className={thClass}>E-MAIL</th>
                  <th className={`${thClass} text-center`}>FOTO</th>
                  <th className={`${thClass} text-center`}>ANGKATAN</th>
                  <th className={thClass}>ALAMAT</th>
                  <th className={`${thClass} text-center`}>STATUS</th>
                  <th className={`${thClass} text-right`}>AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {cadres.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className={`${tdClass} text-center font-bold`}>{idx + 1}.</td>
                    <td className={`${tdClass} font-bold uppercase tracking-wide whitespace-nowrap`}>{c.fullName}</td>
                    <td className={`${tdClass} uppercase whitespace-nowrap`}>
                      {c.faculty?.includes('SAINS')
                        ? 'SAINS & TEKNOLOGI'
                        : c.faculty?.includes('TARBIYAH')
                        ? 'TARBIYAH'
                        : c.faculty}
                    </td>
                    <td className={`${tdClass} text-center font-bold uppercase`}>
                      {c.studyProgram === 'Teknologi Informasi' ? 'TI' : c.studyProgram}
                    </td>
                    <td className={`${tdClass} font-mono whitespace-nowrap`}>{c.phoneNumber}</td>
                    <td className={`${tdClass} text-blue-700 underline font-sans`}>
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                    </td>
                    <td className={`${tdClass} text-center p-1.5`}>
                      <div className="w-9 h-11 mx-auto rounded border border-[#CBD5E1] overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150'}
                          alt={c.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className={`${tdClass} text-center font-bold`}>{c.mapabaYear || c.entryYear}</td>
                    <td className={`${tdClass} uppercase font-medium whitespace-nowrap`}>{c.address}</td>
                    <td className={`${tdClass} text-center whitespace-nowrap`}>
                      {c.isVerified ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Sah
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className={`${tdClass} text-right whitespace-nowrap`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCadres(toggleVerifyCadre(c.id))}
                          className={`text-[11px] px-2.5 py-1 rounded border font-semibold transition-colors ${
                            c.isVerified
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {c.isVerified ? 'Batalkan' : 'Verifikasi'}
                        </button>
                        <Link
                          href={`/kader/kta/${c.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] text-[#1B3D7B] hover:underline font-semibold"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> KTA
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Skrining Pendaftaran */}
      {activeTab === 'pendaftaran' && (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF]">
                <th className={thClass}>Peserta</th>
                <th className={`${thClass} hidden md:table-cell`}>Kegiatan</th>
                <th className={thClass}>Status Skrining</th>
                <th className={`${thClass} text-right`}>Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {registrations.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-[#64748B] text-xs">Belum ada pendaftar pelatihan.</td></tr>
              ) : registrations.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className={tdClass}>
                    <div className="font-semibold text-sm">{r.fullName}</div>
                    <div className="text-[11px] text-[#64748B] font-mono">{r.nim} • {r.rayon}</div>
                  </td>
                  <td className={`${tdClass} hidden md:table-cell text-[#64748B]`}>{r.eventTitle}</td>
                  <td className={tdClass}>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                      r.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : r.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.status === 'approved' ? 'Lolos Skrining' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu Review'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setRegistrations(updateRegistrationStatus(r.id, 'approved'))}
                        className="text-xs px-2.5 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium"
                      >Terima</button>
                      <button
                        onClick={() => setRegistrations(updateRegistrationStatus(r.id, 'rejected'))}
                        className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                      >Tolak</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Tambah Pelatihan */}
      {activeTab === 'pelatihan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Tambah */}
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B3D7B] uppercase tracking-wider">Tambah Agenda Pelatihan</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className={labelClass}>Nama Pelatihan *</label>
                <input required type="text" value={evTitle} onChange={e => setEvTitle(e.target.value)} placeholder="Contoh: MAPABA Angkatan 2024" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Jenis Pelatihan *</label>
                  <select value={evType} onChange={e => setEvType(e.target.value as typeof evType)} className={inputClass}>
                    <option value="MAPABA">MAPABA</option>
                    <option value="PKD">PKD</option>
                    <option value="Sekolah Pemikiran">Sekolah Pemikiran</option>
                    <option value="Sekolah Advokasi">Sekolah Advokasi</option>
                    <option value="Pelatihan Jurnalistik">Pelatihan Jurnalistik</option>
                    <option value="Webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Kuota Peserta</label>
                  <input type="number" min={1} value={evQuota} onChange={e => setEvQuota(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Tema / Deskripsi</label>
                <textarea rows={2} value={evTheme} onChange={e => setEvTheme(e.target.value)} placeholder="Tema atau gambaran pelatihan" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Lokasi</label>
                <input type="text" value={evLocation} onChange={e => setEvLocation(e.target.value)} placeholder="Contoh: Kampus Universitas Ibrahimy" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tanggal Mulai *</label>
                  <input required type="date" value={evStart} onChange={e => setEvStart(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tanggal Selesai</label>
                  <input type="date" value={evEnd} onChange={e => setEvEnd(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Batas Pendaftaran</label>
                <input type="date" value={evDeadline} onChange={e => setEvDeadline(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nama Contact Person</label>
                  <input type="text" value={evCP} onChange={e => setEvCP(e.target.value)} placeholder="Nama panitia" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>No. HP Contact Person</label>
                  <input type="text" value={evCPPhone} onChange={e => setEvCPPhone(e.target.value)} placeholder="08xx..." className={inputClass} />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Simpan Agenda Pelatihan
              </button>
            </form>
          </div>

          {/* Daftar Pelatihan yang Ada */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Agenda Terdaftar ({events.length})</h2>
            {events.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-8">Belum ada agenda pelatihan.</p>
            ) : events.map(ev => (
              <div key={ev.id} className="bg-white border border-[#E2E8EF] rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#1B3D7B] bg-blue-50 px-2 py-0.5 rounded">{ev.eventType}</span>
                    <h3 className="font-bold text-sm text-[#1E293B] mt-1">{ev.title}</h3>
                    <p className="text-[11px] text-[#64748B]">{ev.location} • {new Date(ev.startDate).toLocaleDateString('id-ID')} • Kuota: {ev.maxQuota}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap ${ev.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#64748B]'}`}>
                    {ev.isOpen ? 'Buka' : 'Tutup'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 mt-2 border-t border-[#F1F5F9]">
                  <Link
                    href={`/kegiatan/${ev.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-1 text-[#64748B] border border-[#CBD5E1] hover:text-[#1B3D7B] hover:border-[#1B3D7B] text-xs font-semibold py-1 px-2.5 rounded transition-colors"
                    title="Lihat Detail Acara"
                  >
                    <ExternalLink className="w-3 h-3" /> Preview
                  </Link>
                  <button
                    onClick={() => openEditEvent(ev)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-[#1B3D7B] border border-[#1B3D7B] hover:bg-blue-50 text-xs font-semibold py-1 rounded transition-colors"
                  >
                    <Settings className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-red-600 border border-red-200 hover:bg-red-50 text-xs font-semibold py-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Edit Pelatihan */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8EF] rounded-xl shadow-2xl w-full max-w-lg my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Edit Agenda Pelatihan</h3>
              <button onClick={() => setEditingEventId(null)} className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] px-2 py-1 rounded hover:bg-[#F1F5F9]">
                ✕ Tutup
              </button>
            </div>
            <form onSubmit={handleSaveEditEvent} className="space-y-3">
              <div>
                <label className={labelClass}>Nama Pelatihan *</label>
                <input required type="text" value={editEvTitle} onChange={e => setEditEvTitle(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Jenis Pelatihan</label>
                  <select value={editEvType} onChange={e => setEditEvType(e.target.value as typeof editEvType)} className={inputClass}>
                    <option value="MAPABA">MAPABA</option>
                    <option value="PKD">PKD</option>
                    <option value="Sekolah Pemikiran">Sekolah Pemikiran</option>
                    <option value="Sekolah Advokasi">Sekolah Advokasi</option>
                    <option value="Pelatihan Jurnalistik">Pelatihan Jurnalistik</option>
                    <option value="Webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Kuota Peserta</label>
                  <input type="number" min={1} value={editEvQuota} onChange={e => setEditEvQuota(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Tema / Deskripsi</label>
                <textarea rows={2} value={editEvTheme} onChange={e => setEditEvTheme(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Lokasi</label>
                <input type="text" value={editEvLocation} onChange={e => setEditEvLocation(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tanggal Mulai</label>
                  <input type="date" value={editEvStart} onChange={e => setEditEvStart(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tanggal Selesai</label>
                  <input type="date" value={editEvEnd} onChange={e => setEditEvEnd(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Batas Pendaftaran</label>
                  <input type="date" value={editEvDeadline} onChange={e => setEditEvDeadline(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status Pendaftaran</label>
                  <select value={editEvIsOpen ? 'open' : 'closed'} onChange={e => setEditEvIsOpen(e.target.value === 'open')} className={inputClass}>
                    <option value="open">Buka (Pendaftaran Aktif)</option>
                    <option value="closed">Tutup (Pendaftaran Ditutup)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nama Contact Person</label>
                  <input type="text" value={editEvCP} onChange={e => setEditEvCP(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>No. HP Contact Person</label>
                  <input type="text" value={editEvCPPhone} onChange={e => setEditEvCPPhone(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditingEventId(null)} className="flex-1 border border-[#E2E8EF] text-[#64748B] text-xs font-semibold py-2.5 rounded transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: CBT Attempts */}
      {activeTab === 'cbt' && (
        <div className="bg-white border border-[#E2E8EF] rounded-lg overflow-hidden shadow-sm">
          {attempts.length === 0 ? (
            <div className="py-20 text-center text-[#64748B] text-xs">
              <Award className="w-8 h-8 text-[#E2E8EF] mx-auto mb-2" />
              Belum ada riwayat hasil pengerjaan kuis CBT.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8EF]">
                  <th className={thClass}>Peserta</th>
                  <th className={`${thClass} hidden md:table-cell`}>Paket Soal</th>
                  <th className={thClass}>Nilai Akhir</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} hidden sm:table-cell`}>Catatan Integritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8EF]">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className={tdClass}>
                      <div className="font-semibold text-sm">{att.participantName}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">{att.participantNim} • {att.participantRayon}</div>
                    </td>
                    <td className={`${tdClass} hidden md:table-cell text-[#64748B]`}>{att.quizTitle}</td>
                    <td className={tdClass}>
                      <span className="font-bold text-[#1B3D7B] text-sm">{att.score}</span>
                      <span className="text-[#94A3B8]"> / 100</span>
                    </td>
                    <td className={tdClass}>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${att.isPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                        {att.isPassed ? 'Lulus' : 'Remidial'}
                      </span>
                    </td>
                    <td className={`${tdClass} hidden sm:table-cell`}>
                      {att.tabSwitchViolations > 0 ? (
                        <span className="text-amber-600 text-[11px] font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {att.tabSwitchViolations}x ganti layar
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px]">Integritas Bersih</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Tambah Paket Soal Quiz */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B3D7B] uppercase tracking-wider">Tambah Paket Soal CBT</h2>
            <form onSubmit={handleAddQuiz} className="space-y-4">
              <div>
                <label className={labelClass}>Nama Paket Soal *</label>
                <input required type="text" value={qzTitle} onChange={e => setQzTitle(e.target.value)} placeholder="Contoh: Pre-Test MAPABA 2024" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipe Ujian</label>
                  <select value={qzType} onChange={e => setQzType(e.target.value as typeof qzType)} className={inputClass}>
                    <option value="pre_test">Pre-Test</option>
                    <option value="post_test">Post-Test</option>
                    <option value="latihan">Latihan</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Durasi (Menit)</label>
                  <input type="number" min={5} value={qzDuration} onChange={e => setQzDuration(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deskripsi Paket Soal</label>
                <textarea rows={2} value={qzDesc} onChange={e => setQzDesc(e.target.value)} placeholder="Penjelasan singkat tentang paket soal ini" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Standar Nilai Kelulusan (0–100)</label>
                <input type="number" min={0} max={100} value={qzPassing} onChange={e => setQzPassing(Number(e.target.value))} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Buat Paket Soal
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Paket Soal Terdaftar ({quizzes.length})</h2>
            {quizzes.map(q => (
              <div key={q.id} className="bg-white border border-[#E2E8EF] rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      q.quizType === 'pre_test' ? 'bg-blue-50 text-[#1B3D7B]' : q.quizType === 'post_test' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {q.quizType === 'pre_test' ? 'Pre-Test' : q.quizType === 'post_test' ? 'Post-Test' : 'Latihan'}
                    </span>
                    <h3 className="font-bold text-sm text-[#1E293B] mt-1">{q.title}</h3>
                    <p className="text-[11px] text-[#64748B]">{q.questions.length} butir soal • {q.durationMinutes} menit • KKM: {q.passingScore}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${q.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#64748B]'}`}>
                      {q.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      onClick={() => setSelectedQuizIdForQuestion(selectedQuizIdForQuestion === q.id ? null : q.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B3D7B] hover:underline"
                    >
                      <Plus className="w-3 h-3" /> {selectedQuizIdForQuestion === q.id ? 'Tutup Form Soal' : 'Tambah Soal'}
                    </button>
                  </div>
                </div>

                {/* Form Tambah Soal jika paket dipilih */}
                {selectedQuizIdForQuestion === q.id && (
                  <form onSubmit={handleAddQuestion} className="bg-[#F8FAFC] border border-[#E2E8EF] rounded-lg p-3.5 space-y-3 mt-2 text-xs">
                    <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-1.5">
                      <span className="font-bold text-[#1B3D7B] flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#D4A017]" /> Input Butir Pertanyaan Baru
                      </span>
                      <span className="text-[10px] text-[#64748B]">Soal ke-{q.questions.length + 1}</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Pertanyaan *</label>
                      <textarea
                        required
                        rows={2}
                        value={qText}
                        onChange={e => setQText(e.target.value)}
                        placeholder="Ketik teks soal pertanyaan..."
                        className="w-full border border-[#E2E8EF] rounded p-2 text-xs focus:outline-none focus:border-[#1B3D7B] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Kategori Materi</label>
                      <select
                        value={qCategory}
                        onChange={e => setQCategory(e.target.value as typeof qCategory)}
                        className="w-full border border-[#E2E8EF] rounded p-1.5 text-xs bg-white"
                      >
                        <option value="Ke-PMII-an">Ke-PMII-an</option>
                        <option value="Aswaja & Ke-NU-an">Aswaja & Ke-NU-an</option>
                        <option value="Keindonesiaan & Pancasila">Keindonesiaan & Pancasila</option>
                        <option value="Paradigma Gerakan">Paradigma Gerakan</option>
                        <option value="Analisis Sosial">Analisis Sosial</option>
                        <option value="KOPRI">KOPRI</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">Pilihan A *</label>
                        <input
                          required
                          type="text"
                          value={qOptA}
                          onChange={e => setQOptA(e.target.value)}
                          placeholder="Teks opsi A"
                          className="w-full border border-[#E2E8EF] rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">Pilihan B *</label>
                        <input
                          required
                          type="text"
                          value={qOptB}
                          onChange={e => setQOptB(e.target.value)}
                          placeholder="Teks opsi B"
                          className="w-full border border-[#E2E8EF] rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">Pilihan C</label>
                        <input
                          type="text"
                          value={qOptC}
                          onChange={e => setQOptC(e.target.value)}
                          placeholder="Teks opsi C (opsional)"
                          className="w-full border border-[#E2E8EF] rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">Pilihan D</label>
                        <input
                          type="text"
                          value={qOptD}
                          onChange={e => setQOptD(e.target.value)}
                          placeholder="Teks opsi D (opsional)"
                          className="w-full border border-[#E2E8EF] rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-[#1B3D7B] uppercase mb-0.5">Kunci Jawaban Benar</label>
                        <select
                          value={qCorrect}
                          onChange={e => setQCorrect(e.target.value as typeof qCorrect)}
                          className="w-full border border-[#1B3D7B] rounded p-1.5 text-xs bg-blue-50/50 font-bold text-[#1B3D7B]"
                        >
                          <option value="a">Opsi A</option>
                          <option value="b">Opsi B</option>
                          <option value="c">Opsi C</option>
                          <option value="d">Opsi D</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">Pembahasan Singkat</label>
                        <input
                          type="text"
                          value={qExplanation}
                          onChange={e => setQExplanation(e.target.value)}
                          placeholder="Penjelasan jawaban benar..."
                          className="w-full border border-[#E2E8EF] rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Simpan Soal ke Paket Ini
                    </button>
                  </form>
                )}

                {/* Tombol Aksi Paket Soal: Preview, Edit, Hapus */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                  <Link
                    href={`/kuis/${q.id}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-1 text-[#64748B] border border-[#CBD5E1] hover:text-[#1B3D7B] hover:border-[#1B3D7B] text-xs font-semibold py-1 px-2.5 rounded transition-colors"
                    title="Uji Lembar Kuis"
                  >
                    <ExternalLink className="w-3 h-3" /> Preview
                  </Link>
                  <button
                    onClick={() => openEditQuiz(q)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-[#1B3D7B] border border-[#1B3D7B] hover:bg-blue-50 text-xs font-semibold py-1 rounded transition-colors"
                  >
                    <Settings className="w-3 h-3" /> Edit Paket
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(q.id, q.title)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-red-600 border border-red-200 hover:bg-red-50 text-xs font-semibold py-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Edit Quiz */}
      {editingQuizId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8EF] rounded-xl shadow-2xl w-full max-w-lg my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Edit Paket Soal CBT</h3>
              <button onClick={() => setEditingQuizId(null)} className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] px-2 py-1 rounded hover:bg-[#F1F5F9]">
                ✕ Tutup
              </button>
            </div>
            <form onSubmit={handleSaveEditQuiz} className="space-y-3">
              <div>
                <label className={labelClass}>Nama Paket Soal *</label>
                <input required type="text" value={editQzTitle} onChange={e => setEditQzTitle(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipe Ujian</label>
                  <select value={editQzType} onChange={e => setEditQzType(e.target.value as typeof editQzType)} className={inputClass}>
                    <option value="pre_test">Pre-Test</option>
                    <option value="post_test">Post-Test</option>
                    <option value="latihan">Latihan</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Durasi (Menit)</label>
                  <input type="number" min={5} value={editQzDuration} onChange={e => setEditQzDuration(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deskripsi Paket Soal</label>
                <textarea rows={2} value={editQzDesc} onChange={e => setEditQzDesc(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>KKM (Standar Lulus)</label>
                  <input type="number" min={0} max={100} value={editQzPassing} onChange={e => setEditQzPassing(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status Keaktifan</label>
                  <select value={editQzIsActive ? 'active' : 'inactive'} onChange={e => setEditQzIsActive(e.target.value === 'active')} className={inputClass}>
                    <option value="active">Aktif (Dapat Dikerjakan)</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditingQuizId(null)} className="flex-1 border border-[#E2E8EF] text-[#64748B] text-xs font-semibold py-2.5 rounded transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: Artikel */}
      {activeTab === 'artikel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kolom kiri: Form Terbitkan */}
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 shadow-sm space-y-1">
            <h2 className="text-sm font-bold text-[#1B3D7B] uppercase tracking-wider mb-1">
              Terbitkan Rilis Warta atau Opini Baru
            </h2>
            <p className="text-xs text-[#64748B] mb-5">
              Publikasi berita kegiatan komisariat atau tulisan kader ke halaman portal warta.
            </p>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className={labelClass}>Judul Warta *</label>
                <input required type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Judul artikel atau berita" className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kategori</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as typeof newCategory)} className={inputClass}>
                    <option value="Warta Komisariat">Warta Komisariat</option>
                    <option value="Opini Kader">Opini Kader</option>
                    <option value="Kajian Aswaja">Kajian Aswaja</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Penulis / Redaksi</label>
                  <input type="text" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Ringkasan / Isi Warta *</label>
                <textarea required rows={4} value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)} placeholder="Tuliskan poin penting warta..." className={inputClass} />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className={labelClass}>Foto / Cover Image Warta</label>
                <div
                  className={`border-2 border-dashed rounded-lg transition-colors ${
                    isDraggingCover ? 'border-[#1B3D7B] bg-blue-50' : 'border-[#CBD5E1] bg-[#F8FAFC]'
                  }`}
                  onDragOver={handleCoverDragOver}
                  onDragLeave={handleCoverDragLeave}
                  onDrop={handleCoverDrop}
                >
                  {newCoverImage ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newCoverImage} alt="Cover Preview" className="w-full h-36 object-cover rounded-lg" />
                      <button type="button" onClick={removeCoverImage} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors" title="Hapus Foto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg px-3 py-1.5">
                        <p className="text-white text-[10px] font-semibold">Cover siap terbit ✓</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center p-5">
                      <Upload className="w-6 h-6 text-[#94A3B8]" />
                      <div>
                        <input ref={coverImageRef} type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" id="cover-image-upload" />
                        <label htmlFor="cover-image-upload" className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                          <Upload className="w-3 h-3" /> Pilih / Cari Foto
                        </label>
                      </div>
                      <p className="text-xs text-[#1E293B] font-medium">atau <span className="text-[#1B3D7B] font-bold">drag &amp; drop</span> foto ke sini.</p>
                      <p className="text-[10px] text-[#94A3B8]">JPG, PNG, WEBP · Maks. 5 MB · Opsional</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-4 py-2.5 rounded transition-colors shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Terbitkan Warta
              </button>
            </form>
          </div>

          {/* Kolom kanan: Daftar Warta */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Daftar Warta & Opini ({articles.length})
            </h2>
            <div className="space-y-3 max-h-[820px] overflow-y-auto pr-1">
              {articles.length === 0 && (
                <div className="text-center py-10 text-xs text-[#94A3B8]">Belum ada warta yang diterbitkan.</div>
              )}
              {articles.map(art => (
                <div key={art.id} className="bg-white border border-[#E2E8EF] rounded-lg shadow-sm overflow-hidden hover:border-[#1B3D7B] transition-colors">
                  {/* Cover thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={art.coverImage} alt={art.title} className="w-full h-28 object-cover" />
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          art.category === 'Opini Kader' ? 'bg-amber-50 text-amber-700'
                          : art.category === 'Kajian Aswaja' ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-[#1B3D7B]'
                        }`}>{art.category}</span>
                        <p className="text-xs font-semibold text-[#1E293B] mt-1 leading-snug line-clamp-2">{art.title}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">{art.authorName} · {new Date(art.publishedAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5F9]">
                      <Link
                        href={`/berita/${art.slug}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1 text-[#64748B] border border-[#CBD5E1] hover:text-[#1B3D7B] hover:border-[#1B3D7B] text-xs font-semibold py-1.5 px-2.5 rounded transition-colors"
                        title="Lihat Halaman Warta"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Preview
                      </Link>
                      <button
                        onClick={() => openEditArticle(art)}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-[#1B3D7B] border border-[#1B3D7B] hover:bg-blue-50 text-xs font-semibold py-1.5 rounded transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-red-600 border border-red-200 hover:bg-red-50 text-xs font-semibold py-1.5 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Artikel */}
      {editingArticleId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8EF] rounded-xl shadow-2xl w-full max-w-lg my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Edit Warta / Opini</h3>
              <button onClick={() => setEditingArticleId(null)} className="text-[#94A3B8] hover:text-[#1E293B] transition-colors">
                <Trash2 className="w-4 h-4 hidden" />
                <span className="text-xs font-semibold px-2 py-1 rounded hover:bg-[#F1F5F9]">✕ Tutup</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditArticle} className="space-y-3">
              <div>
                <label className={labelClass}>Judul Warta *</label>
                <input required type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kategori</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value as typeof editCategory)} className={inputClass}>
                    <option value="Warta Komisariat">Warta Komisariat</option>
                    <option value="Opini Kader">Opini Kader</option>
                    <option value="Kajian Aswaja">Kajian Aswaja</option>
                    <option value="Warta KOPRI">Warta KOPRI</option>
                    <option value="Literasi">Literasi</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Penulis / Redaksi</label>
                  <input type="text" value={editAuthor} onChange={e => setEditAuthor(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Ringkasan / Isi Warta *</label>
                <textarea required rows={4} value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} className={inputClass} />
              </div>

              {/* Edit Cover Image */}
              <div>
                <label className={labelClass}>Foto / Cover Image</label>
                <div
                  className={`border-2 border-dashed rounded-lg transition-colors ${
                    isDraggingEditCover ? 'border-[#1B3D7B] bg-blue-50' : 'border-[#CBD5E1] bg-[#F8FAFC]'
                  }`}
                  onDragOver={e => { e.preventDefault(); setIsDraggingEditCover(true); }}
                  onDragLeave={e => { e.preventDefault(); setIsDraggingEditCover(false); }}
                  onDrop={e => { e.preventDefault(); setIsDraggingEditCover(false); const f = e.dataTransfer.files?.[0]; if (f) processEditCoverFile(f); }}
                >
                  {editCoverImage ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editCoverImage} alt="Edit Cover" className="w-full h-32 object-cover rounded-lg" />
                      <button type="button" onClick={() => { setEditCoverImage(''); if (editCoverRef.current) editCoverRef.current.value = ''; }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center p-4">
                      <Upload className="w-5 h-5 text-[#94A3B8]" />
                      <input ref={editCoverRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) processEditCoverFile(f); }} className="hidden" id="edit-cover-upload" />
                      <label htmlFor="edit-cover-upload" className="inline-flex items-center gap-1 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-3 h-3" /> Pilih / Cari Foto
                      </label>
                      <p className="text-[10px] text-[#94A3B8]">atau drag &amp; drop · JPG, PNG, WEBP · Maks. 5 MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors shadow-sm">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditingArticleId(null)} className="flex-1 border border-[#E2E8EF] text-[#64748B] hover:border-[#1B3D7B] text-xs font-semibold py-2.5 rounded transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: Kelola E-Library */}
      {activeTab === 'elibrary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Upload Buku/Modul */}
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#1B3D7B] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4A017]" /> Upload Modul / E-Book Kaderisasi
            </h2>
            <p className="text-xs text-[#64748B]">
              Tambahkan modul materi, AD/ART, atau kajian intelektual baru ke perpustakaan digital (E-Library).
            </p>

            <form onSubmit={handleAddELibrary} className="space-y-4">
              <div>
                <label className={labelClass}>Judul Buku / Modul *</label>
                <input
                  required
                  type="text"
                  value={libTitle}
                  onChange={e => setLibTitle(e.target.value)}
                  placeholder="Contoh: Modul Aswaja An-Nahdliyyah & Ke-NU-an"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kategori Modul</label>
                  <select
                    value={libCategory}
                    onChange={e => setLibCategory(e.target.value as typeof libCategory)}
                    className={inputClass}
                  >
                    <option value="Materi Mapaba">Materi Mapaba</option>
                    <option value="Materi PKD">Materi PKD</option>
                    <option value="Nilai Dasar Pergerakan">Nilai Dasar Pergerakan</option>
                    <option value="AD/ART">AD/ART</option>
                    <option value="Pemikiran Tokoh">Pemikiran Tokoh</option>
                    <option value="Pedoman Organisasi">Pedoman Organisasi</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Penulis / Lembaga</label>
                  <input
                    type="text"
                    value={libAuthor}
                    onChange={e => setLibAuthor(e.target.value)}
                    placeholder="Contoh: Tim Kaderisasi PK PMII UNIB"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Ukuran Berkas</label>
                  <input
                    type="text"
                    value={libFileSize}
                    onChange={e => setLibFileSize(e.target.value)}
                    placeholder="Contoh: 3.5 MB"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Jumlah Halaman</label>
                  <input
                    type="number"
                    min={1}
                    value={libPageCount}
                    onChange={e => setLibPageCount(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tahun Terbit</label>
                  <input
                    type="number"
                    min={1960}
                    max={2030}
                    value={libYear}
                    onChange={e => setLibYear(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>


              <div>
                <label className={labelClass}>Upload Berkas PDF / Dokumen *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    isDraggingLib
                      ? 'border-[#1B3D7B] bg-blue-50'
                      : 'border-[#CBD5E1] bg-[#F8FAFC]'
                  }`}
                  onDragOver={handleLibDragOver}
                  onDragLeave={handleLibDragLeave}
                  onDrop={handleLibDrop}
                >
                  <input
                    ref={libFileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleLibFileChange}
                    className="hidden"
                    id="lib-file-upload"
                  />
                  {libFileName ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1B3D7B] shrink-0" />
                        <span className="text-xs font-semibold text-[#1E293B] truncate max-w-[200px]">{libFileName}</span>
                        <span className="text-[10px] text-[#64748B]">({libFileSize})</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeLibFile}
                        className="inline-flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium px-2.5 py-1.5 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Download className="w-8 h-8 text-[#CBD5E1]" />
                      <div>
                        <label
                          htmlFor="lib-file-upload"
                          className="inline-flex items-center gap-1.5 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" /> Pilih / Cari Berkas di Perangkat
                        </label>
                      </div>
                      <p className="text-xs text-[#1E293B] font-medium">
                        atau <span className="text-[#1B3D7B] font-bold">tarik &amp; lepas (drag and drop)</span> berkas ke area ini.
                      </p>
                      <p className="text-[11px] text-[#64748B]">Format: <strong>PDF, DOC, DOCX</strong> (Maks. 20 MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Deskripsi / Sinopsis Singkat</label>
                <textarea
                  rows={3}
                  value={libDesc}
                  onChange={e => setLibDesc(e.target.value)}
                  placeholder="Ringkasan isi dan kompetensi materi yang dibahas..."
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Terbitkan Dokumen ke E-Library
              </button>
            </form>
          </div>

          {/* Daftar Koleksi E-Library */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Koleksi Dokumen E-Library ({elibrary.length})
            </h2>

            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {elibrary.map(item => (
                <div key={item.id} className="bg-white border border-[#E2E8EF] rounded-lg p-4 shadow-sm flex flex-col justify-between gap-3 hover:border-[#1B3D7B] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#1B3D7B] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm text-[#1E293B] mt-1">{item.title}</h3>
                      <p className="text-[11px] text-[#64748B]">Oleh: {item.author} • {item.publishedYear}</p>
                      <p className="text-xs text-[#475569] line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditELibrary(item)}
                        className="text-[#1B3D7B] hover:text-[#122852] p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Edit Dokumen"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteELibrary(item.id, item.title)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8EF] flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>{item.fileSize} • {item.pageCount} Halaman</span>
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1B3D7B] font-semibold hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Buka / Unduh
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit E-Library */}
      {editingLibId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8EF] rounded-xl shadow-2xl w-full max-w-lg my-8 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Edit Dokumen E-Library</h3>
              <button onClick={() => setEditingLibId(null)} className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] px-2 py-1 rounded hover:bg-[#F1F5F9]">
                ✕ Tutup
              </button>
            </div>
            <form onSubmit={handleSaveEditELibrary} className="space-y-3">
              <div>
                <label className={labelClass}>Judul Buku / Modul *</label>
                <input required type="text" value={editLibTitle} onChange={e => setEditLibTitle(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kategori</label>
                  <select value={editLibCategory} onChange={e => setEditLibCategory(e.target.value as typeof editLibCategory)} className={inputClass}>
                    <option value="Materi Mapaba">Materi Mapaba</option>
                    <option value="Materi PKD">Materi PKD</option>
                    <option value="Nilai Dasar Pergerakan">Nilai Dasar Pergerakan</option>
                    <option value="AD/ART">AD/ART</option>
                    <option value="Pemikiran Tokoh">Pemikiran Tokoh</option>
                    <option value="Pedoman Organisasi">Pedoman Organisasi</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Penulis / Lembaga</label>
                  <input type="text" value={editLibAuthor} onChange={e => setEditLibAuthor(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Ukuran Berkas</label>
                  <input type="text" value={editLibFileSize} onChange={e => setEditLibFileSize(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Jumlah Halaman</label>
                  <input type="number" min={1} value={editLibPageCount} onChange={e => setEditLibPageCount(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tahun Terbit</label>
                  <input type="number" min={1960} max={2030} value={editLibYear} onChange={e => setEditLibYear(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deskripsi Singkat</label>
                <textarea rows={3} value={editLibDesc} onChange={e => setEditLibDesc(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL Berkas Unduhan</label>
                <input type="text" value={editLibDownloadUrl} onChange={e => setEditLibDownloadUrl(e.target.value)} className={inputClass} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditingLibId(null)} className="flex-1 border border-[#E2E8EF] text-[#64748B] text-xs font-semibold py-2.5 rounded transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: Pengaturan Kepengurusan */}
      {activeTab === 'pengaturan' && (
        <div className="max-w-lg">
          <div className="bg-white border border-[#E2E8EF] rounded-lg p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#1B3D7B] uppercase tracking-wider">Edit Data Struktural Kepengurusan</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Nama Ketua dan Sekretaris yang disimpan di sini akan tampil otomatis pada kop surat PDF database kader resmi.
              </p>
            </div>

            <form onSubmit={handleSaveLeadership} className="space-y-4">
              <div>
                <label className={labelClass}>Nama Ketua Komisariat *</label>
                <input
                  required
                  type="text"
                  value={leadership.ketua}
                  onChange={e => setLeadershipState({ ...leadership, ketua: e.target.value })}
                  placeholder="Nama lengkap Ketua PK PMII UNIB"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Nama Sekretaris Komisariat *</label>
                <input
                  required
                  type="text"
                  value={leadership.sekretaris}
                  onChange={e => setLeadershipState({ ...leadership, sekretaris: e.target.value })}
                  placeholder="Nama lengkap Sekretaris PK PMII UNIB"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1B3D7B] hover:bg-[#122852] text-white text-xs font-semibold py-2.5 rounded transition-colors"
              >
                Simpan Data Kepengurusan
              </button>

              {leaderSaved && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 text-center">
                  ✓ Data kepengurusan berhasil disimpan dan akan muncul di PDF.
                </p>
              )}
            </form>

            <div className="text-xs text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8EF] rounded p-3">
              <p className="font-semibold text-[#64748B] mb-1">Data Saat Ini:</p>
              <p>Ketua: <span className="font-semibold text-[#1E293B]">{leadership.ketua || '(belum diisi)'}</span></p>
              <p>Sekretaris: <span className="font-semibold text-[#1E293B]">{leadership.sekretaris || '(belum diisi)'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
