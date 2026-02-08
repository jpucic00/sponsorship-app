#!/usr/bin/env ts-node

import { migrate, rollback, status } from './index';

const command = process.argv[2];
const arg = process.argv[3];

async function main() {
  switch (command) {
    case 'up':
    case 'migrate':
      await migrate();
      break;

    case 'down':
    case 'rollback':
      if (!arg) {
        console.error('❌ Please specify migration ID to rollback');
        console.error('   Usage: npm run migrate:rollback <migration-id>');
        process.exit(1);
      }
      await rollback(arg);
      break;

    case 'status':
      await status();
      break;

    default:
      console.log(`
Database Migration CLI

Usage:
  npm run migrate           Run all pending migrations
  npm run migrate:status    Show migration status
  npm run migrate:rollback <id>  Rollback a specific migration

Examples:
  npm run migrate
  npm run migrate:status
  npm run migrate:rollback 001
      `);
      break;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
