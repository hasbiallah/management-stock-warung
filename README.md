# Manajemen Stok Warung

Aplikasi pencatatan stok untuk warung/toko kelontong skala kecil-menengah.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Language**: TypeScript
- **Architecture**: Clean Architecture

## Features

- ✅ First-run setup untuk pembuatan akun pemilik
- ✅ Authentication dengan NextAuth
- ✅ Manajemen katalog produk
- ✅ Event-sourced stock ledger (Stok Masuk, Keluar, Opname)
- ✅ Riwayat stok per produk
- ✅ Deteksi stok rendah
- ✅ Stok dihitung on-the-fly dari events

## Local Development

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm atau yarn

### Setup

1. Clone repository
   ```bash
   git clone <repo-url>
   cd management-stock-warung
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup environment variables
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dengan konfigurasi database Anda:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/management_stock_warung"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-long-random-secret"
   ```

4. Jalankan database migration
   ```bash
   npx prisma migrate dev
   ```

5. Start development server
   ```bash
   npm run dev
   ```

6. Buka browser di `http://localhost:3000`
   - Aplikasi akan redirect ke `/setup` untuk first-run setup
   - Buat akun pemilik warung
   - Login dan mulai gunakan aplikasi

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Push schema without migration (development only)
npx prisma db push
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── application/      # Use cases & business logic
├── domain/          # Domain entities & interfaces
└── infrastructure/  # Prisma repositories & external services

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations

docs/
└── adr/            # Architecture Decision Records
```

## Deployment

Lihat [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) untuk panduan lengkap deploy ke Vercel.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/management-stock-warung)

**Required Environment Variables:**
- `DATABASE_URL` - MySQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Random secret key

## Architecture

Aplikasi ini menggunakan **Clean Architecture** dengan pemisahan layer yang ketat:

- **Domain**: Entity dan business rules murni
- **Application**: Use cases dan orchestration
- **Infrastructure**: Implementasi teknis (database, auth)
- **Presentation**: UI dan API endpoints

Lihat `docs/adr/` untuk Architecture Decision Records lengkap.

## Key Design Decisions

- **Event-sourced stock ledger**: Stok tidak pernah di-update langsung, selalu lewat events
- **Single instance**: Aplikasi untuk satu warung, bukan multi-tenant
- **Opname absolute**: Stock opname menetapkan nilai absolute, bukan delta
- **First-run setup**: Satu akun owner, dibuat saat pertama kali app dijalankan
- **Stock calculated on-the-fly**: Stok dihitung real-time dari events, tidak disimpan

## License

Private/Proprietary
