# Rangkuman Lengkap Proyek EduTrack — Untuk Laporan

## 1. Identitas Proyek
| Item | Detail |
|---|---|
| **Nama Aplikasi** | EduTrack — Aplikasi Manajemen Akademik Mahasiswa |
| **Kelompok** | Kelompok 3 |
| **Mata Kuliah** | Proyek Pengembangan Web |
| **Tahun** | 2026 |
| **Tujuan** | Platform terintegrasi untuk mengelola tugas kuliah, jadwal perkuliahan, dan monitoring nilai/IPK dalam satu dashboard. |

---

## 2. Tech Stack

| Layer | Teknologi | Versi | Fungsi |
|---|---|---|---|
| **Frontend** | HTML5, CSS3, Bootstrap 5.3.3 | — | Struktur & styling halaman |
| | Vanilla JavaScript (ES6+) | — | Logic frontend: Fetch API, DOM manipulation, async/await |
| | Font Awesome 6.4.0 | — | Ikon UI |
| **Backend** | Node.js | v18+ | Runtime JavaScript |
| | Express.js | 5.x | Web framework REST API |
| | JSON Web Token (JWT) | ^9.0.3 | Autentikasi & session |
| | bcryptjs | ^3.0.3 | Hashing password |
| | Multer | ^2.x | Upload file (foto profil) |
| | Nodemailer | ^8.x | Kirim email newsletter via SMTP Gmail |
| **Database** | MySQL 8 | — | Database relasional |
| | mysql2/promise | ^3.22.4 | Driver koneksi pool-based |
| | **Server** | Apache (XAMPP) | — | Serve static frontend |
| | Node.js (port 3000) | — | Serve backend API |

### Dependencies (package.json)
```json
{
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.1.1",
  "mysql2": "^3.22.4",
  "nodemailer": "^8.0.10"
}
```

---

## 3. Arsitektur Sistem

```
Browser
  │
  ├── http://localhost/PengembanganWEB/edutrack1/
  │         │
  │         ▼ (Apache via XAMPP)
  │    ┌──────────────┐
  │    │  Frontend     │  HTML + CSS + Vanilla JS
  │    │  (.htaccess   │  (static files)
  │    │   rewrite)    │
  │    └──────┬───────┘
  │           │ fetch('http://localhost:3000/api/...')
  │           ▼
  │    ┌──────────────┐
  │    │  Backend API  │  Node.js + Express (port 3000)
  │    │  (server.js)  │  Routes → Controllers → Database
  │    └──────┬───────┘
  │           │ mysql2/promise (connection pool)
  │           ▼
  │    ┌──────────────┐
  │    │  MySQL 8      │  Database: edutrack1_db
  │    │  (XAMPP)      │  6 tables
  │    └──────────────┘
```

**Alur Autentikasi:**
1. User login → backend validasi → return JWT token (exp: 7 hari)
2. Token disimpan di `localStorage` frontend
3. Setiap request API menyertakan header `Authorization: Bearer <token>`
4. Backend middleware `authMiddleware.js` verifikasi JWT di setiap request protected
5. Frontend `auth-check.js` (inline blocking script) redirect ke login jika token tidak valid/kedaluwarsa

---

## 4. Struktur Proyek

