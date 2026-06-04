# EduTrack1 Project Blueprint

## Tech Stack
- Frontend: HTML, Bootstrap 5, Fetch API
- Backend: Node.js + Express.js
- Database: MySQL (menggunakan mysql2/promise pool)
- Auth: JWT + bcryptjs
- Port: 3000

## Database Schema (MySQL - edutrack_db)
- `users`: id (INT PK AI), name (VARCHAR), email (VARCHAR UNIQUE), password (VARCHAR), created_at (TIMESTAMP)
- `tasks`: id (INT PK AI), user_id (INT FK), title (VARCHAR), mata_kuliah (VARCHAR), priority (ENUM 'tinggi', 'sedang', 'rendah'), deadline (DATE), is_done (BOOLEAN DEFAULT FALSE), created_at (TIMESTAMP)
- `mata_kuliah`: id (INT PK AI), user_id (INT FK), nama (VARCHAR)

## Target Folder Structure
edutrack1/
├── agent.md
├── backend/
│   ├── server.js
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   ├── routes/
│   └── controllers/
└── frontend/

## Configuration Specifications

### File: backend/config/db.js
- Menggunakan library `mysql2/promise` untuk membuat connection pool.
- Konfigurasi mengambil dari file `.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
- Harus mengexport objek pool tersebut agar bisa digunakan secara async/await di controller.

## Changelog — Perbaikan 2026-05-31

### 1. Entry point server
- **package.json**: `"start"` diubah dari `node server.js` → `node backend/server.js`
- Root `server.js` hanya punya 3 route, `backend/server.js` punya semua 7 route (auth, tasks, matkul, jadwal, nilai, contact, newsletter)

### 2. Database config
- `backend/config/db.js`: hardcode `'edutrack1_db'` diganti `process.env.DB_NAME`
- Root `.env`: `DB_NAME=edutrack_db` → `DB_NAME=edutrack1_db` (konsisten dengan backend)

### 3. Kolom `nim` & `prodi` di tabel `users`
- Tabel `users` tadinya cuma: id, name, email, password, created_at
- Controller `authController.js` SELECT + UPDATE kolom `nim` dan `prodi` tapi kolom tidak ada → error
- Fix: `ALTER TABLE users ADD COLUMN nim VARCHAR(50) AFTER email, ADD COLUMN prodi VARCHAR(100) AFTER nim`

### 4. Sidebar navigation links
- `tugas.html`, `jadwal.html`, `nilai.html`, `profile.html` — banyak link sidebar masih `#` atau `taskmanager.html#...`
- Fix: semua diarahkan ke halaman yang benar (`jadwal.html`, `nilai.html`, `profile.html`, `tugas.html`)

### 5. IPK kalkulasi di profile.html
- `loadStats()` dan `loadIpkSemester()` pake `gradeToBobot(n.grade)` tapi API return `nilai_angka`
- Fix: tambah fungsi `konversiNilai(angka)` yang konversi nilai angka (0-100) ke bobot (4.0-0.0)

### 6. Logout redirect (taskmanager.html)
- `taskmanager.html:213` redirect ke `login.html` seharusnya `index.html`
- Juga fix key localStorage: `'name'` → `'userName'` (inkonsisten dengan halaman lain)
- Fix: redirect ke `index.html`

### 7. XSS (Cross-Site Scripting)
- `jadwal.html`, `nilai.html`, `profile.html`, `tugas.html` — konten dari API (mata_kuliah, title, dll) langsung di-innerHTML tanpa escaping
- Fix: tambah fungsi `esc()` / `escHtml()` di semua halaman untuk sanitasi output

### 8. `.gitignore`
- Dibuat file `.gitignore` untuk ignore `node_modules/` dan `.env`

### 9. Testing API
- Semua 39 test case backend API di `docs/testing-checklist.md` sudah dijalankan dan ✅ PASS
- Rincian: Auth (11), Tasks (9), Matkul (5), Jadwal (5), Nilai (5), Public (4)

