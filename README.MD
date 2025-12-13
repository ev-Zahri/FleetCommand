# Judul Proyek: FleetCommand (Sistem Manajemen Logistik & Pelacakan Real-time)

## 1. Deskripsi Proyek (Project Description)
**FleetCommand** adalah sistem manajemen armada (Fleet Management System) *end-to-end* yang memungkinkan perusahaan logistik untuk memantau lokasi kurir secara *real-time*, mengelola pengiriman barang, dan melakukan optimasi rute.

Berbeda dengan aplikasi CRUD biasa, proyek ini memanfaatkan kemampuan **PostgreSQL PostGIS** untuk pengolahan data spasial yang kompleks (seperti Geofencing dan pencarian kurir terdekat) serta **WebSockets** untuk visualisasi pergerakan armada secara langsung di peta tanpa *refresh*.

---

## 2. Tech Stack & Tools

### Backend (Lightweight Performance)
*   **Fastify (TypeScript):** Framework backend yang fokus pada kecepatan rendah *overhead*.
*   **PostgreSQL + PostGIS:** Database utama dengan kemampuan spasial.
*   **Kysely atau Drizzle ORM:** Cocok untuk fastify karena performanya lebih cepat daripada TypeORM/Prisma.
*   **Redis:** Untuk caching lokasi *real-time*.
*   **Fastify-WebSocket / ws:** Untuk menangani koneksi live tracking driver.
*   **Zod:** Untuk validasi data.
---

### Frontend (The Face)
*   **Next.js (App Router + TypeScript):** Server-side rendering untuk dashboard performa tinggi.
*   **Mapbox GL JS / Leaflet / React-Map-GL:** Library untuk merender peta interaktif.
*   **Tailwind CSS + ShadcnUI:** Untuk antarmuka dashboard yang bersih dan modern.
*   **Zustand / TanStack Query:** State management.

### DevOps / Others
*   **Docker:** Untuk menyalakan container PostgreSQL yang sudah terinstall PostGIS (image: `postgis/postgis`).

---

## 3. Fitur Makro & Mikro (Macro & Micro Features)

### A. Live Tracking Dashboard (Fitur Utama)
*   **Makro:** Admin dapat melihat peta besar yang menampilkan semua kurir yang sedang aktif bergerak.
*   **Mikro:**
    *   **WebSocket Stream:** Menerima koordinat (lat, long) dari driver app (bisa disimulasikan via script) dan menggerakkan marker di peta secara halus (*smooth animation*).
    *   **Driver Status:** Warna marker berbeda berdasarkan status (Hijau = Available, Merah = Busy/On Delivery, Abu = Offline).

### B. Geofencing & Alerting (Fitur "Wow")
*   **Makro:** Sistem mendeteksi otomatis jika kurir masuk atau keluar dari zona tertentu (misal: Gudang Jakarta Selatan).
*   **Mikro:**
    *   **Polygon Editor:** Admin bisa menggambar area (poligon) di peta untuk menentukan "Zona Pengiriman".
    *   **Spatial Intersection Query:** Backend mengecek secara berkala (atau via trigger): `ST_Contains(zone_polygon, driver_point)`.
    *   **Notification:** Kirim alert jika kurir keluar jalur atau memasuki area tujuan.

### C. Smart Order Assignment (Algoritma)
*   **Makro:** Ketika ada order baru masuk, sistem menyarankan driver mana yang paling cocok mengambil order tersebut.
*   **Mikro:**
    *   **k-NN Search (k-Nearest Neighbors):** Query PostGIS untuk mencari 5 driver terdekat dari titik jemput (`ORDER BY driver_loc <-> pickup_loc`).
    *   **Radius Filter:** Hanya cari driver dalam radius 5KM.

### D. Route Optimization & History
*   **Makro:** Menampilkan rute yang harus dilewati dan menyimpan riwayat perjalanan.
*   **Mikro:**
    *   **Path Visualization:** Menggambar garis rute (polyline) di peta dari titik A ke B.
    *   **Trajectory History:** Menyimpan log perjalanan kurir ke database dan bisa diputar ulang (*playback*) untuk audit.

---