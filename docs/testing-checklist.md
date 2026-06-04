# EduTrack Testing Checklist

## Prerequisites
- [x] XAMPP running (Apache + MySQL)
- [x] Database `edutrack1_db` created (run `database/edutrack_db.sql`)
- [x] Backend running: `cd backend && npm install && npm start`

---

## Authentication

| Test | Expected | Status |
|------|----------|--------|
| Register with valid data | 201 + token returned | ✅ |
| Register with existing email | 409 "Email already registered" | ✅ |
| Register with empty fields | 400 validation | ✅ |
| Login with correct credentials | 200 + token | ✅ |
| Login with wrong password | 401 "Invalid email or password" | ✅ |
| Login with unregistered email | 401 "Invalid email or password" | ✅ |
| GET /profile with valid token | 200 + user data | ✅ |
| GET /profile without token | 401 | ✅ |
| PUT /profile (update name, nim, prodi) | 200 + new token | ✅ |
| PUT /password (correct old) | 200 | ✅ |
| PUT /password (wrong old) | 401 | ✅ |

## Tasks

| Test | Expected | Status |
|------|----------|--------|
| GET /tasks with valid token | 200 + array | ✅ |
| POST /tasks with title only | 201 created | ✅ |
| POST /tasks without title | 400 | ✅ |
| POST /tasks with invalid priority | 400 | ✅ |
| PUT /tasks/:id (update) | 200 updated | ✅ |
| PUT /tasks/:id (not found) | 404 | ✅ |
| DELETE /tasks/:id | 200 deleted | ✅ |
| PATCH /tasks/:id/toggle | 200 toggled | ✅ |
| Access without token | 401 | ✅ |

## Mata Kuliah

| Test | Expected | Status |
|------|----------|--------|
| GET /matkul | 200 + array | ✅ |
| POST /matkul | 201 created | ✅ |
| POST /matkul without nama | 400 | ✅ |
| DELETE /matkul/:id | 200 | ✅ |
| DELETE /matkul/:id (wrong user) | 404 | ✅ |

## Jadwal

| Test | Expected | Status |
|------|----------|--------|
| GET /jadwal | 200 + array (sorted) | ✅ |
| POST /jadwal (valid) | 201 created | ✅ |
| POST /jadwal (bentrok) | 409 conflict detected | ✅ |
| PUT /jadwal/:id | 200 | ✅ |
| DELETE /jadwal/:id | 200 | ✅ |

## Nilai

| Test | Expected | Status |
|------|----------|--------|
| GET /nilai | 200 + array | ✅ |
| POST /nilai (valid) | 201 | ✅ |
| POST /nilai (nilai_angka > 100) | 400 | ✅ |
| PUT /nilai/:id | 200 | ✅ |
| DELETE /nilai/:id | 200 | ✅ |

## Public Endpoints

| Test | Expected | Status |
|------|----------|--------|
| POST /api/contact (valid) | 201 | ✅ |
| POST /api/contact (missing fields) | 400 | ✅ |
| POST /api/newsletter/subscribe | 201 | ✅ |
| POST /api/newsletter/subscribe (duplicate) | 409 | ✅ |

## Frontend Pages

| Page | Test | Status |
|------|------|--------|
| index.html | Navbar switches to logged-in state when token present | ⬜ |
| index.html | Newsletter form submits correctly | ⬜ |
| index.html | Contact form submits correctly | ⬜ |
| index.html | "Buka Task Manager" redirects to login if no token | ⬜ |
| login.html | ?expired=1 shows expired banner | ⬜ |
| login.html | ?next=taskmanager.html redirects correctly | ⬜ |
| login.html | Successful login stores token + userName | ⬜ |
| register.html | Password mismatch shows error | ⬜ |
| register.html | Successful register redirects to login | ⬜ |
| tugas.html | Loads tasks, CRUD works, filters work | ⬜ |
| jadwal.html | Calendar grid shows, CRUD works | ⬜ |
| nilai.html | Grades load, IPK calculated, CRUD works | ⬜ |
| profile.html | Profile loads, edit works, password change works | ⬜ |
| taskmanager.html | Stats load correctly | ⬜ |
| All protected pages | Redirect to login if no token | ⬜ |
| All protected pages | Redirect to login?expired=1 if token expired | ⬜ |