```
edutrack1/
├── .htaccess                  # Rewrite root → frontend/
├── .gitignore                 # Ignore node_modules, .env, uploads, *.log
├── .env                       # DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT, JWT_SECRET
├── package.json               # Scripts: npm start = "node backend/server.js"
├── README.md                  # Dokumentasi proyek
│
├── backend/
│   ├── config/db.js           # MySQL connection pool (mysql2/promise)
│   ├── server.js              # Entry point: middleware CORS, JSON 5mb, static /uploads
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification middleware
│   │   └── adminMiddleware.js      # Admin role check middleware
│   ├── controllers/
│   │   ├── authController.js     # register, login, getProfile, updateProfile, changePassword, uploadFoto
│   │   ├── taskController.js     # CRUD tasks + toggle is_done / is_submitted
│   │   ├── matkulController.js   # CRUD mata kuliah
│   │   ├── jadwalController.js   # CRUD jadwal + deteksi bentrok
│   │   ├── nilaiController.js    # CRUD nilai
│   │   ├── contactController.js  # Contact form handler
│   │   ├── newsletterController.js # Newsletter subscribe/send
│   │   └── adminController.js    # Admin: stats, users, messages, subscribers
│   ├── routes/
│   │   ├── auth.js               # 6 endpoints (2 public, 4 protected)
│   │   ├── tasks.js              # 7 endpoints (all protected)
│   │   ├── matkul.js             # 4 endpoints (all protected)
│   │   ├── jadwal.js             # 5 endpoints (all protected)
│   │   ├── nilai.js              # 5 endpoints (all protected)
│   │   ├── contact.js            # 1 endpoint (public)
│   │   ├── newsletter.js         # 3 endpoints (1 public, 2 protected)
│   │   └── admin.js              # 6 endpoints (auth + admin middleware)
│   └── uploads/profiles/         # Foto profil user (gitignored)
│
├── frontend/
│   ├── auth-check.js             # Auth guard frontend (blocking script on protected pages)
│   ├── style.css                 # Shared styles (427 lines): CSS variables, dark theme, navbar, calendar grid, animations
│   ├── css/
│   │   ├── index.css             # Hero section gradient, about icons
│   │   ├── tugas.css             # Progress ring, priority borders, task items
│   │   ├── jadwal.css            # Summary card hover
│   │   ├── nilai.css             # Grade stats, distribution, IPK chart
│   │   └── profile.css           # extra-small text, stat cards, schedule items, password bars
│   ├── js/
│   │   ├── index.js              # Newsletter subscribe, contact form, auth-aware navbar
│   │   ├── login.js              # Login form → POST /api/auth/login
│   │   ├── register.js           # Register form → POST /api/auth/register
│   │   ├── taskmanager.js        # Dashboard: hitung active tasks, jadwal count, IPK
│   │   ├── tugas.js              # Full CRUD tasks + filter + progress ring + matkul side panel
│   │   ├── jadwal.js             # CRUD jadwal + renderCalendar (grid with absolute positioned items)
│   │   ├── nilai.js              # CRUD nilai + IPK kalkulasi + distribusi grafik + IPK per semester chart
│   │   ├── profile.js            # Load profile, stats, today schedule, upcoming tasks, progress MK,
│   │   │                         # IPK per semester, task completion rate, busiest day chart
│   │   ├── broadcast.js          # Admin panel: dashboard stats, users table, messages, subscribers, send newsletter (5 tab system)
│   │   └── theme-toggle.js       # Dark/light switch, localStorage persistence
│   │
│   ├── index.html                # Halaman utama (hero, about, features, newsletter, contact, footer)
│   ├── login.html                # Form login
│   ├── register.html             # Form registrasi
│   ├── taskmanager.html          # Dashboard hub (stat cards, menu links)
│   ├── tugas.html                # Manajemen tugas CRUD
│   ├── jadwal.html               # Jadwal kuliah dengan kalender grid
│   ├── nilai.html                # Monitoring nilai & IPK
│   ├── profile.html              # Profil + ringkasan akademik (3-row compact layout)
│   └── broadcast.html            # Admin Panel (role-based, admin only) — 5 tab: Dashboard, Users, Messages, Subscribers, Newsletter
│
├── database/
│   └── edutrack_db.sql           # Full schema + seed data
│
├── docs/
│   ├── API.md                    # Dokumentasi API lengkap
│   └── testing-checklist.md      # Checklist pengujian
│
└── img/
    ├── Gambar Edu.jpg            # Ilustrasi hero (AI-generated)
    ├── Home.png                  # Screenshot landing page
    ├── Task Manager.png          # Screenshot task manager
    ├── Features.png              # Screenshot features section
    ├── About.png                 # Screenshot about section
    └── Contact.png               # Screenshot contact form
```

---

## 5. Database — 6 Tables (MySQL InnoDB, utf8mb4)

### Diagram Relasi
```
users 1──N mata_kuliah
users 1──N tasks
users 1──N jadwal
users 1──N nilai
(messages & subscribers = standalone)
```

