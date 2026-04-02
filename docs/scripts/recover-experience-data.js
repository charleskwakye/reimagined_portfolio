// Recovery script for experience data
// If you lost some experience entries, you can use this script to re-add them

const { PrismaClient } = require('@prisma/client');
const cuid = require('cuid');

const prisma = new PrismaClient();

// Sample experience data - replace with your actual data
const experienceData = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    startDate: new Date("2022-01-01"),
    endDate: null,
    current: true,
    description: JSON.stringify([
      "Led the development of a new customer dashboard using React and Next.js, resulting in a 40% improvement in page load times.",
      "Implemented a component library with Storybook that improved development efficiency by 30%.",
      "Mentored junior developers and conducted code reviews to maintain code quality standards.",
      "Collaborated with UX designers to implement accessible user interfaces that comply with WCAG standards."
    ])
  },
  {
    title: "VRT internship",
    company: "VRT",
    location: "Brussels, Belgium",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-29"),
    current: false,
    description: JSON.stringify([
      "Conducted an in-depth feasibility study on leveraging advanced large language models (LLMs) for automating the generation of DBT (Data Build Tool) documentation, addressing VRT's undocumented DBT codebase",
      "Collaborated with data engineers to iteratively refine my solution, I then integrated this feedback to enhance the accuracy and usability of the generated documentation.",
      "Utilized advanced NLP techniques and tools, such as transformer architectures, embeddings and tokenization, to optimize the model's output and relevance to VRT's dbt documentation."
    ])
  }
  // Add more experience entries as needed
];

async function recoverExperienceData() {
  console.log('Starting experience data recovery...');
  
  try {
    // Get the user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('No user found in database');
      return;
    }
    
    console.log(`Found user: ${user.name}`);
    
    // Check existing experiences to avoid duplicates
    const existingExperiences = await prisma.experience.findMany({
      where: { userId: user.id }
    });
    
    console.log(`Found ${existingExperiences.length} existing experiences`);
    
    for (const expData of experienceData) {
      // Check if experience already exists (by title and company)
      const exists = existingExperiences.find(
        exp => exp.title === expData.title && exp.company === expData.company
      );
      
      if (exists) {
        console.log(`Experience "${expData.title}" at "${expData.company}" already exists, skipping...`);
        continue;
      }
      
      // Create the experience
      const experience = await prisma.experience.create({
        data: {
          id: cuid(),
          title: expData.title,
          company: expData.company,
          location: expData.location,
          startDate: expData.startDate,
          endDate: expData.endDate,
          current: expData.current,
          description: expData.description,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      
      console.log(`✅ Added experience: "${experience.title}" at "${experience.company}"`);
    }
    
    console.log('\n🎉 Experience data recovery completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during recovery:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Instructions for using this script
console.log(`
📝 EXPERIENCE DATA RECOVERY SCRIPT

This script will help you recover any lost experience data.

INSTRUCTIONS:
1. Edit the 'experienceData' array above with your actual experience information
2. Run the script with: node recover-experience-data.js
3. The script will check for duplicates and only add missing experiences

IMPORTANT:
- Update the experienceData array with your real data before running
- The script won't duplicate existing experiences
- Description should be a JSON array of bullet points
- Set current: true for ongoing positions, false for completed ones

Ready to run? Update the data above and execute: node recover-experience-data.js
`);

if (require.main === module) {
  recoverExperienceData();
} 