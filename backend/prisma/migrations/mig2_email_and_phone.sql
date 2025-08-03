
-- ========================================
-- MIGRATION: Add Email and Phone Fields
-- Add separate email and phone columns to sponsors and proxies tables
-- ========================================

BEGIN TRANSACTION;

-- Add email and phone columns to sponsors table
ALTER TABLE sponsors ADD COLUMN email TEXT;
ALTER TABLE sponsors ADD COLUMN phone TEXT;

-- Add email and phone columns to proxies table  
ALTER TABLE proxies ADD COLUMN email TEXT;
ALTER TABLE proxies ADD COLUMN phone TEXT;

COMMIT;

-- Verify the migration
SELECT 'Migration completed successfully. New columns added:' as status;
PRAGMA table_info(sponsors);
PRAGMA table_info(proxies);