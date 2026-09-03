## 1. Visual Philosophy: "The Confident Canvas"

Habit Shaper mengadopsi bahasa desain _Apple-inspired minimalism_. UI tidak mengandalkan warna-warni cerah, bayangan (shadow) tebal, atau kotak-kotak kartu (cards) yang mengotori layar. Aplikasi ini menggunakan ruang kosong (_whitespace_), garis pemisah setipis rambut (_hairlines_), dan tipografi berani untuk membedakan informasi.

### 1.1 Design Tokens (Native CSS Base)

- **Color Palette:** Monokromatik ketat melalui CSS custom properties.
  - Background utama: `--color-canvas` (abu-abu hampir putih, memberikan kesan kanvas).
  - Teks utama: `--color-ink` (hitam pekat).
  - Teks sekunder/Label: `--color-ink-secondary` (abu-abu netral).
  - Aksi utama: `--color-ink`. Biru hanya digunakan untuk focus ring aksesibel.
- **Typography System:** Newsreader yang dibundel secara lokal, dengan Georgia sebagai _fallback_. Gunakan bobot 400 untuk body, 500 untuk kontrol, dan 600 untuk heading serta emphasis.
  - **Hero Headers:** `font-bold tracking-tight` (Jarak huruf dirapatkan untuk kesan premium).
  - **Micro Labels:** `text-xs font-semibold uppercase tracking-widest` (Teks kapital berjarak lebar untuk struktur).
  - **Metrics & Numbers:** `tabular-nums` wajib digunakan pada angka streak dan kalender agar lebar UI tidak bergeser saat angka berubah atau beranimasi.

---

## 2. Page Specifications

### 2.1 Authentication (`/login` & `/register`)

- **Layout:** Satu kolom di tengah layar (`max-w-md`), rata kiri (_left-aligned_). Tidak ada kotak pembatas. Form mengambang langsung di atas kanvas `bg-zinc-50`.
- **Typography Hero:** Teks raksasa di bagian atas ("Welcome back." atau "Start shaping.") menggantikan logo aplikasi.
- **Form Inputs:** Bergaya _Underline_. Tidak ada _border_ atas/kiri/kanan. Latar belakang transparan dengan garis bawah `border-zinc-200`. Saat fokus, garis bawah berubah menjadi hitam pekat secara halus. Teks input berukuran besar (`text-lg`).
- **Primary Action:** Tombol hitam solid, lebar penuh (`w-full`), dengan lengkungan sedang (`rounded-xl`). Saat _loading_, teks berubah menjadi "Authenticating..." dengan _opacity_ tombol menurun ke 70% (tanpa _spinner_ berputar).
- **Motion:** Pergantian dari mode Login ke Register memicu animasi GSAP; form memudar dan meluncur vertikal (_y-axis slide_) dalam 0.3 detik tanpa memuat ulang halaman.

### 2.2 Main Dashboard: "The Today Feed" (`/`)

Halaman ini adalah satu aliran vertikal tanpa sistem _tab_ navigasi yang rumit.

- **Header Section:** Menampilkan tanggal hari ini secara lokal dengan teks besar (misal: **Kamis, 3 September**) sebagai jangkar konteks.
- **Habit List (Section 1):**
  - Setiap habit dipisahkan oleh garis bawah sangat tipis (`border-b border-zinc-100`).
  - **Kiri (Informasi):** Nama habit yang tegas, dipadukan dengan angka streak dan 7 titik kecil (indikator hari Senin-Minggu).
  - **Kanan (Aksi):** Lingkaran interaktif berukuran `w-10 h-10`.
    - **Build Habit:** Lingkaran kosong. Jika ditekan, terisi hitam dengan ikon centang tipis.
    - **Quit Habit:** Lingkaran kosong dengan titik di tengah. Jika ditekan (_relapse_), terisi abu-abu gelap dengan ikon 'X' tipis.
- **Active Goals (Section 2):**
  - Dipisahkan dengan jarak yang lega dari _habit list_.
  - Baris progres menggunakan garis yang sangat tipis (`h-1 rounded-full`). _Track_ latar berwarna `bg-zinc-100`, diisi oleh progres berwarna hitam pekat. Rasio hari diletakkan di kanan atas baris (misal: "12 / 30").
- **Archived Habits (Section 3):**
  - Tersembunyi di balik teks _accordion_ di bagian paling bawah. Habit yang diarsipkan tampil dengan teks pudar (`opacity-50`) dan **tanpa lingkaran aksi**.

### 2.3 Creation & Edit Modals (Slide-overs)

Tidak ada URL baru untuk pembuatan entri; UI tetap mempertahankan konteks "Hari Ini".

- **Layout:** _Bottom Sheet_ untuk mobile (muncul dari bawah) dan _Side Drawer_ untuk desktop (muncul dari samping), dilatarbelakangi efek _blur_ tipis pada _dashboard_.
- **Create Habit - Segmented Control:** Dua tombol berbentuk pil besar (Build / Quit) saling menempel di atas form. Pilihan aktif berwarna hitam, non-aktif berwarna abu-abu terang.
- **Create Habit - Input Name:** Teks input raksasa tanpa batas kotak (`text-3xl`), dengan _placeholder_ abu-abu terang ("e.g., Baca buku 15 menit..."). Kursor langsung aktif saat modal terbuka.
- **Create Goal - Mad-libs Format:** Alih-alih form standar, input dirangkai seperti kalimat: _"Saya ingin menjaga habit [Dropdown Habit] selama [Input Angka 30] hari berturut-turut."_
- **Edit Mode:** Diakses dengan menekan lama (_long press_) nama habit. Berisi opsi ubah nama dan tombol bahaya di bawah: "Archive Habit".

---

## 3. Micro-Interactions (Native CSS)

Animasi digunakan secara fungsional untuk memberikan umpan balik taktil, bukan sekadar dekorasi.
Implementasi menggunakan CSS transition dan menghormati `prefers-reduced-motion`; tidak memerlukan dependency animasi tambahan.

- **The Action Circle:** Saat lingkaran habit ditekan, tombol membesar 5% (_scale: 1.05_) dan kembali normal dalam 0.2 detik (efek menekan tombol fisik). Warna hitam melebar dari tengah (_fill expansion_).
- **Streak Bounce:** Saat _streak_ bertambah, angka akan memantul tipis ke bawah lalu kembali ke posisinya (_y-axis dip_), memberikan kepuasan visual pada progres.
- **Progress Line Fill:** Bar hitam pada area Goals memanjang ke kanan dengan transisi _ease-out_ saat halaman dimuat pertama kali, menarik perhatian pada progres kumulatif.
