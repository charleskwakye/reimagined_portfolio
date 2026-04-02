const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    // Check experience entries
    const experiences = await prisma.experience.findMany({
      orderBy: { startDate: 'desc' }
    });
    console.log(`Found ${experiences.length} experience entries:`);
    experiences.forEach(exp => {
      console.log(`- ${exp.title} at ${exp.company} (${new Date(exp.startDate).toLocaleDateString()} - ${exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()})`);
    });
    
    // Check education entries
    const education = await prisma.education.findMany({
      orderBy: { startDate: 'desc' }
    });
    console.log(`\nFound ${education.length} education entries:`);
    education.forEach(edu => {
      console.log(`- ${edu.degree} at ${edu.institution} (${new Date(edu.startDate).toLocaleDateString()} - ${edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'No end date'})`);
    });
    
    // Check tools (skills)
    const tools = await prisma.tool.findMany();
    console.log(`\nFound ${tools.length} tools/skills:`);
    const categories = [...new Set(tools.map(tool => tool.category))];
    categories.forEach(category => {
      const categoryTools = tools.filter(tool => tool.category === category);
      console.log(`- ${category} (${categoryTools.length}): ${categoryTools.map(t => t.name).join(', ')}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
