# Product Requirements Document (PRD)
## Aplikasi Manajemen Stok Warung

| Field | Detail |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Status** | Draft — Menunggu Validasi |
| **Tanggal** | 08 Agustus 2026 |
| **Penulis** | — |
| **Tipe Proyek** | Portfolio Project (Solo Developer) |

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan kebutuhan produk untuk sebuah aplikasi manajemen stok sederhana yang ditujukan bagi warung/toko kelontong skala kecil-menengah. Tujuan proyek bersifat ganda: (1) menyelesaikan masalah operasional nyata seputar pencatatan stok manual yang rawan human error, dan (2) berfungsi sebagai portfolio piece yang mendemonstrasikan kemampuan system design, data integrity handling, dan production-readiness thinking bagi target audiens klien freelance B2B SEA/Indonesia.

Dokumen ini **tidak membahas** implementasi teknis (stack, skema database, arsitektur) — itu adalah cakupan dokumen turunan (Technical Design Document) yang dibuat setelah PRD ini divalidasi.

---

## 2. Latar Belakang & Problem Statement

### 2.1 Masalah yang Diselesaikan
- Warung kecil-menengah umumnya mencatat stok secara manual (buku tulis) atau tidak sama sekali, sehingga rawan terjadi **selisih antara stok fisik dan catatan**
- Pemilik warung sering tidak menyadari stok menipis hingga barang benar-benar habis, menyebabkan **lost sales**
- Tidak ada visibilitas terhadap barang mana yang paling laku vs. barang yang menumpuk (dead stock)
- Solusi stok yang tersedia di pasar (mis. software kasir enterprise) umumnya **overbuilt dan mahal** untuk skala warung kecil

### 2.2 Kondisi Saat Ini (As-Is)
- Pencatatan manual di buku, atau aplikasi kasir umum yang fitur stoknya sekadar tambahan, bukan fokus utama
- Tidak ada audit trail — jika terjadi selisih stok, sulit ditelusuri penyebabnya (human error saat input, pencurian, atau kesalahan hitung)

---

## 3. Tujuan Proyek

### 3.1 Tujuan Bisnis (Product Goals)
- Menyediakan pencatatan stok masuk/keluar yang akurat dan real-time
- Memberikan visibilitas stok minimum agar pemilik warung bisa restock tepat waktu
- Menyediakan mekanisme koreksi stok (opname) yang terdokumentasi, bukan sekadar overwrite angka

### 3.2 Tujuan Portfolio (Engineering Goals)
- Mendemonstrasikan penanganan **data integrity** pada sistem yang melibatkan concurrent write (event-sourced stock ledger, bukan mutable counter)
- Mendemonstrasikan **disiplin dokumentasi engineering** (PRD → Technical Design → ADR) sebagai sinyal maturity, bukan sekadar kode jadi
- Menjadi contoh konkret yang relevan untuk niche target klien: UMKM/SEA business tooling

**Catatan:** Kedua kategori tujuan ini perlu tetap dipisahkan secara sadar. Jika keduanya bercampur tanpa batas jelas, risiko terbesar adalah scope creep — menambah kompleksitas teknis demi "terlihat impresif" padahal tidak dibutuhkan oleh use case warung yang sebenarnya sederhana.

---

## 4. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Pemilik Warung (Primary)** | Mengelola stok, melihat laporan, menentukan restock | Kesederhanaan input, alert stok rendah, laporan ringkas |
| **Kasir/Karyawan (Secondary — v2)** | Mencatat transaksi keluar harian | Input cepat, minim langkah, tanpa akses ubah harga |

**Asumsi tingkat literasi digital:** Pengguna primer diasumsikan terbiasa menggunakan smartphone dan aplikasi chat (WhatsApp), tetapi **tidak** terbiasa dengan software bisnis kompleks. Ini berimplikasi langsung pada requirement UX di bagian non-fungsional.

---

## 5. Ruang Lingkup

### 5.1 Dalam Cakupan (In Scope) — v1
- Manajemen data produk (CRUD)
- Pencatatan stok masuk (restock)
- Pencatatan stok keluar (penjualan/pengeluaran)
- Stock opname (penyesuaian manual dengan alasan wajib diisi)
- Notifikasi/indikator visual stok di bawah ambang minimum
- Laporan ringkas: stok saat ini, riwayat pergerakan per produk

### 5.2 Di Luar Cakupan (Out of Scope) — v1
- Multi-user dengan role granular (kasir vs. owner)
- Integrasi pembayaran/kasir (POS)
- Multi-cabang/multi-tenant
- Aplikasi mobile native (v1 berbasis web responsif)
- Integrasi supplier otomatis (purchase order ke supplier)

