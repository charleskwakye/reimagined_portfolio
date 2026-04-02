// Migration script to add UserPreference table safely
// This won't touch any existing data

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting safe migration to add UserPreference table...');
  
  try {
    // Check if the table already exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT 1 FROM "UserPreference" LIMIT 1`;
      console.log('UserPreference table already exists, skipping creation');
    } catch (error) {
      // Table doesn't exist, create it
      console.log('Creating UserPreference table...');
      
      // Execute raw SQL to create the table without risking other data
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "UserPreference" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          
          CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "UserPreference_userId_key_key" UNIQUE ("userId", "key"),
          CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `;
      
      // Add index
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "UserPreference_userId_key_idx" ON "UserPreference"("userId", "key");
      `;
      
      console.log('UserPreference table created successfully!');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Migration completed'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 