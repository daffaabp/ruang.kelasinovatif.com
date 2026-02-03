# PM2 Setup Guide

Dokumentasi untuk menjalankan aplikasi menggunakan PM2 dengan Bun runtime.

## Prerequisites

- PM2 terinstall secara global: `npm install -g pm2` atau `bun add -g pm2`
- Bun terinstall dan tersedia di PATH
- Aplikasi sudah di-build: `bun run build`

## Konfigurasi

File `ecosystem.config.cjs` sudah dikonfigurasi dengan:
- **Nama instance:** `ruang.kelasinovatif.com`
- **Runtime:** Bun
- **Auto restart:** Enabled
- **Memory limit:** 1GB (auto restart jika melebihi)
- **Logs:** Disimpan di folder `./logs/`

## Setup Awal

### 1. Build Aplikasi

```bash
# Install dependencies
bun install

# Build aplikasi
bun run build
```

### 2. Buat Folder Logs

```bash
mkdir -p logs
```

### 3. Start dengan PM2

```bash
# Start aplikasi
bun run pm2:start
# atau
pm2 start ecosystem.config.cjs
```

### 4. Setup PM2 untuk Auto Start saat Boot

```bash
# Generate startup script
pm2 startup

# Save current PM2 process list
pm2 save
```

## Commands

### Start/Stop/Restart

```bash
# Start
bun run pm2:start
# atau
pm2 start ecosystem.config.cjs

# Stop
bun run pm2:stop
# atau
pm2 stop ruang.kelasinovatif.com

# Restart
bun run pm2:restart
# atau
pm2 restart ruang.kelasinovatif.com

# Delete (hapus dari PM2)
bun run pm2:delete
# atau
pm2 delete ruang.kelasinovatif.com
```

### Monitoring

```bash
# Lihat status
pm2 status

# Lihat logs
bun run pm2:logs
# atau
pm2 logs ruang.kelasinovatif.com

# Monitor real-time
bun run pm2:monit
# atau
pm2 monit

# Lihat info detail
pm2 show ruang.kelasinovatif.com
```

### Logs

```bash
# Lihat semua logs
pm2 logs

# Lihat logs untuk instance tertentu
pm2 logs ruang.kelasinovatif.com

# Lihat hanya error logs
pm2 logs ruang.kelasinovatif.com --err

# Lihat hanya output logs
pm2 logs ruang.kelasinovatif.com --out

# Flush logs
pm2 flush
```

## Update Aplikasi

### Cara Update dengan PM2

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies (jika ada perubahan)
bun install

# 3. Generate Prisma Client (jika ada perubahan schema)
bunx prisma generate

# 4. Build aplikasi
bun run build

# 5. Restart PM2
bun run pm2:restart
# atau
pm2 restart ruang.kelasinovatif.com
```

## Troubleshooting

### Database Access Denied Error

**Error:** `User 'ruang-kelas-inovatif-admin' was denied access on the database 'database-ruang-kelas-inovatif'`

**Solusi:**

1. **Login ke MySQL sebagai root:**
   ```bash
   mysql -u root -p
   ```

2. **Jalankan perintah berikut di MySQL:**
   ```sql
   -- Berikan akses ke database
   GRANT ALL PRIVILEGES ON `database-ruang-kelas-inovatif`.* TO 'ruang-kelas-inovatif-admin'@'localhost';
   GRANT ALL PRIVILEGES ON `database-ruang-kelas-inovatif`.* TO 'ruang-kelas-inovatif-admin'@'%';
   
   -- Refresh privileges
   FLUSH PRIVILEGES;
   
   -- Verifikasi
   SHOW GRANTS FOR 'ruang-kelas-inovatif-admin'@'localhost';
   ```

3. **Atau gunakan script yang sudah disediakan:**
   ```bash
   mysql -u root -p < fix-database-access.sql
   ```

4. **Pastikan DATABASE_URL di .env sudah benar:**
   ```env
   DATABASE_URL="mysql://ruang-kelas-inovatif-admin:password@localhost:3306/database-ruang-kelas-inovatif?schema=public"
   ```

5. **Restart PM2 setelah perubahan:**
   ```bash
   bun run pm2:restart
   ```

### Aplikasi Tidak Start

1. **Cek logs:**
   ```bash
   pm2 logs ruang.kelasinovatif.com --err
   ```

2. **Cek apakah build sudah dilakukan:**
   ```bash
   ls -la .next
   ```

3. **Cek apakah port sudah digunakan:**
   ```bash
   lsof -i :3000
   ```

4. **Cek environment variables:**
   ```bash
   pm2 show ruang.kelasinovatif.com
   ```

### Aplikasi Restart Terus Menerus

1. **Cek memory usage:**
   ```bash
   pm2 monit
   ```

2. **Cek error logs:**
   ```bash
   pm2 logs ruang.kelasinovatif.com --err
   ```

3. **Cek max_memory_restart di ecosystem.config.cjs**

### PM2 Tidak Menggunakan Bun

1. **Cek apakah Bun terinstall:**
   ```bash
   which bun
   bun --version
   ```

2. **Cek PATH di PM2:**
   ```bash
   pm2 show ruang.kelasinovatif.com
   ```

3. **Gunakan full path ke Bun jika perlu:**
   Edit `ecosystem.config.cjs` dan ganti `script: "bun"` dengan full path:
   ```javascript
   script: "/usr/local/bin/bun", // atau path Bun Anda
   ```

## Environment Variables

Environment variables dapat di-set di:
1. File `.env` (akan dibaca oleh Next.js)
2. Di `ecosystem.config.cjs` di bagian `env`
3. Menggunakan PM2 env:
   ```bash
   pm2 set ruang.kelasinovatif.com NODE_ENV production
   ```

## Notes

- PM2 akan auto restart aplikasi jika crash
- Logs disimpan di folder `./logs/`
- Memory limit: 1GB (akan restart jika melebihi)
- Min uptime: 10 detik (jika restart lebih cepat dari ini, PM2 akan stop)
- Max restarts: 10 kali dalam waktu singkat
- Restart delay: 4 detik

