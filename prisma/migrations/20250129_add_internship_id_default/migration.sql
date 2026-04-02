-- Add default for Internship id using gen_random_uuid or similar
-- For PostgreSQL with cuid() equivalent, we'll use a function or extension

-- First, create internships with null IDs a temporary id if needed, or just set future ones
-- The schema change allows the client to generate IDs

-- Note: PostgreSQL doesn't have a built-in cuid() function
-- The @default(cuid()) in Prisma means Prisma Client will generate the ID
-- No database-level changes needed for this

-- If you need a database default for raw SQL inserts, you could add:
-- ALTER TABLE "Internship" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
-- But since you're using Prisma, the client-side generation is preferred
