# Restaurant Management System (RMS) - Biko Intelligence

A premium, full-stack restaurant management system built with a monorepo architecture for scalability and high performance.

## 🚀 Overview

This system consists of several integrated applications:
- **API (NestJS)**: Centralized backend handling logic, database, and real-time sockets.
- **POS (Next.js)**: A glassmorphic, high-conversion point-of-sale interface for staff.
- **Admin Console (Next.js)**: Management suite for analytics, products, and table management.
- **Web App (Next.js)**: Customer-facing mobile-optimized ordering system.
- **KDS (Next.js)**: Kitchen Display System for order management.

## 🛠 Tech Stack

- **Monorepo Management**: [TurboRepo](https://turbo.build/)
- **Frontend**: [Next.js 14](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- Docker (optional, for Postgres/Redis)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Resturent POS"
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in `packages/database` and `apps/api` (refer to `.env.example`).

4. **Database Setup**
   If using Docker:
   ```bash
   docker-compose up -d
   ```
   Generate Prisma client and migrate:
   ```bash
   pnpm run db:generate
   ```

5. **Run Development Mode**
   ```bash
   pnpm run dev
   ```

## 🌐 Application Ports

- **API**: [http://localhost:3001](http://localhost:3001)
- **POS**: [http://localhost:3002](http://localhost:3002)
- **Customer Web**: [http://localhost:3003](http://localhost:3003)
- **Admin**: [http://localhost:3004](http://localhost:3004)

## 📄 License
Private / Proprietary - Soheily Creations
