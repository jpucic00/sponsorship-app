import { createClient, Client } from '@libsql/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface Migration {
  id: string;
  name: string;
  up: (client: Client) => Promise<void>;
  down: (client: Client) => Promise<void>;
}

const isProduction = process.env.NODE_ENV === 'production';

// Create database client based on environment
function getClient(): Client {
  if (isProduction) {
    // Production: Use Turso
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in production');
    }

    console.log('🔌 Migrations connecting to Turso...');
    return createClient({ url, authToken });
  } else {
    // Development: Use local SQLite
    const dbPath = path.join(__dirname, '../../prisma/dev.db');
    console.log('🔌 Migrations connecting to local SQLite:', dbPath);
    return createClient({ url: `file:${dbPath}` });
  }
}

// Ensure migrations tracking table exists
async function ensureMigrationsTable(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

// Get list of applied migrations
async function getAppliedMigrations(client: Client): Promise<string[]> {
  const result = await client.execute('SELECT id FROM _migrations ORDER BY applied_at');
  return result.rows.map(row => row.id as string);
}

// Record a migration as applied
async function recordMigration(client: Client, migration: Migration): Promise<void> {
  await client.execute({
    sql: 'INSERT INTO _migrations (id, name) VALUES (?, ?)',
    args: [migration.id, migration.name],
  });
}

// Remove a migration record (for rollback)
async function removeMigrationRecord(client: Client, migrationId: string): Promise<void> {
  await client.execute({
    sql: 'DELETE FROM _migrations WHERE id = ?',
    args: [migrationId],
  });
}

// Run all pending migrations
export async function runMigrations(migrations: Migration[]): Promise<{ applied: string[]; skipped: string[] }> {
  const client = getClient();
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    await ensureMigrationsTable(client);
    const appliedIds = await getAppliedMigrations(client);

    // Sort migrations by ID to ensure order
    const sortedMigrations = [...migrations].sort((a, b) => a.id.localeCompare(b.id));

    for (const migration of sortedMigrations) {
      if (appliedIds.includes(migration.id)) {
        skipped.push(migration.id);
        console.log(`⏭️  Skipping ${migration.id}: ${migration.name} (already applied)`);
        continue;
      }

      console.log(`🔄 Running ${migration.id}: ${migration.name}...`);

      try {
        await migration.up(client);
        await recordMigration(client, migration);
        applied.push(migration.id);
        console.log(`✅ Applied ${migration.id}: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Failed ${migration.id}: ${migration.name}`);
        throw error;
      }
    }

    return { applied, skipped };
  } finally {
    client.close();
  }
}

// Rollback a specific migration
export async function rollbackMigration(migrations: Migration[], migrationId: string): Promise<void> {
  const client = getClient();

  try {
    await ensureMigrationsTable(client);
    const appliedIds = await getAppliedMigrations(client);

    if (!appliedIds.includes(migrationId)) {
      console.log(`⚠️  Migration ${migrationId} has not been applied`);
      return;
    }

    const migration = migrations.find(m => m.id === migrationId);
    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    console.log(`🔄 Rolling back ${migration.id}: ${migration.name}...`);
    await migration.down(client);
    await removeMigrationRecord(client, migrationId);
    console.log(`✅ Rolled back ${migration.id}: ${migration.name}`);
  } finally {
    client.close();
  }
}

// Get migration status
export async function getMigrationStatus(migrations: Migration[]): Promise<{
  applied: string[];
  pending: string[];
}> {
  const client = getClient();

  try {
    await ensureMigrationsTable(client);
    const appliedIds = await getAppliedMigrations(client);
    const allIds = migrations.map(m => m.id);
    const pending = allIds.filter(id => !appliedIds.includes(id));

    return { applied: appliedIds, pending };
  } finally {
    client.close();
  }
}