**Catatan eksplisit:** Item di luar cakupan bukan berarti tidak penting — ini adalah keputusan sadar untuk menjaga v1 tetap achievable oleh solo developer paruh waktu. Item-item ini menjadi kandidat roadmap v2, dan sebaiknya dicatat di sini justru agar tidak "menyelinap masuk" ke scope v1 secara tidak sengaja.

---

## 6. Kebutuhan Fungsional

Ditulis dalam format user story agar traceable ke kebutuhan pengguna, bukan sekadar daftar fitur teknis.

| ID | User Story | Prioritas |
|---|---|---|
| FR-01 | Sebagai pemilik warung, saya ingin menambah/mengubah data produk (nama, satuan, harga, stok minimum) agar katalog stok saya akurat | Wajib |
| FR-02 | Sebagai pemilik warung, saya ingin mencatat barang masuk dari supplier agar stok bertambah sesuai kenyataan | Wajib |
| FR-03 | Sebagai pemilik warung, saya ingin mencatat barang keluar (terjual) agar stok berkurang sesuai kenyataan | Wajib |
| FR-04 | Sebagai pemilik warung, saya ingin melakukan penyesuaian stok manual dengan mencantumkan alasan, agar selisih stok fisik vs. sistem bisa dikoreksi dan tetap tercatat | Wajib |
| FR-05 | Sebagai pemilik warung, saya ingin melihat daftar produk yang stoknya di bawah ambang minimum agar saya bisa restock tepat waktu | Wajib |
| FR-06 | Sebagai pemilik warung, saya ingin melihat riwayat pergerakan stok per produk agar saya bisa menelusuri penyebab selisih | Penting |
| FR-07 | Sebagai pemilik warung, saya ingin melihat ringkasan barang terlaris/menumpuk dalam periode tertentu agar saya bisa mengambil keputusan restock/promosi | Opsional |

---

## 7. Kebutuhan Non-Fungsional

| Kategori | Requirement | Justifikasi |
|---|---|---|
| **Usability** | Input transaksi maksimal 3 langkah/tap | Target pengguna bukan power user software bisnis |
| **Data Integrity** | Setiap perubahan stok harus tercatat sebagai event, tidak overwrite langsung | Mendukung audit trail dan menghindari race condition saat input bersamaan |
| **Performance** | Waktu respons input transaksi < 1 detik pada koneksi 3G | Warung sering berada di area dengan konektivitas terbatas |
| **Availability** | Aplikasi tetap bisa diakses meski terjadi downtime singkat pada layanan pihak ketiga (jika ada) | Operasional warung tidak boleh terganggu oleh downtime eksternal |
| **Portabilitas Data** | Data bisa diekspor (CSV) sewaktu-waktu | Mitigasi risiko vendor lock-in bagi pengguna akhir |

---

## 8. Metrik Keberhasilan

- **Metrik Produk:** Selisih antara stok sistem dan stok opname aktual berkurang signifikan dibanding pencatatan manual (diukur secara kualitatif melalui simulasi/pilot)
- **Metrik Portfolio:** Dokumen (PRD, Technical Design, ADR) dan kode dapat menjelaskan *reasoning* di balik setiap keputusan arsitektural saat ditinjau pihak ketiga (klien/perekrut)

---

## 9. Asumsi & Batasan

- Diasumsikan single-tenant (satu warung per instance) untuk v1 — multi-tenant didorong ke roadmap v2
- Diasumsikan tidak ada kebutuhan kepatuhan regulasi khusus (mis. sertifikasi keamanan data) mengingat skala UMKM
- Batasan waktu pengembangan: proyek dikerjakan paruh waktu, sehingga scope v1 harus tetap minimal viable

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope creep menambah fitur "menarik secara teknis" tapi tidak dibutuhkan warung | Timeline molor, portfolio piece tidak pernah selesai | Tinjau ulang setiap fitur baru terhadap Section 5.2 (Out of Scope) sebelum dikerjakan |
| Kompleksitas concurrent write pada stock ledger diremehkan | Bug data integrity yang sulit dilacak di kemudian hari | Dijadikan bagian eksplisit dari Technical Design Document, bukan diselesaikan secara ad-hoc saat coding |
| Tidak ada pengguna nyata untuk validasi asumsi UX | Fitur dibangun berdasarkan asumsi yang keliru | Pertimbangkan simulasi dengan 1–2 calon pengguna warung nyata sebelum finalisasi v1 |

---

## 11. Dokumen Turunan (Next Steps)

Setelah PRD ini divalidasi, dokumen berikutnya dalam urutan yang benar adalah:

1. **Technical Design Document** — pilihan stack, skema database (event-sourced stock ledger), arsitektur deployment
2. **Architecture Decision Records (ADR)** — mendokumentasikan trade-off signifikan (mis. kenapa event-sourced ledger dipilih alih-alih mutable stock counter)
3. **UI/UX Wireframe** — alur input transaksi yang sesuai requirement usability di Section 7
