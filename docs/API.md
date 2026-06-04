# EduTrack API Documentation

**Base URL:** `http://localhost:3000/api`

**Auth Header:** `Authorization: Bearer <jwt_token>`

---

## Auth — `/api/auth`

### POST /api/auth/register
Daftar akun baru.
```json
// Request
{ "name": "Budi", "email": "budi@mail.com", "password": "123456" }
// Response 201
{ "message": "User registered successfully.", "token": "...", "user": { "id": 1, "name": "Budi", "email": "budi@mail.com" } }
```

### POST /api/auth/login
Login dan dapatkan JWT token.
```json
// Request
{ "email": "budi@mail.com", "password": "123456" }
// Response 200
{ "message": "Login successful.", "token": "...", "user": { "id": 1, "name": "Budi", "email": "budi@mail.com" } }
```

### GET /api/auth/profile 🔐
Ambil data profil user.
```json
// Response 200
{ "id": 1, "name": "Budi", "email": "budi@mail.com", "nim": "12345", "prodi": "TI", "created_at": "2026-01-01T00:00:00.000Z" }
```

### PUT /api/auth/profile 🔐
Update profil (nama, email, nim, prodi). Email yang sudah dipakai akan ditolak.
```json
// Request
{ "name": "Budi Update", "nim": "54321", "prodi": "Sistem Informasi" }
// Response 200
{ "message": "Profile updated.", "token": "...", "user": { ... } }
```

### PUT /api/auth/password 🔐
Ganti password.
```json
// Request
{ "oldPassword": "123456", "newPassword": "654321" }
// Response 200
{ "message": "Password changed successfully." }
```

---

## Tasks — `/api/tasks` 🔐

### GET /api/tasks
Ambil semua tasks milik user.

### POST /api/tasks
```json
// Request
{ "title": "Belajar Matematika", "mata_kuliah": "Matematika", "priority": "tinggi", "deadline": "2026-06-15" }
// Response 201
{ "id": 1, "user_id": 1, "title": "Belajar Matematika", "priority": "tinggi", "deadline": "2026-06-15", "mata_kuliah": "Matematika", "is_done": 0, "created_at": "..." }
```

### PUT /api/tasks/:id 🔐
Edit task. Priority: `tinggi`, `sedang`, `rendah`.

### DELETE /api/tasks/:id 🔐

### PATCH /api/tasks/:id/toggle 🔐
Toggle is_done.

---

## Mata Kuliah — `/api/matkul` 🔐

### GET /api/matkul
### POST /api/matkul
```json
// Request
{ "nama": "Matematika" }
```
### DELETE /api/matkul/:id

---

## Jadwal — `/api/jadwal` 🔐

### GET /api/jadwal
### POST /api/jadwal
```json
// Request
{ "mata_kuliah": "Matematika", "jenis": "kuliah", "hari": "senin", "jam_mulai": "08:00", "jam_selesai": "09:40", "ruang": "R101" }
```
Conflict detection otomatis — bentrok jadwal akan ditolak.
### PUT /api/jadwal/:id
### DELETE /api/jadwal/:id

---

## Nilai — `/api/nilai` 🔐

### GET /api/nilai
### POST /api/nilai
```json
// Request
{ "mata_kuliah": "Matematika", "semester": 1, "sks": 3, "nilai_angka": 85 }
```
### PUT /api/nilai/:id
### DELETE /api/nilai/:id

---

## Contact — `/api/contact`

### POST /api/contact
```json
// Request
{ "name": "Budi", "email": "budi@mail.com", "message": "Halo EduTrack!" }
```

---

## Newsletter — `/api/newsletter`

### POST /api/newsletter/subscribe
```json
// Request
{ "email": "budi@mail.com" }
```
