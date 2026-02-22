# Gemini CLI Project Context: Ruang KelasInovatif

## 🚀 Project Overview
**KelasInovatif (v3.0)** is a modern e-learning platform built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. It provides a "Deep Green" UI aesthetic with glassmorphism effects and features localized authentication, user profiles, and course management (Ebooks and Videos).

### Core Technologies
- **Frontend**: Next.js 15 (App Router, Turbopack), React 19, Framer Motion, Radix UI.
- **Backend**: Next.js Server Actions with `next-safe-action` and `Zod`.
- **Database**: Prisma ORM with MySQL.
- **Session Management**: `iron-session` and `cookies-next`.
- **Styling**: Tailwind CSS with `tailwindcss-animate`.
- **Utilities**: `nanoid`, `xlsx` (Excel exports), `bcrypt-ts`, `resend` (Emails).
- **Runtime/Package Manager**: Bun.

---

## 🛠 Building and Running

### Prerequisites
- [Bun](https://bun.sh/) installed.
- MySQL database instance.

### Commands
| Task | Command |
| :--- | :--- |
| **Install Dependencies** | `bun install` |
| **Development Server** | `bun dev` |
| **Build Production** | `bun run build` |
| **Start Production** | `bun start` |
| **Prisma Generate** | `bun prisma generate` |
| **Database Migration** | `bun prisma migrate dev` |
| **Linting** | `bun run lint` |
| **PM2 Process Mgmt** | `bun pm2:start`, `bun pm2:logs`, etc. |

---

## 🏗 Architecture & Conventions

### Directory Structure Highlights
- `src/app`: Next.js App Router pages and layouts.
- `src/actions`: Global server actions (e.g., `auth-actions.ts`).
- `src/lib`: Shared utilities (`prisma.ts`, `sessions.ts`, `safe-action.ts`).
- `prisma/`: Database schema and migrations.
- `components/ui`: Shadcn-like Radix UI base components.
- `src/app/dashboard`: Protected routes (Middleware handled).

### Server Actions
- Use `actionClient` from `@/lib/safe-action` for consistent error handling and validation.
- All server actions should have a defined Zod schema.
- Revalidate paths using `revalidatePath` after mutations.

### Authentication & Authorization
- **Session**: Managed via `iron-session` (see `src/lib/sessions.ts`).
- **Middleware**: Protects `/dashboard` and sub-paths.
- **Admin Roles**: Hardcoded to specific emails (`khotiachmad@gmail.com`, `zazakihra@gmail.com`) in `src/app/auth/login/login-actions.ts`.
- **Admin Routes**:
  - `/dashboard/courses`
  - `/dashboard/detailcourse`
  - `/dashboard/user`

### Data Fetching & CRUD
- Prefer Server Actions for both read and write operations within the dashboard.
- Pagination is standard for admin tables (see `course-actions.ts`).
- Soft-delete or constraint-checking is practiced (e.g., cannot delete courses with active users or lessons).

### UI/UX Standards
- **Theme**: "Deep Green" theme with `next-themes`.
- **Animations**: `framer-motion` for transitions and interactive elements.
- **Toasts**: `sonner` for status notifications.
- **Icons**: `lucide-react` and `@phosphor-icons/react`.

---

## 🔑 Key Files for Quick Reference
- `prisma/schema.prisma`: Source of truth for data models.
- `src/middleware.ts`: Routing protection logic.
- `src/lib/sessions.ts`: Session configuration and types.
- `src/app/auth/login/login-actions.ts`: Admin credentials and login logic.
- `package.json`: Dependency and script manifest.
