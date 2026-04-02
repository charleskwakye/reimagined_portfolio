const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addBulletPoints() {
  try {
    // Get all experiences
    const experiences = await prisma.experience.findMany();
    
    for (const exp of experiences) {
      console.log(`Processing experience: ${exp.title} at ${exp.company}`);
      
      // Check if this experience already has bullet points
      const hasBulletPoints = exp.description.includes('•') || 
                             exp.description.includes('- ') || 
                             exp.description.includes('* ');
      
      if (!hasBulletPoints) {
        console.log(`Adding bullet points to: ${exp.title} at ${exp.company}`);
        
        // Create sample bullet points based on the experience
        const bulletPoints = [
          `• Collaborated with team members to achieve ${exp.company}'s objectives and goals`,
          `• Demonstrated strong problem-solving skills and attention to detail in all ${exp.title} responsibilities`,
          `• Consistently met or exceeded performance expectations and deadlines`
        ];
        
        // Add bullet points to the description
        const updatedDescription = exp.description.trim() + '\n\n' + bulletPoints.join('\n');
        
        // Update the experience with bullet points
        await prisma.experience.update({
          where: { id: exp.id },
          data: { description: updatedDescription }
        });
        
        console.log(`Updated experience with bullet points: ${exp.title}`);
      } else {
        console.log(`Experience already has bullet points: ${exp.title}`);
      }
    }
    
    console.log('Finished processing experiences');
  } catch (error) {
    console.error('Error adding bullet points:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
addBulletPoints();
