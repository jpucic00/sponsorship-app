import { Client } from '@libsql/client';
import { Migration } from './runner';

export const migration: Migration = {
  id: '002',
  name: 'remove_volunteers_table',

  async up(client: Client): Promise<void> {
    // Drop indexes first
    await client.execute('DROP INDEX IF EXISTS idx_volunteers_isActive');
    await client.execute('DROP INDEX IF EXISTS idx_volunteers_role');
    await client.execute('DROP INDEX IF EXISTS idx_volunteers_lastName_firstName');
    await client.execute('DROP INDEX IF EXISTS idx_volunteers_createdAt');
    await client.execute('DROP INDEX IF EXISTS idx_volunteers_role_isActive');

    // Drop the volunteers table
    await client.execute('DROP TABLE IF EXISTS volunteers');
  },

  async down(client: Client): Promise<void> {
    // Recreate the volunteers table if rollback is needed
    await client.execute(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'volunteer',
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Recreate indexes
    await client.execute('CREATE INDEX idx_volunteers_isActive ON volunteers(isActive)');
    await client.execute('CREATE INDEX idx_volunteers_role ON volunteers(role)');
    await client.execute('CREATE INDEX idx_volunteers_lastName_firstName ON volunteers(lastName, firstName)');
    await client.execute('CREATE INDEX idx_volunteers_createdAt ON volunteers(createdAt)');
    await client.execute('CREATE INDEX idx_volunteers_role_isActive ON volunteers(role, isActive)');
  },
};
