import { Migration, runMigrations, rollbackMigration, getMigrationStatus } from './runner';

// Import all migrations
import { migration as m001 } from './001_add_users_table';
import { migration as m002 } from './002_remove_volunteers_table';
import { migration as m003 } from './003_seed_schools';

// Register all migrations in order
export const migrations: Migration[] = [
  m001,
  m002,
  m003,
];

// Run all pending migrations
export async function migrate(): Promise<void> {
  console.log('🚀 Starting database migrations...\n');

  try {
    const { applied, skipped } = await runMigrations(migrations);

    console.log('\n📊 Migration Summary:');
    console.log(`   Applied: ${applied.length}`);
    console.log(`   Skipped: ${skipped.length}`);
    console.log(`   Total:   ${migrations.length}\n`);

    if (applied.length > 0) {
      console.log('✅ Migrations completed successfully!\n');
    } else {
      console.log('✅ Database is up to date!\n');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Rollback a specific migration
export async function rollback(migrationId: string): Promise<void> {
  console.log(`🔄 Rolling back migration ${migrationId}...\n`);
  await rollbackMigration(migrations, migrationId);
}

// Show migration status
export async function status(): Promise<void> {
  console.log('📋 Migration Status:\n');

  const { applied, pending } = await getMigrationStatus(migrations);

  console.log('Applied migrations:');
  if (applied.length === 0) {
    console.log('   (none)');
  } else {
    for (const id of applied) {
      const migration = migrations.find(m => m.id === id);
      console.log(`   ✅ ${id}: ${migration?.name || 'unknown'}`);
    }
  }

  console.log('\nPending migrations:');
  if (pending.length === 0) {
    console.log('   (none)');
  } else {
    for (const id of pending) {
      const migration = migrations.find(m => m.id === id);
      console.log(`   ⏳ ${id}: ${migration?.name || 'unknown'}`);
    }
  }

  console.log('');
}

// Re-export for direct usage
export { runMigrations, rollbackMigration, getMigrationStatus } from './runner';
