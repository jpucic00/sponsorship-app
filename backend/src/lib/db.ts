import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// Validate required environment variables
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim().replace(/=/g, '');
const authToken = process.env.TURSO_AUTH_TOKEN?.trim().replace(/=/g, '');

if (!databaseUrl) {
  throw new Error('TURSO_DATABASE_URL environment variable is required but not set');
}

if (!authToken) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is required but not set');
}

console.log('🔌 Connecting to Turso database:', databaseUrl.substring(0, 30) + '...');

// Create adapter once
const adapter = new PrismaLibSQL({
  url: databaseUrl,
  authToken: authToken,
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