# UMN Medic Vercel: Versi Environment Variables

Paket ini memakai Vercel Environment Variables untuk koneksi database dan keamanan login.
Jangan menulis password database langsung di file frontend seperti `index.html` atau `app.js`.

## 1. Pengaturan Build di Vercel

Isi pengaturan berikut:

```text
Build Command    : kosongkan
Output Directory : .
Install Command  : npm install
```

Jika Vercel tidak mengizinkan Build Command kosong, biarkan default. Jangan isi `npm run build` karena project ini tidak memakai proses build React atau Next.js.

## 2. Environment Variables di Vercel

Tambahkan tiga variabel utama berikut di Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:password_asli@ep-nama-host.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=umn_medic_rahasia_login_2026_aman_123456789
UMN_APP_ENV=production
```

Keterangan:

- `DATABASE_URL` diambil dari Neon Dashboard, bagian Connection Details.
- `JWT_SECRET` dibuat sendiri. Gunakan minimal 32 karakter.
- `UMN_APP_ENV` isi dengan `production`.

## 3. Jalankan SQL di Neon

Buka Neon SQL Editor, lalu jalankan isi file:

```text
database_vercel_postgres.sql
```

File SQL tidak di-upload ke Vercel. File SQL hanya dijalankan di database Neon.

## 4. Tes Environment Variables

Setelah deploy, buka:

```text
https://nama-project-anda.vercel.app/api/env-check
```

Hasil yang benar:

```json
{
  "ok": true,
  "env": {
    "DATABASE_URL": "terisi",
    "DATABASE_URL_FORMAT": "valid_awal",
    "JWT_SECRET": "terisi",
    "JWT_SECRET_MIN_32": true,
    "UMN_APP_ENV": "production"
  }
}
```

Endpoint ini tidak menampilkan password atau isi rahasia.

## 5. Tes Database

Buka:

```text
https://nama-project-anda.vercel.app/api/health
```

Jika koneksi berhasil, hasilnya:

```json
{
  "ok": true,
  "database": true,
  "appEnv": "production",
  "waktu_server": "..."
}
```

## 6. File penting

```text
api/_db.js       : membaca DATABASE_URL dari Environment Variables
api/health.js   : tes koneksi database Neon
api/env-check.js: cek apakah variabel sudah terisi tanpa membuka rahasia
api/index.js    : API utama aplikasi UMN Medic
```
