import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const isProduction = process.env.NODE_ENV === 'production';

let prisma: PrismaClient;

if (isProduction) {
  // Production: Use Turso
  const databaseUrl = process.env.TURSO_DATABASE_URL?.trim().replace(/=/g, '');
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim().replace(/=/g, '');

  if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL environment variable is required in production');
  }

  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is required in production');
  }

  console.log('🔌 Connecting to Turso database:', databaseUrl.substring(0, 30) + '...');

  const adapter = new PrismaLibSQL({
    url: databaseUrl,
    authToken: authToken,
  });

  prisma = new PrismaClient({ adapter });
} else {
  // Development: Use local SQLite
  console.log('🔌 Connecting to local SQLite database (development mode)');
  prisma = new PrismaClient();
}

export { prisma };

// Handle graceful shutdown
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
