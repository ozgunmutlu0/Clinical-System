# Clinical Appointment System

**Proje bağlantıları**

- Jira: https://abdullahcari.atlassian.net/jira/software/projects/CP4242/boards/2?jql=assignee%20%3D%20empty
- Microsoft Teams: https://teams.live.com/l/invite/FAABpLcYActxANkJQI

Full-stack bir klinik randevu sistemi monorepo'su. Yapı, verdiğin teknik gereksinimlere göre `Next.js + Spring Boot + PostgreSQL + Docker + Nginx + Prometheus/Grafana` ekseninde kuruldu ve Canva referansındaki mint/teal, cam efekti ve hero odaklı dil temel alınarak tasarlandı.

## En Hızlı Çalıştırma

Bu makinede doğrudan gösterebileceğin en güvenli sürüm:

- `frontend/index.html`

Bu dosyayı tarayıcıda açtığında:

- Home page
- Patient dashboard
- Doctor dashboard
- Admin panel

tek başına çalışır. Bu preview sürümü `frontend/preview.js` üzerinden localStorage ile etkileşimli çalışır ve Node, Java, Docker gerektirmez.

## Monorepo Yapısı

- `frontend/`: React + Next.js arayüzü
- `frontend/index.html`: tarayıcıdan direkt açılan statik preview
- `frontend/preview.css`: statik preview stilleri
- `frontend/preview.js`: statik preview etkileşim mantığı
- `backend/`: Java Spring Boot REST API
- `infra/postgres/init/`: PostgreSQL şema ve seed dosyaları
- `nginx/`: reverse proxy konfigürasyonu
- `prometheus/`: monitoring scrape ayarları
- `.github/workflows/ci.yml`: CI pipeline

## Frontend Rotaları

- `/`: Home page, hero section, CTA ve sistem overview
- `/patient`: patient dashboard, login/register, booking, cancellation, history
- `/doctor`: doctor dashboard, daily/weekly schedule, status update
- `/admin`: admin panel, doctor management, slot generation, appointment filtering

## Frontend Özellikleri

- Responsive hero section ve CTA
- Mint / teal / soft green renk teması
- Glassmorphism kartlar ve yuvarlatılmış köşeler
- Form validation ve kullanıcı mesajları
- Table, modal, calendar widget, inline status editor
- Keyboard-focus stilleri ve erişilebilir dialog/table yapısı
- `frontend/lib/api.js` ile gerçek backend entegrasyonuna hazır fetch helper'ları

## Backend Özellikleri

- JWT tabanlı authentication
- RBAC: `PATIENT`, `DOCTOR`, `ADMIN`
- BCrypt password hashing
- CSRF token repository
- Rate limiting filter
- Brute-force protection service
- Overlapping appointment engelleme
- Background tasks: slot generation ve cleanup
- Email/SMS notification stub servisi
- Spring Actuator ve Prometheus endpoint'i

## API Endpointleri

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Appointments

- `GET /api/appointments`
- `GET /api/appointments/search?q=...`
- `POST /api/appointments`
- `PUT /api/appointments/{appointmentId}/status`
- `PUT /api/appointments/{appointmentId}/cancel`

### Users

