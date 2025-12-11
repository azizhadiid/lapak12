# 🚀 LAPAK12: Marketplace Komunitas RT 12 Kemajuan

Sistem Informasi Marketplace Komunitas **Lapak12** dirancang untuk memberdayakan UMKM warga RT 12 Kemajuan, Desa Mendalo Indah, melalui digitalisasi pemasaran dan peningkatan literasi digital masyarakat.

---

## 📅 Informasi Proyek

| Kategori | Detail |
| :--- | :--- |
| **Mata Kuliah** | Manajemen Perubahan Sistem Informasi (MPPSI) |
| **Dosen Pengampu** | Miranty Yudistira, S.SI., M.Kom. dan Dedy Setiawan, S.Kom., M.IT. |
| **Institusi** | Fakultas Sains dan Teknologi, Universitas Jambi |
| **Tahun** | 2025 |

---

## 🎯 Tujuan & Latar Belakang

### Latar Belakang Singkat
Proyek ini dibuat untuk mengatasi keterbatasan pemasaran tradisional dan rendahnya tingkat kepercayaan dalam transaksi digital di lingkungan RT 12 Kemajuan. Meskipun memiliki banyak potensi UMKM, warga belum memiliki wadah digital yang efektif untuk memasarkan produk atau jasa secara lebih luas.

### Tujuan Utama Proyek
Tujuan pengembangan Sistem Informasi Marketplace **Lapak12** mencakup:

* Menyediakan wadah digital bagi warga RT 12 untuk memasarkan produk dan jasa secara lebih luas, terstruktur, dan efisien.
* Meningkatkan aksesibilitas dan jangkauan pasar bagi pelaku UMKM lokal.
* Membangun kepercayaan antarwarga dalam transaksi *online* melalui sistem verifikasi, transparansi, dan pengawasan.
* Mendorong literasi digital dengan menyediakan platform yang sederhana dan mudah digunakan.

---

## 🛠️ Technology Stack & Metodologi

### Metode Pengembangan Sistem
Proyek ini menggunakan **Model Waterfall**, yang terdiri dari tahapan analisis kebutuhan, perancangan, implementasi, pengujian, dan pemeliharaan.

### Stack Teknis

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React.js (Next.js) | Membangun UI berbasis komponen. |
| **Backend Logic** | TypeScript | Mengelola logika bisnis dan komunikasi data. |
| **Database** | Supabase PostgreSQL | Menyimpan seluruh data secara *online*. |
| **Styling** | Tailwind CSS & Shadcn/ui | Desain modern dan responsif. |

### Arsitektur Data (Gambaran ERD)
Beberapa relasi kunci dalam sistem:

1. **Users** terhubung dengan **Profile Pembeli/Penjual** (1-to-1).
2. **Produk** terhubung dengan **Profile Penjual**.
3. **Keranjang** terhubung dengan **Users** dan **Produk**.
4. **Penjualan** mencatat transaksi dan pengurangan stok produk.

---

## 🌟 Fitur Kunci Aplikasi

### Fitur Utama Pengguna
* **Registrasi & Login** untuk semua pengguna.
* **Katalog Produk:** Pembeli dapat melihat daftar produk serta melakukan pencarian dan filter.
* **Pemesanan via WhatsApp:** Checkout cepat langsung melalui WA.
* **Manajemen Keranjang:** Menambah item, mengurangi jumlah, dan menghapus produk.
* **Ulasan Produk:** Pembeli dapat memberi rating dan review.
* **Manajemen Produk:** Penjual dapat menambah, mengedit, dan menghapus produk (foto, harga, stok).
* **Pencatatan Penjualan:** Otomatis mengurangi stok.

### Fitur Admin
* **Verifikasi Pengguna:** Menyetujui atau menandai status baik/buruk untuk Penjual dan Pembeli.
* **Dashboard Pengawasan:** Menampilkan statistik aktivitas transaksi, produk aktif, dan perkembangan marketplace.

---

## 👥 Tim Pengembang

| Nama | NIM | Peran |
| :--- | :--- | :--- |
| **Aziz Alhadiid** | F1E123024 | Project Manager & Fullstack Developer |
| **Daffa Dzulfaqor Dhiya Ulhaq** | F1E123023 | UI/UX Designer |
| **Irfan Aziz** | F1E123022 | Front-End Developer |

---

## 📌 Catatan
Repository ini dibuat untuk keperluan mata kuliah MPPSI dan sebagai prototipe digitalisasi UMKM komunitas RT 12 Kemajuan.

