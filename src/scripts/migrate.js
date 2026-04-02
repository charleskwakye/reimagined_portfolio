// This script runs the Prisma migrations during deployment

const { exec } = require('child_process');

console.log('🔄 Running database migrations...');

// Run Prisma migrations
exec('npx prisma migrate deploy', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Migration Error: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`❌ Migration Error: ${stderr}`);
    process.exit(1);
  }
  
  console.log(stdout);
  console.log('✅ Migrations completed successfully');
  console.log('✅ Database operations completed - No seeding performed');
  
  // Seeding has been completely disabled
  // You can manually seed using: npm run db:seed
  // But for production, manage data through Neon interface or admin section
}); 