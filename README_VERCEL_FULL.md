# UMN Medic - Full Vercel Version

Paket ini mengubah aplikasi dari PHP + MySQL menjadi static frontend + Node.js API + PostgreSQL/Neon untuk Vercel.

## Isi paket

- `index.html`, `app.js`, `style.css`, `chatbot.css`, `chatbot.js` sebagai frontend.
- `api/index.js` sebagai pengganti `api.php`.
- `api/health.js` untuk cek koneksi database.
- `database_vercel_postgres.sql` untuk membuat tabel dan data awal di PostgreSQL/Neon.
- `.env.example` sebagai contoh environment variables.
- `package.json` untuk dependency Node.js.
- `vercel.json` untuk header keamanan dasar.

## Langkah deploy

1. Buat project baru di Vercel.
2. Hubungkan project dengan repository GitHub yang berisi semua file dalam folder ini.
3. Tambahkan database Postgres melalui Vercel Marketplace, misalnya Neon.
4. Pastikan Environment Variables berisi:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=secret_panjang_minimal_32_karakter
UMN_APP_ENV=production
```

5. Buka dashboard Neon atau SQL Editor database.
6. Jalankan isi file `database_vercel_postgres.sql`.
7. Deploy ulang project di Vercel.
8. Cek koneksi database melalui:

```text
https://domain-vercel-anda.vercel.app/api/health
```

9. Buka aplikasi utama:

```text
https://domain-vercel-anda.vercel.app
```

## Akun awal

```text
Admin  : admin / admin123
Pasien : pasien / pasien123
```

## Catatan migrasi

- File PHP lama tidak dipakai lagi di Vercel.
- File SQL lama MySQL tidak dipakai langsung karena Vercel full version ini memakai PostgreSQL.
- Koneksi database tidak ditulis langsung di kode. Simpan di Environment Variables Vercel.
- Cookie login memakai JWT httpOnly. Frontend tetap memanggil `/api`, bukan `api.php`.
- Jika login gagal setelah impor data, pastikan file `database_vercel_postgres.sql` dijalankan penuh tanpa error.

## Menjalankan lokal

```bash
npm install
cp .env.example .env
# isi DATABASE_URL dan JWT_SECRET
npx vercel dev
```
