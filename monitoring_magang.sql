-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 25, 2026 at 03:49 PM
-- Server version: 8.0.42
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `monitoring_magang`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `divisis`
--

CREATE TABLE `divisis` (
  `id_divisi` bigint UNSIGNED NOT NULL,
  `id_mentor` bigint UNSIGNED DEFAULT NULL,
  `nama_divisi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hari_liburs`
--

CREATE TABLE `hari_liburs` (
  `id_libur` bigint UNSIGNED NOT NULL,
  `tanggal` date NOT NULL,
  `keterangan` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jam_kerjas`
--

CREATE TABLE `jam_kerjas` (
  `id_jam_kerja` bigint UNSIGNED NOT NULL,
  `jam_masuk` time NOT NULL,
  `jam_pulang` time NOT NULL,
  `batas_terlambat` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_kuis`
--

CREATE TABLE `jawaban_kuis` (
  `id_jawaban` bigint UNSIGNED NOT NULL,
  `id_soal` bigint UNSIGNED NOT NULL,
  `id_user` bigint UNSIGNED NOT NULL,
  `id_kuis` bigint UNSIGNED NOT NULL,
  `jawaban` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skor` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kuis`
--

CREATE TABLE `kuis` (
  `id_kuis` bigint UNSIGNED NOT NULL,
  `judul_kuis` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laporan_akhirs`
--

CREATE TABLE `laporan_akhirs` (
  `id_laporan` bigint UNSIGNED NOT NULL,
  `id_peserta` bigint UNSIGNED NOT NULL,
  `file_laporan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_upload` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materi_mentors`
--

CREATE TABLE `materi_mentors` (
  `id_materi` bigint UNSIGNED NOT NULL,
  `id_mentor` bigint UNSIGNED NOT NULL,
  `id_divisi` bigint UNSIGNED DEFAULT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `file_materi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materi_pelatihans`
--

CREATE TABLE `materi_pelatihans` (
  `id_materi_pelatihan` bigint UNSIGNED NOT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `divisi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_materi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `views` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentors`
--

CREATE TABLE `mentors` (
  `id_mentor` bigint UNSIGNED NOT NULL,
  `id_user` bigint UNSIGNED NOT NULL,
  `id_divisi` bigint UNSIGNED DEFAULT NULL,
  `jabatan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_14_193536_create_divisis_table', 1),
(5, '2026_03_14_193734_create_mentors_table', 1),
(6, '2026_03_14_193858_create_sertifikats_table', 1),
(7, '2026_03_14_194016_create_nilai_pesertas_table', 1),
(8, '2026_03_14_194118_create_pesertas_table', 1),
(9, '2026_03_14_194230_add_foreign_keys_to_users_table', 1),
(10, '2026_04_06_091118_create_notifikasis_table', 1),
(11, '2026_04_06_103537_create_materi_pelatihans_table', 1),
(12, '2026_04_06_103644_create_kuis_table', 1),
(13, '2026_04_06_103718_create_soal_kuis_table', 1),
(14, '2026_04_06_103751_create_jawaban_kuis_table', 1),
(15, '2026_04_06_105900_create_presensis_table', 1),
(16, '2026_04_06_105928_create_hari_liburs_table', 1),
(17, '2026_04_06_105950_create_jam_kerjas_table', 1),
(18, '2026_04_06_110216_create_laporan_akhirs_table', 1),
(19, '2026_04_06_111626_create_materi_mentors_table', 1),
(20, '2026_04_06_111710_create_tugas_table', 1),
(21, '2026_04_06_111731_create_pengumpulan_tugas_table', 1),
(22, '2026_04_13_152417_create_personal_access_tokens_table', 1),
(23, '2026_04_15_113126_add_phone_to_users_table', 1),
(24, '2026_04_17_101405_add_foreign_key_to_divisis_table', 1),
(25, '2026_04_24_115301_add_columns_to_materi_pelatihans_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `nilai_pesertas`
--

CREATE TABLE `nilai_pesertas` (
  `id_nilai` bigint UNSIGNED NOT NULL,
  `id_peserta` bigint UNSIGNED NOT NULL,
  `nilai_kehadiran` decimal(5,2) NOT NULL DEFAULT '0.00',
  `nilai_tugas` decimal(5,2) NOT NULL DEFAULT '0.00',
  `nilai_kuis` decimal(5,2) NOT NULL DEFAULT '0.00',
  `nilai_mentor` decimal(5,2) NOT NULL DEFAULT '0.00',
  `nilai_akhir` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifikasis`
--

CREATE TABLE `notifikasis` (
  `id_notifikasi` bigint UNSIGNED NOT NULL,
  `id_user` bigint UNSIGNED NOT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pesan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_baca` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengumpulan_tugas`
--

CREATE TABLE `pengumpulan_tugas` (
  `id_pengumpulan` bigint UNSIGNED NOT NULL,
  `id_tugas` bigint UNSIGNED NOT NULL,
  `id_peserta` bigint UNSIGNED NOT NULL,
  `file_jawaban` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('dikumpulkan','dinilai','selesai','terlambat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dikumpulkan',
  `catatan_mentor` text COLLATE utf8mb4_unicode_ci,
  `tanggal_kumpul` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pesertas`
--

CREATE TABLE `pesertas` (
  `id_peserta` bigint UNSIGNED NOT NULL,
  `id_user` bigint UNSIGNED NOT NULL,
  `id_mentor` bigint UNSIGNED DEFAULT NULL,
  `id_sertifikat` bigint UNSIGNED DEFAULT NULL,
  `id_nilai` bigint UNSIGNED DEFAULT NULL,
  `id_divisi` bigint UNSIGNED DEFAULT NULL,
  `asal_kampus` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prodi` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `status_magang` enum('aktif','selesai','berhenti') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `presensis`
--

CREATE TABLE `presensis` (
  `id_presensi` bigint UNSIGNED NOT NULL,
  `id_peserta` bigint UNSIGNED NOT NULL,
  `tanggal` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `foto_checkin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lokasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_kehadiran` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hadir',
  `daily_report` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sertifikats`
--

CREATE TABLE `sertifikats` (
  `id_sertifikat` bigint UNSIGNED NOT NULL,
  `id_peserta` bigint UNSIGNED NOT NULL,
  `nomor_sertifikat` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_sertifikat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_terbit` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `soal_kuis`
--

CREATE TABLE `soal_kuis` (
  `id_soal` bigint UNSIGNED NOT NULL,
  `id_kuis` bigint UNSIGNED NOT NULL,
  `pertanyaan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `opsi_a` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opsi_b` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opsi_c` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opsi_d` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jawaban_benar` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tugas`
--

CREATE TABLE `tugas` (
  `id_tugas` bigint UNSIGNED NOT NULL,
  `id_mentor` bigint UNSIGNED NOT NULL,
  `id_divisi` bigint UNSIGNED DEFAULT NULL,
  `judul_tugas` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `deadline` datetime NOT NULL,
  `file_tugas` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` bigint UNSIGNED NOT NULL,
  `id_peserta` bigint UNSIGNED DEFAULT NULL,
  `id_mentor` bigint UNSIGNED DEFAULT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `no_telepon` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('coo','admin','mentor','peserta') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'peserta',
  `status_akun` enum('aktif','non_aktif') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `foto_profil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `divisis`
--
ALTER TABLE `divisis`
  ADD PRIMARY KEY (`id_divisi`),
  ADD KEY `divisis_id_mentor_index` (`id_mentor`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `hari_liburs`
--
ALTER TABLE `hari_liburs`
  ADD PRIMARY KEY (`id_libur`),
  ADD UNIQUE KEY `hari_liburs_tanggal_unique` (`tanggal`),
  ADD KEY `hari_liburs_tanggal_index` (`tanggal`);

--
-- Indexes for table `jam_kerjas`
--
ALTER TABLE `jam_kerjas`
  ADD PRIMARY KEY (`id_jam_kerja`),
  ADD KEY `jam_kerjas_jam_masuk_index` (`jam_masuk`),
  ADD KEY `jam_kerjas_jam_pulang_index` (`jam_pulang`);

--
-- Indexes for table `jawaban_kuis`
--
ALTER TABLE `jawaban_kuis`
  ADD PRIMARY KEY (`id_jawaban`),
  ADD UNIQUE KEY `unique_jawaban` (`id_soal`,`id_user`,`id_kuis`),
  ADD KEY `jawaban_kuis_id_soal_index` (`id_soal`),
  ADD KEY `jawaban_kuis_id_user_index` (`id_user`),
  ADD KEY `jawaban_kuis_id_kuis_index` (`id_kuis`),
  ADD KEY `jawaban_kuis_jawaban_index` (`jawaban`),
  ADD KEY `jawaban_kuis_skor_index` (`skor`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kuis`
--
ALTER TABLE `kuis`
  ADD PRIMARY KEY (`id_kuis`),
  ADD KEY `kuis_judul_kuis_index` (`judul_kuis`),
  ADD KEY `kuis_tanggal_mulai_index` (`tanggal_mulai`),
  ADD KEY `kuis_tanggal_selesai_index` (`tanggal_selesai`),
  ADD KEY `kuis_created_at_index` (`created_at`);

--
-- Indexes for table `laporan_akhirs`
--
ALTER TABLE `laporan_akhirs`
  ADD PRIMARY KEY (`id_laporan`),
  ADD UNIQUE KEY `laporan_akhirs_id_peserta_unique` (`id_peserta`),
  ADD KEY `laporan_akhirs_id_peserta_index` (`id_peserta`),
  ADD KEY `laporan_akhirs_tanggal_upload_index` (`tanggal_upload`);

--
-- Indexes for table `materi_mentors`
--
ALTER TABLE `materi_mentors`
  ADD PRIMARY KEY (`id_materi`),
  ADD KEY `materi_mentors_id_mentor_index` (`id_mentor`),
  ADD KEY `materi_mentors_id_divisi_index` (`id_divisi`),
  ADD KEY `materi_mentors_judul_index` (`judul`),
  ADD KEY `materi_mentors_created_at_index` (`created_at`);

--
-- Indexes for table `materi_pelatihans`
--
ALTER TABLE `materi_pelatihans`
  ADD PRIMARY KEY (`id_materi_pelatihan`),
  ADD KEY `materi_pelatihans_judul_index` (`judul`),
  ADD KEY `materi_pelatihans_created_at_index` (`created_at`);

--
-- Indexes for table `mentors`
--
ALTER TABLE `mentors`
  ADD PRIMARY KEY (`id_mentor`),
  ADD KEY `mentors_id_user_foreign` (`id_user`),
  ADD KEY `mentors_id_divisi_foreign` (`id_divisi`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nilai_pesertas`
--
ALTER TABLE `nilai_pesertas`
  ADD PRIMARY KEY (`id_nilai`),
  ADD KEY `nilai_pesertas_id_peserta_foreign` (`id_peserta`);

--
-- Indexes for table `notifikasis`
--
ALTER TABLE `notifikasis`
  ADD PRIMARY KEY (`id_notifikasi`),
  ADD KEY `notifikasis_id_user_index` (`id_user`),
  ADD KEY `notifikasis_status_baca_index` (`status_baca`),
  ADD KEY `notifikasis_created_at_index` (`created_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  ADD PRIMARY KEY (`id_pengumpulan`),
  ADD UNIQUE KEY `unique_pengumpulan` (`id_tugas`,`id_peserta`),
  ADD KEY `pengumpulan_tugas_id_tugas_index` (`id_tugas`),
  ADD KEY `pengumpulan_tugas_id_peserta_index` (`id_peserta`),
  ADD KEY `pengumpulan_tugas_status_index` (`status`),
  ADD KEY `pengumpulan_tugas_tanggal_kumpul_index` (`tanggal_kumpul`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `pesertas`
--
ALTER TABLE `pesertas`
  ADD PRIMARY KEY (`id_peserta`),
  ADD KEY `pesertas_id_user_foreign` (`id_user`),
  ADD KEY `pesertas_id_mentor_foreign` (`id_mentor`),
  ADD KEY `pesertas_id_divisi_foreign` (`id_divisi`),
  ADD KEY `pesertas_id_sertifikat_foreign` (`id_sertifikat`),
  ADD KEY `pesertas_id_nilai_foreign` (`id_nilai`);

--
-- Indexes for table `presensis`
--
ALTER TABLE `presensis`
  ADD PRIMARY KEY (`id_presensi`),
  ADD UNIQUE KEY `unique_presensi_harian` (`id_peserta`,`tanggal`),
  ADD KEY `presensis_id_peserta_index` (`id_peserta`),
  ADD KEY `presensis_tanggal_index` (`tanggal`),
  ADD KEY `presensis_status_kehadiran_index` (`status_kehadiran`);

--
-- Indexes for table `sertifikats`
--
ALTER TABLE `sertifikats`
  ADD PRIMARY KEY (`id_sertifikat`),
  ADD UNIQUE KEY `sertifikats_nomor_sertifikat_unique` (`nomor_sertifikat`),
  ADD KEY `sertifikats_id_peserta_foreign` (`id_peserta`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `soal_kuis`
--
ALTER TABLE `soal_kuis`
  ADD PRIMARY KEY (`id_soal`),
  ADD KEY `soal_kuis_id_kuis_index` (`id_kuis`),
  ADD KEY `soal_kuis_jawaban_benar_index` (`jawaban_benar`);

--
-- Indexes for table `tugas`
--
ALTER TABLE `tugas`
  ADD PRIMARY KEY (`id_tugas`),
  ADD KEY `tugas_id_mentor_index` (`id_mentor`),
  ADD KEY `tugas_id_divisi_index` (`id_divisi`),
  ADD KEY `tugas_judul_tugas_index` (`judul_tugas`),
  ADD KEY `tugas_deadline_index` (`deadline`),
  ADD KEY `tugas_created_at_index` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_id_peserta_index` (`id_peserta`),
  ADD KEY `users_id_mentor_index` (`id_mentor`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `divisis`
--
ALTER TABLE `divisis`
  MODIFY `id_divisi` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hari_liburs`
--
ALTER TABLE `hari_liburs`
  MODIFY `id_libur` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jam_kerjas`
--
ALTER TABLE `jam_kerjas`
  MODIFY `id_jam_kerja` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jawaban_kuis`
--
ALTER TABLE `jawaban_kuis`
  MODIFY `id_jawaban` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kuis`
--
ALTER TABLE `kuis`
  MODIFY `id_kuis` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laporan_akhirs`
--
ALTER TABLE `laporan_akhirs`
  MODIFY `id_laporan` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materi_mentors`
--
ALTER TABLE `materi_mentors`
  MODIFY `id_materi` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materi_pelatihans`
--
ALTER TABLE `materi_pelatihans`
  MODIFY `id_materi_pelatihan` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mentors`
--
ALTER TABLE `mentors`
  MODIFY `id_mentor` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `nilai_pesertas`
--
ALTER TABLE `nilai_pesertas`
  MODIFY `id_nilai` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifikasis`
--
ALTER TABLE `notifikasis`
  MODIFY `id_notifikasi` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  MODIFY `id_pengumpulan` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pesertas`
--
ALTER TABLE `pesertas`
  MODIFY `id_peserta` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `presensis`
--
ALTER TABLE `presensis`
  MODIFY `id_presensi` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sertifikats`
--
ALTER TABLE `sertifikats`
  MODIFY `id_sertifikat` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `soal_kuis`
--
ALTER TABLE `soal_kuis`
  MODIFY `id_soal` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tugas`
--
ALTER TABLE `tugas`
  MODIFY `id_tugas` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `divisis`
--
ALTER TABLE `divisis`
  ADD CONSTRAINT `divisis_id_mentor_foreign` FOREIGN KEY (`id_mentor`) REFERENCES `mentors` (`id_mentor`) ON DELETE SET NULL;

--
-- Constraints for table `jawaban_kuis`
--
ALTER TABLE `jawaban_kuis`
  ADD CONSTRAINT `jawaban_kuis_id_kuis_foreign` FOREIGN KEY (`id_kuis`) REFERENCES `kuis` (`id_kuis`) ON DELETE CASCADE,
  ADD CONSTRAINT `jawaban_kuis_id_soal_foreign` FOREIGN KEY (`id_soal`) REFERENCES `soal_kuis` (`id_soal`) ON DELETE CASCADE,
  ADD CONSTRAINT `jawaban_kuis_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `laporan_akhirs`
--
ALTER TABLE `laporan_akhirs`
  ADD CONSTRAINT `laporan_akhirs_id_peserta_foreign` FOREIGN KEY (`id_peserta`) REFERENCES `pesertas` (`id_peserta`) ON DELETE CASCADE;

--
-- Constraints for table `materi_mentors`
--
ALTER TABLE `materi_mentors`
  ADD CONSTRAINT `materi_mentors_id_divisi_foreign` FOREIGN KEY (`id_divisi`) REFERENCES `divisis` (`id_divisi`) ON DELETE SET NULL,
  ADD CONSTRAINT `materi_mentors_id_mentor_foreign` FOREIGN KEY (`id_mentor`) REFERENCES `mentors` (`id_mentor`) ON DELETE CASCADE;

--
-- Constraints for table `mentors`
--
ALTER TABLE `mentors`
  ADD CONSTRAINT `mentors_id_divisi_foreign` FOREIGN KEY (`id_divisi`) REFERENCES `divisis` (`id_divisi`) ON DELETE SET NULL,
  ADD CONSTRAINT `mentors_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `nilai_pesertas`
--
ALTER TABLE `nilai_pesertas`
  ADD CONSTRAINT `nilai_pesertas_id_peserta_foreign` FOREIGN KEY (`id_peserta`) REFERENCES `pesertas` (`id_peserta`) ON DELETE CASCADE;

--
-- Constraints for table `notifikasis`
--
ALTER TABLE `notifikasis`
  ADD CONSTRAINT `notifikasis_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  ADD CONSTRAINT `pengumpulan_tugas_id_peserta_foreign` FOREIGN KEY (`id_peserta`) REFERENCES `pesertas` (`id_peserta`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengumpulan_tugas_id_tugas_foreign` FOREIGN KEY (`id_tugas`) REFERENCES `tugas` (`id_tugas`) ON DELETE CASCADE;

--
-- Constraints for table `pesertas`
--
ALTER TABLE `pesertas`
  ADD CONSTRAINT `pesertas_id_divisi_foreign` FOREIGN KEY (`id_divisi`) REFERENCES `divisis` (`id_divisi`) ON DELETE SET NULL,
  ADD CONSTRAINT `pesertas_id_mentor_foreign` FOREIGN KEY (`id_mentor`) REFERENCES `mentors` (`id_mentor`) ON DELETE SET NULL,
  ADD CONSTRAINT `pesertas_id_nilai_foreign` FOREIGN KEY (`id_nilai`) REFERENCES `nilai_pesertas` (`id_nilai`) ON DELETE SET NULL,
  ADD CONSTRAINT `pesertas_id_sertifikat_foreign` FOREIGN KEY (`id_sertifikat`) REFERENCES `sertifikats` (`id_sertifikat`) ON DELETE SET NULL,
  ADD CONSTRAINT `pesertas_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `presensis`
--
ALTER TABLE `presensis`
  ADD CONSTRAINT `presensis_id_peserta_foreign` FOREIGN KEY (`id_peserta`) REFERENCES `pesertas` (`id_peserta`) ON DELETE CASCADE;

--
-- Constraints for table `sertifikats`
--
ALTER TABLE `sertifikats`
  ADD CONSTRAINT `sertifikats_id_peserta_foreign` FOREIGN KEY (`id_peserta`) REFERENCES `pesertas` (`id_peserta`) ON DELETE CASCADE;

--
-- Constraints for table `soal_kuis`
--
ALTER TABLE `soal_kuis`
  ADD CONSTRAINT `soal_kuis_id_kuis_foreign` FOREIGN KEY (`id_kuis`) REFERENCES `kuis` (`id_kuis`) ON DELETE CASCADE;

--
-- Constraints for table `tugas`
--
ALTER TABLE `tugas`
  ADD CONSTRAINT `tugas_id_divisi_foreign` FOREIGN KEY (`id_divisi`) REFERENCES `divisis` (`id_divisi`) ON DELETE SET NULL,
  ADD CONSTRAINT `tugas_id_mentor_foreign` FOREIGN KEY (`id_mentor`) REFERENCES `mentors` (`id_mentor`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_id_mentor_foreign` FOREIGN KEY (`id_mentor`) REFERENCES `mentors` (`id_mentor`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_id_peserta_foreign` FOREIGN KEY (`id_peserta`) REFERENCES `pesertas` (`id_peserta`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
