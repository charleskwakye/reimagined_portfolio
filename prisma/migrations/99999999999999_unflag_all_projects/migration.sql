-- Migration to unflag all projects
-- This will run automatically when deployed to production

UPDATE "Project" SET "featured" = false WHERE "featured" = true;
