import { Client } from '@libsql/client';
import { Migration } from './runner';

export const migration: Migration = {
  id: '004',
  name: 'add_child_archive_fields',

  async up(client: Client): Promise<void> {
    // Check if columns already exist
    const tableInfo = await client.execute("PRAGMA table_info(children)");
    const columns = tableInfo.rows.map(row => row.name as string);

    // Add isArchived column if it doesn't exist
    if (!columns.includes('isArchived')) {
      await client.execute(`
        ALTER TABLE children ADD COLUMN isArchived INTEGER DEFAULT 0 NOT NULL
      `);
    }

    // Add archivedAt column if it doesn't exist
    if (!columns.includes('archivedAt')) {
      await client.execute(`
        ALTER TABLE children ADD COLUMN archivedAt TEXT
      `);
    }

    // Clean up any bad data (non-ISO format dates) - reset to NULL
    // This handles cases where a Unix timestamp was incorrectly stored
    await client.execute(`
      UPDATE children
      SET archivedAt = NULL
      WHERE archivedAt IS NOT NULL
        AND archivedAt NOT LIKE '____-__-__T%'
    `);

    // Create indexes for archive filtering
    await client.execute('CREATE INDEX IF NOT EXISTS idx_children_isArchived ON children(isArchived)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_children_isArchived_isSponsored ON children(isArchived, isSponsored)');
  },

  async down(client: Client): Promise<void> {
    // Drop indexes first
    await client.execute('DROP INDEX IF EXISTS idx_children_isArchived');
    await client.execute('DROP INDEX IF EXISTS idx_children_isArchived_isSponsored');

    // Note: SQLite doesn't support DROP COLUMN in older versions
    // For full rollback, would need to recreate table without these columns
    // This is a simplified rollback that just drops indexes
    console.log('Warning: SQLite does not support DROP COLUMN. Columns isArchived and archivedAt remain but indexes are removed.');
  },
};