### Detail per Table

**users**
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(100) | UNIQUE NOT NULL | |
| password | VARCHAR(255) | NOT NULL | bcrypt hash |
| nim | VARCHAR(30) | DEFAULT NULL | |
| prodi | VARCHAR(100) | DEFAULT NULL | |
| foto_profil | VARCHAR(255) | DEFAULT NULL | Path ke file |
| role | ENUM('user','admin') | NOT NULL DEFAULT 'user' | Hak akses (admin/user) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**tasks**
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| user_id | INT | FK → users(id) ON DELETE CASCADE | |
| title | VARCHAR(255) | NOT NULL | |
| priority | ENUM('tinggi','sedang','rendah') | DEFAULT 'sedang' | |
| deadline | DATE | DEFAULT NULL | |
| mata_kuliah | VARCHAR(100) | DEFAULT NULL | |
| is_done | TINYINT(1) | DEFAULT 0 | |
| is_submitted | TINYINT(1) | DEFAULT 0 | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**mata_kuliah**
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| user_id | INT | FK → users(id) ON DELETE CASCADE | |
| nama | VARCHAR(100) | NOT NULL | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**jadwal**
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| user_id | INT | FK → users(id) ON DELETE CASCADE | |
| mata_kuliah | VARCHAR(100) | NOT NULL | |
| jenis | ENUM('kuliah','praktikum','bimbingan') | DEFAULT 'kuliah' | |
| hari | ENUM('senin','selasa','rabu','kamis','jumat','sabtu') | NOT NULL | |
| jam_mulai | TIME | NOT NULL | |
| jam_selesai | TIME | NOT NULL | |
| ruang | VARCHAR(50) | DEFAULT NULL | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**nilai**
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| user_id | INT | FK → users(id) ON DELETE CASCADE | |
| mata_kuliah | VARCHAR(100) | NOT NULL | |
| semester | VARCHAR(50) | NOT NULL DEFAULT '' | "Ganjil 2026/2027" |
| sks | INT | NOT NULL DEFAULT 2 | |
| nilai_angka | DECIMAL(4,2) | NOT NULL | 0–100 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**messages** (contact form)
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(100) | NOT NULL | |
| message | TEXT | NOT NULL | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**subscribers** (newsletter)
| Column | Type | Constraint | Notes |
|---|---|---|---|
| id | INT | PK AUTO_INCREMENT | |
| email | VARCHAR(100) | UNIQUE NOT NULL | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

## 6. API Endpoints — 31 Total

### Autentikasi (6 endpoint)
| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | /api/auth/register | ✗ | Daftar akun baru |
| POST | /api/auth/login | ✗ | Login, return JWT |
| GET | /api/auth/profile | ✓ | Ambil profil user |
| PUT | /api/auth/profile | ✓ | Update nama/NIM/prodi |
| PUT | /api/auth/password | ✓ | Ganti password |
| POST | /api/auth/upload-foto | ✓ | Upload foto profil (Multer, max 2MB) |

### Tasks (7 endpoint)
| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | /api/tasks | ✓ | Semua tugas (sorted by created_at DESC) |
| GET | /api/tasks/:id | ✓ | Detail tugas |
| POST | /api/tasks | ✓ | Tambah tugas |
| PUT | /api/tasks/:id | ✓ | Edit tugas |
| DELETE | /api/tasks/:id | ✓ | Hapus tugas |
| PATCH | /api/tasks/:id/toggle | ✓ | Toggle selesai/belum |
| PATCH | /api/tasks/:id/submit | ✓ | Toggle submitted |

### Mata Kuliah (4 endpoint)
| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | /api/matkul | ✓ | Semua mata kuliah (sorted ASC) |
| POST | /api/matkul | ✓ | Tambah MK |
| PUT | /api/matkul/:id | ✓ | Edit MK |
| DELETE | /api/matkul/:id | ✓ | Hapus MK |

