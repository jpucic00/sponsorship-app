import { Client } from '@libsql/client';
import { Migration } from './runner';

export const migration: Migration = {
  id: '001',
  name: 'add_users_table',

  async up(client: Client): Promise<void> {
    // Create users table for authentication
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        fullName TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        isApproved INTEGER NOT NULL DEFAULT 0,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        lastLoginAt TEXT
      )
    `);

    // Create indexes for performance
    await client.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_users_isApproved ON users(isApproved)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive)');
  },

  async down(client: Client): Promise<void> {
    // Drop indexes first
    await client.execute('DROP INDEX IF EXISTS idx_users_username');
    await client.execute('DROP INDEX IF EXISTS idx_users_isApproved');
    await client.execute('DROP INDEX IF EXISTS idx_users_isActive');

    // Drop table
    await client.execute('DROP TABLE IF EXISTS users');
  },
};
