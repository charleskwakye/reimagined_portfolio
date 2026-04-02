const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProject() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('No user found in database');
      return;
    }
    
    // Create a new project
    const newProject = await prisma.project.create({
      data: {
        title: 'AI-Enhanced Portfolio',
        shortDesc: 'A portfolio website with AI-powered content management',
        technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'AI'],
        featured: true,
        contentBlocks: [
          {
            id: '1',
            type: 'heading',
            content: 'AI-Enhanced Portfolio',
            level: 2
          },
          {
            id: '2',
            type: 'paragraph',
            content: 'This project demonstrates how AI can be used to enhance content management in a portfolio website.'
          }
        ],
        userId: user.id
      }
    });
    
    console.log('New project created:');
    console.log(newProject);
  } finally {
    await prisma.$disconnect();
  }
}

// Uncomment to actually add the project
addProject();
