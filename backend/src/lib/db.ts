import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// Create adapter once
const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL?.trim().replace(/=/g, '') as string,
  authToken: process.env.TURSO_AUTH_TOKEN?.trim().replace(/=/g, '') as string,
});

// Create Prisma client once
export const prisma = new PrismaClient({ adapter });

// Optional: Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});