- `GET /api/users/me`
- `GET /api/users/patients`

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/{doctorId}`
- `GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD`

### Admin

- `POST /api/admin/doctors`
- `PUT /api/admin/doctors/{doctorId}`
- `PUT /api/admin/doctors/{doctorId}/activate`
- `PUT /api/admin/doctors/{doctorId}/deactivate`
- `POST /api/admin/slots/generate`

## Örnek Request Payload'ları

### Register

```json
{
  "name": "Ayse Yilmaz",
  "email": "ayse@example.com",
  "password": "StrongPass123!",
  "phone": "+905550000000"
}
```

### Login

```json
{
  "email": "patient@clinic.local",
  "password": "password"
}
```

### Create Appointment

```json
{
  "doctorId": 1,
  "date": "2026-05-12",
  "time": "10:00:00",
  "reason": "Routine consultation"
}
```

### Generate Slots

```json
{
  "doctorId": 1,
  "startDate": "2026-05-12",
  "endDate": "2026-06-12",
  "slotDurationMinutes": 30
}
```

## Veritabanı Şeması

### `users`

- `id`
- `name`
- `email`
- `password`
- `phone`
- `role`
- `enabled`
- `created_at`

### `doctors`

- `id`
- `user_id`
- `name`
- `specialty`
- `working_hours`
- `availability_rules`
- `active`

### `appointments`

- `id`
- `patient_id`
- `doctor_id`
- `date`
- `time`
- `status`
- `reason`
- `created_at`

### `availability_slots`

- `id`
- `doctor_id`
- `date`
- `time`
- `is_booked`

## İlişkiler

- Doctor → Appointments: one-to-many
- Patient → Appointments: one-to-many
- Doctor → Availability Slots: one-to-many
- User → Doctor: one-to-one optional link

## İndeksler ve Constraintler

- `users.email` unique index
- `appointments(doctor_id, date, time)` index
- `appointments(patient_id)` index
- `availability_slots(doctor_id, date, time)` unique constraint
- `doctors.specialty` index

## Local Çalıştırma

### Tarayıcıdan direkt preview

En hızlı yol:

1. `frontend/index.html` dosyasını aç
2. Route bar üzerinden `Home`, `Patient`, `Doctor`, `Admin` ekranları arasında geç
3. `Reset Demo` ile tüm preview verilerini başa al

Bu yol sunum için önerilen yoldur.

### Docker ile

```bash
docker compose up --build
```

Sonrasında:

- App: `http://localhost`
- Frontend direct: `http://localhost:3000`
- Backend direct: `http://localhost:8080`
- MailHog: `http://localhost:8025`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

### Seed Kullanıcıları

- Admin: `admin@clinic.local` / `password`
- Doctor: `doctor@clinic.local` / `password`
- Patient: `patient@clinic.local` / `password`

Not: Bu demo seed şifreleri sadece geliştirme içindir; üretimde değiştirilmelidir.

## Güvenlik Notları

- JWT access token üretimi `JwtService` üzerinden yapılır
- Password hash için BCrypt kullanılır
- `RateLimitingFilter` ile istek limiti uygulanır
- `BruteForceProtectionService` login başarısızlıklarını takip eder
- `SecurityConfig` içinde HSTS, CSRF ve SSL enforcement desteklenir
- Overlapping appointment engeli `AppointmentService` içinde uygulanır

## Monitoring

- Spring Actuator endpointleri açık
- Prometheus `/actuator/prometheus` scrape eder
- Grafana Prometheus datasource ile bağlanabilir

## CI/CD

GitHub Actions pipeline:

- Frontend build
- Backend test
- Docker compose build

## Dağıtım Notu

Nginx reverse proxy, frontend ve backend’i tek giriş noktası altında toplar. Bu yapı AWS, Render, Railway, DigitalOcean veya klasik VM dağıtımına kolayca taşınabilir. Heroku doğrudan Docker veya container registry akışıyla opsiyonel olarak kullanılabilir.

## Bu Ortamda Doğrulama Sınırı

Bu workspace içinde `java` ve `maven` kurulu olmadığı için backend derlemesi burada yerel olarak çalıştırılamadı. Frontend ve backend kaynak kodu, Docker build akışı ve proje yapısı hazırlandı; tam çalışma doğrulaması Docker veya uygun runtime bulunan makinede yapılmalıdır.

Ek olarak bu makinede `docker compose` ve `docker-compose` komutları da mevcut değildi. Bu yüzden full stack runtime doğrulaması burada yapılamadı; buna karşılık statik preview sürümü local gösterim için ayrıca hazırlandı.
