## 1. Visual Philosophy: "The Confident Canvas"

Habit Shaper mengadopsi bahasa desain *Apple-inspired minimalism*. UI tidak mengandalkan warna-warni cerah, bayangan (shadow) tebal, atau kotak-kotak kartu (cards) yang mengotori layar. Aplikasi ini menggunakan ruang kosong (*whitespace*), garis pemisah setipis rambut (*hairlines*), dan tipografi berani untuk membedakan informasi.

### 1.1 Design Tokens (Tailwind CSS Base)
*   **Color Palette:** Monokromatik ketat.
    *   Background utama: `bg-zinc-50` (abu-abu hampir putih, memberikan kesan kanvas).
    *   Teks utama: `text-zinc-900` (hitam pekat).
    *   Teks sekunder/Label: `text-zinc-500` (abu-abu netral).
    *   Aksi utama (Fill): `bg-black` untuk sukses (Build), `bg-zinc-700` untuk *relapse* (Quit).
*   **Typography System:** *System Font Stack* (SF Pro di ekosistem Apple, Inter sebagai *fallback* di sistem lain).
    *   **Hero Headers:** `font-bold tracking-tight` (Jarak huruf dirapatkan untuk kesan premium).
    *   **Micro Labels:** `text-xs font-semibold uppercase tracking-widest` (Teks kapital berjarak lebar untuk struktur).
    *   **Metrics & Numbers:** `tabular-nums` wajib digunakan pada angka streak dan kalender agar lebar UI tidak bergeser saat angka berubah atau beranimasi.

---

## 2. Page Specifications

### 2.1 Authentication (`/login` & `/register`)
*   **Layout:** Satu kolom di tengah layar (`max-w-md`), rata kiri (*left-aligned*). Tidak ada kotak pembatas. Form mengambang langsung di atas kanvas `bg-zinc-50`.
*   **Typography Hero:** Teks raksasa di bagian atas ("Welcome back." atau "Start shaping.") menggantikan logo aplikasi.
*   **Form Inputs:** Bergaya *Underline*. Tidak ada *border* atas/kiri/kanan. Latar belakang transparan dengan garis bawah `border-zinc-200`. Saat fokus, garis bawah berubah menjadi hitam pekat secara halus. Teks input berukuran besar (`text-lg`).
*   **Primary Action:** Tombol hitam solid, lebar penuh (`w-full`), dengan lengkungan sedang (`rounded-xl`). Saat *loading*, teks berubah menjadi "Authenticating..." dengan *opacity* tombol menurun ke 70% (tanpa *spinner* berputar).
*   **Motion:** Pergantian dari mode Login ke Register memicu animasi GSAP; form memudar dan meluncur vertikal (*y-axis slide*) dalam 0.3 detik tanpa memuat ulang halaman.

### 2.2 Main Dashboard: "The Today Feed" (`/`)
Halaman ini adalah satu aliran vertikal tanpa sistem *tab* navigasi yang rumit. 

*   **Header Section:** Menampilkan tanggal hari ini secara lokal dengan teks besar (misal: **Kamis, 3 September**) sebagai jangkar konteks.
*   **Habit List (Section 1):**
    *   Setiap habit dipisahkan oleh garis bawah sangat tipis (`border-b border-zinc-100`).
    *   **Kiri (Informasi):** Nama habit yang tegas, dipadukan dengan angka streak dan 7 titik kecil (indikator hari Senin-Minggu).
    *   **Kanan (Aksi):** Lingkaran interaktif berukuran `w-10 h-10`. 
        *   **Build Habit:** Lingkaran kosong. Jika ditekan, terisi hitam dengan ikon centang tipis.
        *   **Quit Habit:** Lingkaran kosong dengan titik di tengah. Jika ditekan (*relapse*), terisi abu-abu gelap dengan ikon 'X' tipis.
*   **Active Goals (Section 2):**
    *   Dipisahkan dengan jarak yang lega dari *habit list*.
    *   Baris progres menggunakan garis yang sangat tipis (`h-1 rounded-full`). *Track* latar berwarna `bg-zinc-100`, diisi oleh progres berwarna hitam pekat. Rasio hari diletakkan di kanan atas baris (misal: "12 / 30").
*   **Archived Habits (Section 3):**
    *   Tersembunyi di balik teks *accordion* di bagian paling bawah. Habit yang diarsipkan tampil dengan teks pudar (`opacity-50`) dan **tanpa lingkaran aksi**.

### 2.3 Creation & Edit Modals (Slide-overs)
Tidak ada URL baru untuk pembuatan entri; UI tetap mempertahankan konteks "Hari Ini".

*   **Layout:** *Bottom Sheet* untuk mobile (muncul dari bawah) dan *Side Drawer* untuk desktop (muncul dari samping), dilatarbelakangi efek *blur* tipis pada *dashboard*.
*   **Create Habit - Segmented Control:** Dua tombol berbentuk pil besar (Build / Quit) saling menempel di atas form. Pilihan aktif berwarna hitam, non-aktif berwarna abu-abu terang.
*   **Create Habit - Input Name:** Teks input raksasa tanpa batas kotak (`text-3xl`), dengan *placeholder* abu-abu terang ("e.g., Baca buku 15 menit..."). Kursor langsung aktif saat modal terbuka.
*   **Create Goal - Mad-libs Format:** Alih-alih form standar, input dirangkai seperti kalimat: *"Saya ingin menjaga habit [Dropdown Habit] selama [Input Angka 30] hari berturut-turut."*
*   **Edit Mode:** Diakses dengan menekan lama (*long press*) nama habit. Berisi opsi ubah nama dan tombol bahaya di bawah: "Archive Habit".

---

## 3. Micro-Interactions (GSAP)
Animasi digunakan secara fungsional untuk memberikan umpan balik taktil, bukan sekadar dekorasi.
*   **The Action Circle:** Saat lingkaran habit ditekan, tombol membesar 5% (*scale: 1.05*) dan kembali normal dalam 0.2 detik (efek menekan tombol fisik). Warna hitam melebar dari tengah (*fill expansion*).
*   **Streak Bounce:** Saat *streak* bertambah, angka akan memantul tipis ke bawah lalu kembali ke posisinya (*y-axis dip*), memberikan kepuasan visual pada progres.
*   **Progress Line Fill:** Bar hitam pada area Goals memanjang ke kanan dengan transisi *ease-out* saat halaman dimuat pertama kali, menarik perhatian pada progres kumulatif.