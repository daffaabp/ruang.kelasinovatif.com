-- Script untuk memberikan akses database ke user MySQL
-- Jalankan script ini sebagai root atau user dengan privilege GRANT

-- 1. Pastikan database sudah dibuat (jika belum)
CREATE DATABASE IF NOT EXISTS `database-ruang-kelas-inovatif` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Berikan semua privileges ke user untuk database tersebut
GRANT ALL PRIVILEGES ON `database-ruang-kelas-inovatif`.* TO 'ruang-kelas-inovatif-admin'@'localhost';
GRANT ALL PRIVILEGES ON `database-ruang-kelas-inovatif`.* TO 'ruang-kelas-inovatif-admin'@'%';

-- 3. Jika user belum ada, buat user baru
-- CREATE USER IF NOT EXISTS 'ruang-kelas-inovatif-admin'@'localhost' IDENTIFIED BY 'your_password_here';
-- CREATE USER IF NOT EXISTS 'ruang-kelas-inovatif-admin'@'%' IDENTIFIED BY 'your_password_here';

-- 4. Refresh privileges
FLUSH PRIVILEGES;

-- 5. Verifikasi privileges
SHOW GRANTS FOR 'ruang-kelas-inovatif-admin'@'localhost';
SHOW GRANTS FOR 'ruang-kelas-inovatif-admin'@'%';