### Jadwal (5 endpoint)
| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | /api/jadwal | ✓ | Semua jadwal (sorted by day, time) |
| GET | /api/jadwal/:id | ✓ | Detail jadwal |
| POST | /api/jadwal | ✓ | Tambah (dengan deteksi bentrok → 409) |
| PUT | /api/jadwal/:id | ✓ | Edit (dengan deteksi bentrok) |
| DELETE | /api/jadwal/:id | ✓ | Hapus |

### Nilai (5 endpoint)
| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | /api/nilai | ✓ | Semua nilai (sorted by semester DESC) |
| GET | /api/nilai/:id | ✓ | Detail nilai |
| POST | /api/nilai | ✓ | Tambah nilai |
| PUT | /api/nilai/:id | ✓ | Edit nilai |
| DELETE | /api/nilai/:id | ✓ | Hapus nilai |

### Publik (4 endpoint)
| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | /api/contact | ✗ | Kirim pesan kontak |
| POST | /api/newsletter/subscribe | ✗ | Subscribe newsletter |
| GET | /api/newsletter/subscribers | ✓ | Daftar subscriber |
| POST | /api/newsletter/send | ✓ | Kirim newsletter via email (Nodemailer BCC) |

### Admin (6 endpoint — require auth + admin role)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/admin/stats | Statistik dashboard (users, tasks, messages, subscribers) |
| GET | /api/admin/users | Daftar semua user (tanpa password) |
| DELETE | /api/admin/users/:id | Hapus user (tidak bisa hapus diri sendiri) |
| GET | /api/admin/messages | Daftar semua pesan kontak |
| DELETE | /api/admin/messages/:id | Hapus pesan |
| DELETE | /api/admin/subscribers/:id | Hapus subscriber |

---

## 7. Fitur Lengkap per Halaman

