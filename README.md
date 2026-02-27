# Herafi

A full-stack service marketplace platform connecting clients with skilled service providers for both in-person and digital work.

## Overview

Herafi allows clients to browse, hire, and communicate with service providers across 13+ categories including Plumbing, Electrical, Cleaning, Carpentry, Digital Design, and more. Providers can create service listings with multiple pricing tiers, manage orders, and build their reputation through reviews.

## Features

- **Service Listings** — Providers create gigs with tiered pricing and portfolio images
- **Real-time Messaging** — Socket.IO-powered chat between clients and providers
- **Order Management** — State machine tracking orders from `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`
- **Reviews & Ratings** — 1–5 star ratings with written feedback
- **Authentication** — Email/password auth with JWT sessions via NextAuth.js
- **File Uploads** — Avatar, gig image gallery, and portfolio image uploads
- **Service Discovery** — Category browsing, full-text search, price and rating filters

## Tech Stack

**Frontend**
- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Socket.IO Client

**Backend**
- Node.js with Next.js Server Actions
- Socket.IO
- Prisma ORM + PostgreSQL
- NextAuth.js v5

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/melad365/herafi.git
cd herafi
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable       | Description                              |
|----------------|------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             |
| `AUTH_SECRET`  | Run `npx auth-secret` to generate        |
| `AUTH_URL`     | App URL (e.g. `http://localhost:3000`)   |

### Database Setup

```bash
npx prisma migrate dev
npm run db:seed   # Optional: seed with mock data
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start development server           |
| `npm run build` | Build for production               |
| `npm start`     | Run production server              |
| `npm run lint`  | Run ESLint                         |

## Project Structure

```
src/
├── app/          # Next.js App Router pages & API routes
├── actions/      # Server Actions (auth, gigs, orders, etc.)
├── components/   # Reusable React components
├── lib/          # Utilities, auth config, DB client, validations
├── hooks/        # Custom React hooks
└── server/       # Custom HTTP server with Socket.IO
prisma/
├── schema.prisma # Database schema
└── seed.ts       # Mock data seeder
```

## Service Categories

Plumbing · Painting · Cleaning · Carpentry · Welding · Electrical · HVAC · Landscaping · Moving · Car Washing · Digital Design · Digital Writing · Other
