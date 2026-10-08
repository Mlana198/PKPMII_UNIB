-- ==============================================================================
-- SKEMA DATABASE: PK PMII UNIVERSITAS IBRAHIMY (UNIB)
-- Kompatibel dengan PostgreSQL 15+ & Supabase
-- Dapat dijalankan langsung via TablePlus (SQL Query Editor) atau SQL Editor Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE cadre_level_enum AS ENUM ('Calon Anggota', 'MAPABA', 'PKD', 'PKL', 'PKN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type_enum AS ENUM ('MAPABA', 'PKD', 'PKL', 'Sekolah KOPRI', 'Pelatihan Khusus', 'Lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quiz_type_enum AS ENUM ('pre_test', 'post_test', 'practice');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reg_status_enum AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_enum AS ENUM ('belum_hadir', 'hadir', 'izin', 'alpha');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL RAYON BINAAN (2 Rayon PK PMII UNIB)
CREATE TABLE IF NOT EXISTS rayons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    faculty VARCHAR(200) NOT NULL,
    established_year INT DEFAULT 2010,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL KADER / ANGGOTA
CREATE TABLE IF NOT EXISTS cadres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    nim VARCHAR(30) UNIQUE NOT NULL,
    university VARCHAR(150) DEFAULT 'Universitas Ibrahimy',
    rayon_id UUID REFERENCES rayons(id) ON DELETE SET NULL,
    faculty VARCHAR(200),
    study_program VARCHAR(150) NOT NULL,
    entry_year INT NOT NULL,
    mapaba_year INT,
    cadre_level cadre_level_enum DEFAULT 'MAPABA',
    non_formal_trainings TEXT[] DEFAULT ARRAY[]::TEXT[],
    phone_number VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    kta_number VARCHAR(100) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    avatar_url TEXT,
    specialization_interest VARCHAR(150),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL WARTA & ARTIKEL
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(150),
    author_avatar TEXT,
    cover_image TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(30) DEFAULT 'published',
    read_time_minutes INT DEFAULT 3,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL AGENDA PELATIHAN / KEGIATAN
CREATE TABLE IF NOT EXISTS training_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    event_type event_type_enum NOT NULL,
    theme TEXT NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    max_quota INT DEFAULT 100,
    banner_url TEXT NOT NULL,
    is_open BOOLEAN DEFAULT true,
    requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
    contact_name VARCHAR(150),
    contact_phone VARCHAR(50),
    has_pre_test BOOLEAN DEFAULT false,
    has_post_test BOOLEAN DEFAULT false,
    pre_test_id UUID,
    post_test_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL PENDAFTARAN KEGIATAN
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES training_events(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    nim VARCHAR(30) NOT NULL,
    university VARCHAR(150) DEFAULT 'Universitas Ibrahimy',
    rayon VARCHAR(150) NOT NULL,
    study_program VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    motivation TEXT,
    status reg_status_enum DEFAULT 'pending',
    qr_ticket_code VARCHAR(100) UNIQUE NOT NULL,
    attendance_status attendance_enum DEFAULT 'belum_hadir',
    pre_test_score INT,
    post_test_score INT,
    is_passed BOOLEAN DEFAULT false,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL KUIS CBT (COMPUTER BASED TEST)
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES training_events(id) ON DELETE SET NULL,
    event_title VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    quiz_type quiz_type_enum NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 20,
    passing_score INT DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    instructions TEXT[] DEFAULT ARRAY[]::TEXT[],
    questions JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL HASIL PENGERJAAN KUIS
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    quiz_title VARCHAR(255) NOT NULL,
    quiz_type quiz_type_enum NOT NULL,
    participant_name VARCHAR(200) NOT NULL,
    participant_nim VARCHAR(30) NOT NULL,
    participant_rayon VARCHAR(150),
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    score INT NOT NULL,
    max_score INT DEFAULT 100,
    total_correct INT NOT NULL,
    total_questions INT NOT NULL,
    is_passed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    tab_switch_violations INT DEFAULT 0
);

-- 10. TABEL E-LIBRARY
CREATE TABLE IF NOT EXISTS e_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    file_size VARCHAR(50),
    download_url TEXT NOT NULL,
    page_count INT,
    published_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DATA AWAL (SEED DATA PK PMII UNIB)
-- ==============================================================================

-- Seed 2 Rayon
INSERT INTO rayons (code, name, faculty, established_year)
VALUES 
    ('RR-SAINTEK', 'Rayon Raden Rahmat', 'Fakultas Sains dan Teknologi', 2012),
    ('RUS-TARBIYAH', 'Rayon Raden Umar Said', 'Fakultas Tarbiyah', 2008)
ON CONFLICT (code) DO NOTHING;

-- Seed E-Library
INSERT INTO e_library (title, author, category, description, file_size, download_url, page_count, published_year)
VALUES
    ('Anggaran Dasar & Anggaran Rumah Tangga (AD/ART) PMII', 'Pengurus Besar PMII', 'AD/ART', 'Konstitusi organisasi PMII hasil Kongres XX.', '3.4 MB', '#', 124, 2022),
    ('Nilai Dasar Pergerakan (NDP) PMII', 'PB PMII Bidang Kaderisasi', 'Nilai Dasar Pergerakan', 'Pedoman landasan filosofis, moral, dan teologis pergerakan.', '1.8 MB', '#', 68, 2021),
    ('Modul Materi MAPABA PK PMII Universitas Ibrahimy', 'Instruktur PK PMII UNIB', 'Materi Mapaba', 'Panduan materi dasar untuk Rayon Raden Rahmat & Rayon Raden Umar Said.', '4.8 MB', '#', 156, 2026),
    ('Paradigma Kritis Transformatif (PKT) PMII', 'Biro Litbang PK PMII UNIB', 'Materi PKD', 'Kajian epistemologi gerakan mahasiswa dalam menganalisis relasi sosial.', '2.6 MB', '#', 110, 2024);

-- Enable Row Level Security (RLS) & Public Read
ALTER TABLE rayons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadres ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_library ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DO $$ BEGIN
    CREATE POLICY "Public read rayons" ON rayons FOR SELECT USING (true);
    CREATE POLICY "Public read cadres" ON cadres FOR SELECT USING (true);
    CREATE POLICY "Public insert cadres" ON cadres FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);
    CREATE POLICY "Public read events" ON training_events FOR SELECT USING (true);
    CREATE POLICY "Public read registrations" ON event_registrations FOR SELECT USING (true);
    CREATE POLICY "Public insert registrations" ON event_registrations FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT USING (true);
    CREATE POLICY "Public read quiz_attempts" ON quiz_attempts FOR SELECT USING (true);
    CREATE POLICY "Public insert quiz_attempts" ON quiz_attempts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public read elibrary" ON e_library FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