### 10. Navbar dropdown di taskmanager.html
- **`taskmanager.html`**: navbar lama (brand + username + logout) diganti navbar dengan 3 dropdown menu:
  - **Tugas**: Kelola Tugas → `tugas.html`, Kelola Mata Kuliah → `tugas.html#matkulSection`
  - **Jadwal**: Kelola Jadwal → `jadwal.html`
  - **Profil**: Edit Profil → `profile.html`, Ringkasan Akademik → `profile.html#akademikSection`
- Section "Jadwal & Analitik" (placeholder "segera hadir") diganti card link ke `jadwal.html` dan `nilai.html`
- Anchor baru: `id="matkulSection"` di `tugas.html`, `id="akademikSection"` di `profile.html`
- Navbar ini hanya di `taskmanager.html`, halaman lain tetap pakai sidebar/navbar masing-masing

### 11. Tombol "Buka Task Manager" di landing page
- `frontend/index.html` — ditambahkan tombol "Buka Task Manager" di section **Why Choose EduTrack?** (setelah 3 fitur cards)
- Tombol panggil `goToTaskManager()` (redirect ke `taskmanager.html` jika sudah login, atau `login.html?next=taskmanager.html` jika belum)

### 12. Seragamkan navbar di semua halaman (31 Mei 2026)
- **Semua halaman** sekarang pakai navbar yang sama: `bg-primary shadow fixed-top` dengan `container`, 6 nav link (Home, Task Manager, Tugas, Jadwal, Nilai, Profil), username display, dan logout button.
- Sidebar dihapus dari `tugas.html`, `nilai.html`, `profile.html` — diganti dengan navbar horizontal.
- Layout padding konsisten: `padding-top: 88px` (56px navbar + 32px spacing) via `style="margin-top:88px"`.
- Semua halaman link `style.css` (shared CSS) dan `auth-check.js`.
- Bootstrap Icons diganti dengan Font Awesome 6 (`fas`).

### 13. Redesign index.html
- `frontend/index.html` — ganti total dengan struktur baru:
  - Navbar seragam (6 nav items)
  - Hero section dengan ilustrasi + 2 CTA button
  - About section (4 kelebihan: footer grid list)
  - Features section (3 cards: Monitoring Nilai, Jadwal Kuliah, Manajemen Tugas)
  - Footer dengan navigasi lengkap + kontak + sosial media
- Hapus section Newsletter & Contact (tidak ada di template)
- Auth state dikelola via inline script di halaman

### 14. Redesign taskmanager.html
- `frontend/taskmanager.html` — ganti total:
  - Navbar seragam dengan dropdown menu (sama seperti sebelumnya)
  - 3 feature cards (Manajemen Tugas → tugas.html, Jadwal Kuliah → jadwal.html, Nilai & IPK → nilai.html)
  - Quick stats row (Tugas Aktif, Jadwal/Minggu, IPK Terakhir) dengan fetch real-time dari API
  - Hapus section tasks, matkul progress, jadwal, analitik

### 15. Redesign jadwal.html
- `frontend/jadwal.html` — ganti total:
  - Navbar seragam
  - Layout baru: summary cards (Total Mata Kuliah, Jam/Minggu, Jenis Jadwal)
  - Badge legend (Kuliah/Praktikum/Bimbingan)
  - Calendar grid dengan class `.calendar-grid`, `.cal-header`, `.cal-item`, `.cal-praktikum`, `.cal-bimbingan`
  - Mobile list view dengan class `.list-jadwal-item`
  - 2 modal terpisah: `modalTambahJadwal` (field: jMatkul, jJenis, jHari, jMulai, jSelesai, jRuang) dan `modalEditJadwal` (field: eMatkul, eJenis, eHari, eMulai, eSelesai, eRuang)
  - JS baru dengan field ID baru, validasi, CRUD ke API

### 16. Update tugas.html, nilai.html, profile.html
- Ketiga halaman diganti navbar + layout:
  - Sidebar dihapus, semua link sidebar dihapus
  - Navbar seragam (bg-primary, 6 nav items, active state sesuai halaman)
  - Container baru: `container py-4` dengan `margin-top:88px`
  - Old CSS inline dipangkas (sidebar-related dihapus)
  - Old bootstrap-icons links dihapus
  - Stale files `css/style.css` dan `app.js` dihapus
