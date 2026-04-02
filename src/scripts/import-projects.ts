import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the path to the CSV file
const csvFilePath = path.join(process.cwd(), 'src', 'extraInfo', 'projects.csv');

// Function to extract technologies from project description and other fields
function extractTechnologies(project: any): string[] {
  const techMap: { [key: string]: boolean } = {
    // Programming languages
    'HTML': false,
    'CSS': false,
    'JavaScript': false,
    'TypeScript': false,
    'C#': false,
    'Java': false,
    'Python': false,
    'PHP': false,
    'SCSS': false,
    'Sass': false,

    // Frameworks & Libraries
    'React': false,
    'Vue.js': false,
    'Angular': false,
    'Node.js': false,
    'Express': false,
    'Laravel': false,
    'Bootstrap': false,
    'Tailwind': false,
    'jQuery': false,

    // Tools & Platforms
    'Tableau': false,
    'Qlik Sense': false,
    'Selenium': false,
    'GitHub': false,
    'Git': false,
    'Netlify': false,
    'Axure RP': false,
    'Trello': false,
    'Combell': false,

    // Databases
    'MySQL': false,
    'PostgreSQL': false,
    'MongoDB': false,
    'SQL': false,
  };

  // Combine all text fields to search for technologies
  const allText = [
    project.title,
    project.short_description,
    project.about,
    project.responsibility,
    project.conclusion
  ].join(' ');

  // Check for each technology in the text
  Object.keys(techMap).forEach(tech => {
    if (allText.includes(tech)) {
      techMap[tech] = true;
    }
  });

  // Special cases based on project info
  if (project.title.includes('Tableau')) {
    techMap['Tableau'] = true;
  }

  if (project.title.includes('Qlik')) {
    techMap['Qlik Sense'] = true;
  }

  if (project.title.includes('C#') || project.title.includes('Selenium')) {
    techMap['C#'] = true;
    techMap['Selenium'] = true;
  }

  if (project.title.includes('Shoestory') || allText.includes('SCSS') || allText.includes('Sass')) {
    techMap['HTML'] = true;
    techMap['SCSS'] = true;
    techMap['JavaScript'] = true;
    techMap['Bootstrap'] = true;
  }

  if (allText.toLowerCase().includes('e-commerce') || project.title.includes('E-commerce')) {
    techMap['HTML'] = true;
    techMap['CSS'] = true;
    techMap['JavaScript'] = true;
  }

  // Return array of used technologies
  return Object.keys(techMap).filter(tech => techMap[tech]);
}

// Function to create content blocks from project data
function createContentBlocks(project: any): any[] {
  const blocks = [];

  // Add about section if available
  if (project.about && project.about.trim()) {
    blocks.push({
      type: 'text',
      content: project.about,
      heading: 'About the Project'
    });
  }

  // Add responsibilities section if available
  if (project.responsibility && project.responsibility.trim()) {
    blocks.push({
      type: 'text',
      content: project.responsibility,
      heading: 'My Responsibilities'
    });
  }

  // Add conclusion/outcome section if available
  if (project.conclusion && project.conclusion.trim()) {
    blocks.push({
      type: 'text',
      content: project.conclusion,
      heading: 'Outcome & Learnings'
    });
  }

  // Add embedded video if available
  if (project.cover_type === 'video' && project.url_view_project && project.url_view_project.includes('youtube')) {
    blocks.push({
      type: 'video',
      videoUrl: project.url_view_project,
      caption: `${project.title} Demo Video`
    });
  }

  return blocks;
}

// Function to determine if a project should be featured
function shouldBeFeature(project: any): boolean {
  // Never auto-feature projects during import
  // Let user manually choose via admin interface
  return false;
}

async function importProjects() {
  try {
    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    console.log('Parsing CSV data...');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Found ${records.length} projects in CSV file`);

    // Get the first user (assuming there's only one user in the portfolio)
    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error('No user found in the database');
    }

    console.log(`Using user with ID: ${user.id}`);

    // Check for existing projects to avoid duplicates
    const existingProjects = await prisma.project.findMany({
      select: { title: true }
    });
    const existingTitles = new Set(existingProjects.map(p => p.title.toLowerCase()));

    console.log(`Found ${existingProjects.length} existing projects`);

    // Process and import projects
    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      // Skip if project title already exists to avoid duplicates
      if (existingTitles.has(record.title.toLowerCase())) {
        console.log(`Skipping project "${record.title}" (already exists)`);
        skipped++;
        continue;
      }

      // Skip incomplete projects
      if (!record.title || !record.short_description) {
        console.log(`Skipping incomplete project: "${record.title || 'Untitled'}"`);
        skipped++;
        continue;
      }

      // Extract technologies
      const technologies = extractTechnologies(record);

      // Create content blocks
      const contentBlocks = createContentBlocks(record);

      // Determine featured status
      const featured = shouldBeFeature(record);

      // Process cover image
      let coverImage = null;
      if (record.cover_type === 'image' && record.cover_url) {
        coverImage = `/images/projects/${record.cover_url}`;
      }

      // Create the project
      const project = await prisma.project.create({
        data: {
          title: record.title,
          shortDesc: record.short_description,
          coverImage: coverImage,
          githubLink: record.url_github || null,
          demoLink: record.url_view_project && !record.url_view_project.includes('youtube') ? record.url_view_project : null,
          videoUrl: record.url_view_project && record.url_view_project.includes('youtube') ? record.url_view_project : null,
          contentBlocks: contentBlocks,
          technologies: technologies,
          featured: featured,
          userId: user.id
        }
      });

      console.log(`Imported project: "${project.title}"`);
      imported++;
    }

    console.log(`Import complete: ${imported} projects imported, ${skipped} skipped`);

  } catch (error) {
    console.error('Error importing projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import function
importProjects()
  .then(() => console.log('Done!'))
  .catch(error => console.error('Import failed:', error)); 