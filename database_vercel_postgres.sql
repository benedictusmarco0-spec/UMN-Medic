-- UMN Medic Admission System - PostgreSQL/Neon untuk Vercel
-- Jalankan di Neon SQL Editor atau psql setelah DATABASE_URL tersedia.
-- Akun contoh:
--   admin  / admin123
--   pasien / pasien123

BEGIN;

DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS failed_login_attempts CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS medicine_stock_logs CASCADE;
DROP TABLE IF EXISTS admission_medicines CASCADE;
DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id VARCHAR(40) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'pasien' CHECK (role IN ('admin','pasien')),
  name VARCHAR(120) NOT NULL,
  nim_nik VARCHAR(60) NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('L','P')),
  birth_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE medicines (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  received_date DATE NULL,
  expired DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_medicines_category ON medicines(category_id);
CREATE INDEX idx_medicines_expired ON medicines(expired);

CREATE TABLE beds (
  id VARCHAR(30) PRIMARY KEY,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('L','P')),
  occupied_by VARCHAR(40) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_beds_gender ON beds(gender);
CREATE INDEX idx_beds_occupied_by ON beds(occupied_by);

CREATE TABLE admissions (
  id VARCHAR(40) PRIMARY KEY,
  patient_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  complaint TEXT NOT NULL,
  illness_category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triage VARCHAR(30) NOT NULL DEFAULT 'Belum dinilai',
  status VARCHAR(40) NOT NULL DEFAULT 'Laporan diterima',
  bed_id VARCHAR(30) NULL REFERENCES beds(id) ON DELETE SET NULL,
  temp VARCHAR(20) NULL,
  bp VARCHAR(30) NULL,
  pulse VARCHAR(20) NULL,
  diagnosis TEXT NULL,
  treatment TEXT NULL,
  medical_officer VARCHAR(120) NULL,
  responsible_officer VARCHAR(120) NULL,
  responsible_category VARCHAR(30) NULL,
  referral_hospital VARCHAR(150) NULL,
  referral_reason TEXT NULL,
  referral_date TIMESTAMPTZ NULL,
  referral_officer VARCHAR(120) NULL,
  referral_responsible_officer VARCHAR(120) NULL,
  completed_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_triage ON admissions(triage);
CREATE INDEX idx_admissions_category ON admissions(illness_category);

ALTER TABLE beds
  ADD CONSTRAINT fk_bed_occupied_admission
  FOREIGN KEY (occupied_by) REFERENCES admissions(id) ON DELETE SET NULL;

CREATE TABLE admission_medicines (
  id BIGSERIAL PRIMARY KEY,
  admission_id VARCHAR(40) NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  medicine_id VARCHAR(30) NULL REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name VARCHAR(150) NOT NULL,
  qty INTEGER NOT NULL,
  officer VARCHAR(120) NULL,
  responsible_officer VARCHAR(120) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admission_medicines_admission ON admission_medicines(admission_id);
CREATE INDEX idx_admission_medicines_medicine ON admission_medicines(medicine_id);

CREATE TABLE medicine_stock_logs (
  id BIGSERIAL PRIMARY KEY,
  medicine_id VARCHAR(30) NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  admission_id VARCHAR(40) NULL REFERENCES admissions(id) ON DELETE SET NULL,
  movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('IN','OUT','ADJUSTMENT','EXPIRED_REMOVAL')),
  qty INTEGER NOT NULL,
  stock_before INTEGER NULL,
  stock_after INTEGER NULL,
  officer VARCHAR(120) NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_stock_logs_medicine ON medicine_stock_logs(medicine_id);
CREATE INDEX idx_stock_logs_admission ON medicine_stock_logs(admission_id);
CREATE INDEX idx_stock_logs_type ON medicine_stock_logs(movement_type);

CREATE TABLE feedbacks (
  id VARCHAR(40) PRIMARY KEY,
  user_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admission_id VARCHAR(40) NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  email VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  critique TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  service_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_admission ON feedbacks(admission_id);

CREATE TABLE security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  actor_user_id VARCHAR(64) NULL,
  actor_role VARCHAR(32) NULL,
  source_ip VARCHAR(64) NULL,
  request_id VARCHAR(64) NULL,
  event_payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_security_events_type_created ON security_events(event_type, created_at);
CREATE INDEX idx_security_events_severity_created ON security_events(severity, created_at);
CREATE INDEX idx_security_events_actor_created ON security_events(actor_user_id, created_at);
CREATE INDEX idx_security_events_ip_created ON security_events(source_ip, created_at);

CREATE TABLE failed_login_attempts (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(128) NOT NULL,
  source_ip VARCHAR(64) NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_failed_login_username_created ON failed_login_attempts(username, created_at);
CREATE INDEX idx_failed_login_ip_created ON failed_login_attempts(source_ip, created_at);

CREATE TABLE api_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  rate_key VARCHAR(191) NOT NULL,
  bucket_start INTEGER NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rate_key, bucket_start)
);
CREATE INDEX idx_api_rate_limits_updated ON api_rate_limits(updated_at);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_medicines_updated BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_beds_updated BEFORE UPDATE ON beds FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_admissions_updated BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

INSERT INTO users (id, username, password_hash, role, name, nim_nik, gender, birth_date) VALUES
('u-admin', 'admin', '$2y$12$bd4THh9AE5YlQUQ9gwH4VOavc4BLaLi2zp3e1CXUtux9HQs52y6Ma', 'admin', 'Admin UMN Medic', 'STAFF-001', 'P', NULL),
('u-pasien', 'pasien', '$2y$12$TJBzz5dfGZb0VCz55XZu.eyqaHvLHySvlK/ZvKvBVE.UwJ.DCNhcC', 'pasien', 'Bintang Mahasiswa', '00000078910', 'L', '2004-04-12');

INSERT INTO medicines (id, name, category_id, stock, min_stock, received_date, expired) VALUES
('MED-001', 'Paracetamol 500mg', 'pusing-demam', 24, 30, '2026-05-01', '2026-06-25'),
('MED-002', 'OBH / Obat Batuk', 'batuk-flu', 18, 20, '2026-05-03', '2026-08-10'),
('MED-003', 'Antasida', 'maag-mual', 12, 15, '2026-05-06', '2026-06-20'),
('MED-004', 'Oralit', 'diare', 55, 20, '2026-05-04', '2027-01-10'),
('MED-005', 'Obat Nyeri Haid', 'nyeri-mens', 16, 10, '2026-05-08', '2026-11-15'),
('MED-006', 'Antihistamin', 'alergi-gatal', 14, 12, '2026-05-09', '2026-09-05'),
('MED-007', 'Povidone Iodine', 'luka-ringan', 9, 10, '2026-05-10', '2026-12-01'),
('MED-008', 'Vitamin / Suplemen Klinik', 'kelelahan-stres', 30, 15, '2026-05-11', '2027-02-12');

INSERT INTO beds (id, gender, occupied_by) VALUES
('L-01', 'L', NULL),
('L-02', 'L', NULL),
('L-03', 'L', NULL),
('P-01', 'P', NULL),
('P-02', 'P', NULL),
('P-03', 'P', NULL);

INSERT INTO admissions (
  id, patient_id, complaint, illness_category, created_at, triage, status,
  bed_id, temp, bp, pulse, diagnosis, treatment, medical_officer,
  responsible_officer, responsible_category, referral_hospital, referral_reason, referral_date,
  referral_officer, referral_responsible_officer, completed_at
) VALUES
(
  'ADM-260501-001', 'u-pasien',
  'Demam, pusing, dan nyeri tenggorokan sejak kemarin malam.',
  'pusing-demam', '2026-05-01 08:15:00+07', 'Kuning',
  'Menunggu pemeriksaan', 'L-01', '38.2', '120/80', '92',
  'Observasi ISPA ringan',
  'Istirahat 45 menit, hidrasi, edukasi gejala lanjutan.',
  'Admin UMN Medic', 'Admin UMN Medic', 'Suster',
  NULL, NULL, NULL, NULL, NULL, NULL
),
(
  'ADM-260430-009', 'u-pasien',
  'Mual setelah makan di kantin.',
  'maag-mual', '2026-04-30 13:10:00+07', 'Hijau',
  'Selesai', NULL, '36.8', '118/76', '78',
  'Dyspepsia ringan',
  'Observasi 20 menit dan edukasi pola makan.',
  'Admin UMN Medic', 'Admin UMN Medic', 'Staff',
  NULL, NULL, NULL, NULL, NULL, '2026-04-30 13:45:00+07'
);

UPDATE beds SET occupied_by = 'ADM-260501-001' WHERE id = 'L-01';

INSERT INTO admission_medicines (admission_id, medicine_id, medicine_name, qty, officer, responsible_officer, created_at) VALUES
('ADM-260501-001', 'MED-001', 'Paracetamol 500mg', 2, 'Admin UMN Medic', 'Admin UMN Medic', '2026-05-01 08:40:00+07'),
('ADM-260430-009', 'MED-003', 'Antasida', 1, 'Admin UMN Medic', 'Admin UMN Medic', '2026-04-30 13:35:00+07');

INSERT INTO medicine_stock_logs (medicine_id, admission_id, movement_type, qty, stock_before, stock_after, officer, note, created_at) VALUES
('MED-001', NULL, 'IN', 24, 0, 24, 'Admin UMN Medic', 'Stok awal dari impor database', '2026-05-01 07:30:00+07'),
('MED-003', NULL, 'IN', 13, 0, 13, 'Admin UMN Medic', 'Stok awal dari impor database', '2026-04-30 12:30:00+07'),
('MED-003', 'ADM-260430-009', 'OUT', 1, 13, 12, 'Admin UMN Medic', 'Pemberian obat pasien', '2026-04-30 13:35:00+07');

INSERT INTO feedbacks (id, user_id, admission_id, email, category, critique, suggestion, service_date, created_at) VALUES
('FDB-260430-001', 'u-pasien', 'ADM-260430-009', 'bintang@student.umn.ac.id', 'Pelayanan klinik', 'Waktu tunggu masih perlu dibuat lebih jelas sejak pasien mengirim keluhan sampai dipanggil petugas.', 'Tambahkan estimasi antrean dan notifikasi status pemeriksaan agar pasien bisa memantau proses layanan.', '2026-04-30 13:10:00+07', '2026-04-30 14:05:00+07');

COMMIT;