### Landing Page (`index.html`)
- Hero section dengan ilustrasi AI-generated (gradien biru #0d6efd)
- About section: 4 value propositions (manajemen tugas, jadwal, nilai, akses mudah)
- Features section: 3 feature cards
- Task Manager CTA
- **Newsletter subscription form** → POST `/api/newsletter/subscribe`
- **Contact form** → POST `/api/contact` → tersimpan di tabel `messages`
- Navbar adaptif: jika user sudah login, tampilkan menu dropdown dengan link ke taskmanager/tugas/jadwal/nilai/profil

### Login (`login.html`)
- Form email + password
- Dukungan query params: `?expired=1` (tampilkan banner expired), `?next=...` (redirect setelah login)
- → POST `/api/auth/login` → simpan token + userName di localStorage

### Register (`register.html`)
- Form nama + email + password + confirm password
- Validasi password cocok di frontend
- → POST `/api/auth/register` → redirect ke login

### Task Manager / Dashboard (`taskmanager.html`)
- **3 stat cards**: Active Tasks, Jadwal (total per minggu), IPK Terakhir
- 3 menu links menuju tugas/jadwal/nilai

### Manajemen Tugas (`tugas.html`)
- **CRUD tugas**: tambah, edit, hapus, toggle selesai, toggle submitted
- **Filter** by status (semua/selesai/belum/dikumpul/belum kumpul), priority (tinggi/sedang/rendah), mata kuliah
- **Stats cards**: total, selesai, pending, belum dikumpul, progress %
- **Progress ring** (SVG circular) untuk overall completion
- **Sidebar**: daftar mata kuliah + progress bar per MK
- **Indikator deadline**: warna warning (3 hari) / danger (hari ini) / overdue (merah)
- **Prioritas**: border warna (merah/kuning/hijau)
- **Toast notifications** untuk feedback

### Jadwal Kuliah (`jadwal.html`)
- **CRUD jadwal**: tambah, edit, hapus
- **Kalender grid** (desktop): baris = jam (06:00–20:00), kolom = hari (Senin–Sabtu), item di-posisikan absolute sesuai durasi
- **Mobile view**: list per hari
- **Deteksi bentrok otomatis**: backend return 409 jika jam overlap di hari yang sama
- **Summary**: jumlah MK unik + total jam per minggu
- **Jenis sesi**: kuliah (biru), praktikum (hijau), bimbingan (orange) — badge berbeda

### Monitoring Nilai (`nilai.html`)
- **CRUD nilai**: tambah, edit, hapus
- **Konversi nilai otomatis**: angka 0–100 → huruf (A/A-/B+/B/B-/C+/C/D/E) + bobot (4.0–0.0)
- **Preview live**: saat mengetik nilai angka, langsung tampilkan huruf + bobot
- **Stats**: IPK total, total SKS, jumlah MK, nilai tertinggi
- **Distribusi nilai**: bar chart per huruf (A/B/C/D/E)
- **IPK per semester**: bar chart per semester
- **Filter tabs**: filter tabel per semester
- **Semester otomatis**: datalist berisi semester yang ada + generate 2018–2035

### Profil (`profile.html`) — layout 3 baris kompak
- **Profil card**: foto (upload), nama, email, NIM, prodi, edit profil modal, ubah password
- **Password strength meter**: 5 bar dengan evaluasi real-time (panjang, huruf besar/kecil, angka, simbol)
- **Row 1 — Ringkasan Statistik** (6 card: IPK, SKS, Tugas, Selesai, Belum, Lewat)
- **Row 2 — 3 kolom**:
  - Task Completion (% besar + progress bar + X/Y tugas)
  - Jadwal Hari Ini (list)
  - Hari Tersibuk (bar chart 6 hari, jam tertinggi warna biru)
- **Row 3 — 3 kolom** (scrollable 185px):
  - Tugas Mendatang (6 terdekat, dengan indikator overdue)
  - Progress per MK (progress bar per mata kuliah)
  - IPK per Semester (bar chart)

### Admin Panel (`broadcast.html`) — role-based, admin only
- **Dashboard tab**: 4 stat cards (Total Users, Tasks, Messages, Subscribers)
- **Users tab**: tabel semua user dengan role badge + delete (non-admin users only)
- **Messages tab**: tabel semua pesan kontak + delete
- **Subscribers tab**: tabel semua subscriber + delete
- **Newsletter tab**: form kirim newsletter ke semua subscriber via SMTP
- Proteksi: non-admin di-redirect ke index.html oleh auth-check.js
- Navbar admin badge (`<i class="fas fa-shield-alt"> Admin`)
- Login admin: `admin@test.com / admin123`

### Tema Dark/Light
- Toggle via tombol sun/moon di navbar (setiap halaman login)
- Preferensi tersimpan di `localStorage('edutrack-theme')`
- CSS variables + `theme-dark` class override di `style.css`
- Flash prevention: inline `<script>` di `<body>` paling atas
- Animasi: `fadeInUp` card entrance + hover lift

---

## 8. Auth Flow Detail

### Frontend Auth Guard (`auth-check.js`)
1. Script blocking — di-load sebelum konten halaman
2. Cek `localStorage.getItem('token')`
3. Jika tidak ada → redirect ke `login.html?next=<current_page>`
4. Jika ada → decode base64 payload JWT, cek `exp`
5. Jika expired → clear localStorage → redirect ke `login.html?expired=1`
6. Jika valid → isi navbar dengan `userName`, attach event logout
7. Ekstrak `role` dari JWT payload → simpan di `localStorage.setItem('userRole', role)`
8. Jika halaman = `broadcast.html` dan role ≠ admin → redirect ke index.html
9. Sembunyikan link "Admin Panel" dari navbar untuk non-admin user

### Backend Auth Middleware (`authMiddleware.js`)
1. Extract `Authorization` header
2. Cek format `Bearer <token>`
3. `jwt.verify(token, JWT_SECRET)` → jika invalid/expired return 401
4. Jika valid → `req.user = { id, name, email, role }` → `next()`

### Backend Admin Middleware (`adminMiddleware.js`)
1. Dipanggil setelah `authMiddleware`
2. Cek `req.user.role === 'admin'`
3. Jika bukan admin → return 403 Access denied

### JWT Payload
```json
{
  "id": 1,
  "name": "Budi",
  "email": "budi@mail.com",
  "role": "user",          // "user" atau "admin"
  "iat": <timestamp>,
  "exp": <timestamp + 7 hari>
}
```

---

## 9. CSS / Theming

### style.css (427 lines) — shared
- CSS variables: `--sb-primary`, `--dark-nav` (#0a192f), `--dark-bg` (#0d1117), `--dark-card` (#161b22), `--dark-border`, `--dark-text`, `--dark-muted`
- `.theme-dark` overrides: cards, modals, forms, selects, tables, dropdowns, alerts, badges, progress bars, navbar
- `.navbar-dark-blue` (#0a192f background)
- Calendar CSS Grid: `grid-template-columns: 80px repeat(6, 1fr)` + absolute overlay items
- `fadeInUp` animation with staggered delays on cards
- Feature card hover lift (`translateY(-5px)`)
- Navbar active link underline via `::after`

### Per-page CSS (minor, 2–16 lines each)
- `index.css` — hero gradient, illustration sizing
- `tugas.css` — progress ring, priority borders, task done strikethrough
- `jadwal.css` — summary card hover
- `nilai.css` — stat cards, grade preview, IPK bars
- `profile.css` — `.extra-small` (0.7rem), schedule items, task upcoming, password bars

---

## 10. Fitur Unggulan per Controller

### authController.js
- Register: validasi field, cek duplikat email, bcrypt hash (10 rounds), return JWT
- Login: validasi, query user, bcrypt compare, return JWT
- Profile: get/update name+email+nim+prodi, re-sign JWT after update
- Password: verify old password, hash new (min 6 chars)
- Upload foto: Multer middleware (max 2MB, format jpg/png/gif/webp)

### taskController.js
- CRUD lengkap + toggle done + toggle submit
- Validasi priority enum
- Submit otomatis set is_done = 1

### jadwalController.js
- CRUD lengkap
- **Deteksi bentrok**: query existing schedules on same day, check time overlap (`jam_mulai < :selesai AND jam_selesai > :mulai`)
- Return 409 jika bentrok dengan detail konflik

### nilaiController.js
- CRUD lengkap
- Validasi nilai_angka 0–100
- Konversi nilai di frontend (JS), bobot disimpan di DB

---

## 11. Screenshot & Aset

```
img/
├── Gambar Edu.jpg       # Ilustrasi hero (AI-generated, 16:9)
├── Home.png             # Screenshot landing page
├── Task Manager.png     # Screenshot task manager
├── Features.png         # Screenshot features section
├── About.png            # Screenshot about section
└── Contact.png          # Screenshot contact form
```

---

## 12. Cara Instalasi & Menjalankan

1. Clone repo: `git clone https://github.com/marioobe/edutrackV2.git`
2. `npm install` — install semua dependencies backend
3. Import `database/edutrack_db.sql` ke MySQL (via phpMyAdmin atau CLI)
4. Buat `.env` (lihat template di README)
5. `npm start` → backend API di `http://localhost:3000`
6. Letakkan proyek di `C:\xampp\htdocs\PengembanganWEB\edutrack1\`
7. Akses via `http://localhost/PengembanganWEB/edutrack1/`
8. Login dengan test user: `testuser@test.com / test123`
9. Login admin: `admin@test.com / admin123`
10. Pastikan Apache + MySQL aktif di XAMPP

### .env template
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=edutrack1_db
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_this
```

---

## 13. Testing

- **API Testing**: 30+ endpoint diuji (register, login, CRUD tasks/matkul/jadwal/nilai, contact, newsletter, profile, password, upload foto)
- **Frontend Testing**: 16 skenario (navbar auth state, form submit, redirect, CRUD, filter, auth protection, expired token)
- Detail: `docs/testing-checklist.md`

---

## 14. Riwayat Commit Terakhir

| Commit | Pesan | File |
|---|---|---|
| `1fe4391` | fix: remove non-existent Login.png from README screenshots | README.md |
| `2f9fc6e` | chore: remove unused files (agent.md, old images, log files) | 3 file dihapus |
| `09db4b2` | feat: profile charts + compact layout + hero illustration | 10 file (254+ lines) |
| (next) | feat: admin panel + role-based access | 12+ file (new: adminMiddleware.js, adminController.js, adminRoutes.js + edits) |
