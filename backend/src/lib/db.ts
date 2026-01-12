import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

let prismaInstance: PrismaClient | null = null;

function createPrismaClient() {
  // Debug: Log all environment variables that start with TURSO
  console.log('🔍 Debug - Environment variables:');
  console.log('TURSO_DATABASE_URL exists:', !!process.env.TURSO_DATABASE_URL);
  console.log('TURSO_AUTH_TOKEN exists:', !!process.env.TURSO_AUTH_TOKEN);
  console.log('All TURSO vars:', Object.keys(process.env).filter(k => k.includes('TURSO')));

  // Validate required environment variables
  const databaseUrl = process.env.TURSO_DATABASE_URL?.trim().replace(/=/g, '');
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim().replace(/=/g, '');

  if (!databaseUrl) {
    console.error('❌ TURSO_DATABASE_URL is missing or empty');
    console.error('Available env vars:', Object.keys(process.env).sort());
    throw new Error('TURSO_DATABASE_URL environment variable is required but not set');
  }

  if (!authToken) {
    console.error('❌ TURSO_AUTH_TOKEN is missing or empty');
    throw new Error('TURSO_AUTH_TOKEN environment variable is required but not set');
  }

  console.log('🔌 Connecting to Turso database:', databaseUrl.substring(0, 30) + '...');

  // Create adapter
  const adapter = new PrismaLibSQL({
    url: databaseUrl,
    authToken: authToken,
  });

  // Create Prisma client
  return new PrismaClient({ adapter });
}

// Lazy initialization: only create the client when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = createPrismaClient();
    }
    return (prismaInstance as any)[prop];
  }
});

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