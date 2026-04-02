const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to add certifications to the database...');

  // First, check if we have a user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.error('No user found in the database. Please set up a user first.');
    return;
  }

  // Define the certifications
  const certifications = [
    {
      title: 'Qlik Sense Business Analyst Qualification',
      organization: 'Qlik',
      year: '2023',
      url: 'https://www.credly.com/badges/your-qlik-badge', // Replace with actual URL if available
    },
    {
      title: 'Microsoft Azure for Databricks',
      organization: 'Microsoft',
      year: '2023',
      url: 'https://www.credly.com/badges/your-azure-badge', // Replace with actual URL if available
    },
    {
      title: 'DBT Fundamentals',
      organization: 'dbt Labs',
      year: '2023',
      url: 'https://www.credential.net/your-dbt-credential', // Replace with actual URL if available
    },
  ];

  // Add each certification to the database
  try {
    for (const cert of certifications) {
      // Check if the certification already exists to avoid duplicates
      const existingCert = await prisma.certification.findFirst({
        where: {
          title: cert.title,
          organization: cert.organization,
          userId: user.id,
        },
      });

      if (!existingCert) {
        await prisma.certification.create({
          data: {
            ...cert,
            userId: user.id,
          },
        });
        console.log(`Added certification: ${cert.title}`);
      } else {
        console.log(`Certification already exists: ${cert.title}`);
      }
    }

    console.log('Certification addition completed successfully.');
  } catch (error) {
    console.error('Error adding certifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}); 