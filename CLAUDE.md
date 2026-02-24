# sponsorship-app — Claude Instructions

## Project Overview
Full-stack sponsorship management application.

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4 + React Query + React Router v7 + Lucide icons
- **Backend**: Express + TypeScript + Prisma 6 + SQLite (libsql) + Passport-local + express-session + bcrypt
- **Deployment**: Railway

## Repository Structure
```
sponsorship-app/
├── frontend/          # React/Vite SPA
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── utils/
│       └── App.tsx
├── backend/           # Express API
│   └── src/
│       ├── config/
│       ├── lib/
│       ├── middleware/
│       ├── migrations/
│       ├── routes/
│       └── scripts/
│   └── prisma/
│       └── schema.prisma
└── database-backups/  # SQLite backup files
```

## Dev Commands
```bash
# Run both frontend and backend in dev mode
npm run dev

# Frontend only (port 5173)
npm run dev:frontend

# Backend only
npm run dev:backend

# Database
cd backend && npm run db:studio      # Prisma Studio
cd backend && npm run db:push        # Push schema changes
cd backend && npm run db:seed        # Seed database
```

## Key Conventions
- Use TypeScript strictly — no `any` unless unavoidable
- Backend routes live in `backend/src/routes/`
- Prisma schema is `backend/prisma/schema.prisma`
- Frontend API calls go through `axios` — check `frontend/src/utils/` for existing helpers
- Auth is session-based (Passport-local + express-session), not JWT
- TailwindCSS 4 is used — check `frontend/tailwind.config.js` for config
- **DB migrations run automatically on application startup** — no need to run them manually in dev
- **Migration scripts must always handle existing data safely**: when adding columns or tables, migrations must also migrate any existing data so a live production system can upgrade without data loss or corruption

## Environment
- Backend reads from `.env` (use `dotenv`) — never commit `.env` files
- DB file: `backend/prisma/dev.db` (SQLite via libsql)
- Production DB is on Railway (set `DATABASE_URL` env var)
