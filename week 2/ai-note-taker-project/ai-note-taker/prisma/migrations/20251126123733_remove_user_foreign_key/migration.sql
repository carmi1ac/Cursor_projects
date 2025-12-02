-- Drop foreign key constraint
ALTER TABLE "notes" DROP CONSTRAINT IF EXISTS "notes_userId_fkey";

-- Drop users table if it exists
DROP TABLE IF EXISTS "users" CASCADE;
