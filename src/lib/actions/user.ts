'use server';

import { prisma } from '@/lib/db';
import { Skill, User, Language, Experience, Education, Project, Internship, Tool, Specialty, AboutSection, ApproachItem } from '@/lib/types';
import { getCertificationOrder, getExperienceOrder } from '@/lib/userPreferences';
import { cache } from 'react';

// Cached user lookup to prevent redundant database queries within the same request
const getCachedUser = cache(async () => {
  try {
    return await prisma.user.findFirst();
  } catch (error) {
    console.error('Error fetching cached user:', error);
    return null;
  }
});

/**
 * Fetches the main user profile with social links
 * Assumes single-user portfolio (returns first user found)
 *
 * @returns User object with social links, or null if not found/error
 * @example
 * const user = await getUserProfile()
 * if (user) console.log(user.name, user.SocialLink)
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    // Assuming there's only one user in the system for a portfolio site
    const user = await prisma.user.findFirst({
      include: {
        SocialLink: true
      }
    });
    
    // Return user even without social links
    return user as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetches all languages for the portfolio owner
 * Sorted by creation date (ascending)
 *
 * @returns Array of Language objects
 * @throws Error if database query fails
 * @example
 * const languages = await getUserLanguages()
 * languages.forEach(lang => console.log(lang.name, lang.proficiency))
 */
export async function getUserLanguages(): Promise<Language[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const languages = await prisma.language.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    return languages;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw new Error('Failed to fetch language data');
  }
}

/**
 * Fetches user skills (tools) grouped by category
 * Returns tools organized by their category field
 *
 * @returns Object with category keys and arrays of tools
 * @throws Error if database query fails
 * @example
 * const skills = await getUserSkills()
 * Object.entries(skills).forEach(([category, tools]) => {
 *   console.log(`${category}: ${tools.map(t => t.name).join(', ')}`)
 * })
 */
// Get user skills
export async function getUserSkills(): Promise<Record<string, any[]>> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return {};
    }
    
    const tools = await prisma.tool.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        category: 'asc',
      },
    });
    
    // Group tools by category
    const groupedTools: Record<string, any[]> = {};
    
    tools.forEach((tool: any) => {
      const category = tool.category || 'Other';
      
      if (!groupedTools[category]) {
        groupedTools[category] = [];
      }
      
      groupedTools[category].push(tool);
    });
    
    return groupedTools;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw new Error('Failed to fetch tool data');
  }
}

/**
 * Fetches all tools/skills for the user with custom ordering
 * Applies custom sort order from UserPreferences if available
 *
 * @returns Array of Tool objects (optionally ordered)
 * @throws Error if database query fails
 * @example
 * const tools = await getUserTools()
 * // Tools sorted by saved order or by category
 */
export async function getUserTools(): Promise<Tool[]> {
  try {
    // Get the current user to fetch their preferences - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const tools = await prisma.tool.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Get tools order from UserPreferences
    const orderPreference = await prisma.userPreference.findUnique({
      where: {
        userId_key: {
          userId: user.id,
          key: 'toolsOrder'
        }
      }
    });

    if (orderPreference && orderPreference.value) {
      try {
        const orderedIds = JSON.parse(orderPreference.value);
        if (Array.isArray(orderedIds)) {
          // Apply the saved order, then append any new tools not in the order
          const orderedTools = orderedIds
            .map(id => tools.find(tool => tool.id === id))
            .filter(Boolean) as Tool[];
          
          const unorderedTools = tools.filter(tool => !orderedIds.includes(tool.id));
          
          return [...orderedTools, ...unorderedTools];
        }
      } catch (e) {
        console.error('Error parsing tools order preference:', e);
      }
    }
    
    return tools;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw new Error('Failed to fetch tool data');
  }
}

/**
 * Fetches user certifications sorted by custom order or year
 * Returns empty array if Certification model unavailable
 *
 * @returns Array of Certification objects sorted by order preference or year
 * @example
 * const certs = await getUserCertifications()
 * certs.forEach(cert => console.log(cert.name, cert.year))
 */
export async function getUserCertifications(): Promise<any[]> {
  try {
    // Check if the Certification model exists in the prisma client
    if (!prisma.certification) {
      console.warn('Certification model is not available in the Prisma client');
      return [];
    }
    
    // Get the current user to fetch their preferences - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      console.warn('No user found');
      return [];
    }
    
    const certifications = await prisma.certification.findMany({
      where: {
        userId: user.id
      }
    });
    
    // Get custom ordering from UserPreferences
    const orderMap = await getCertificationOrder(user.id);
    
    // Apply custom ordering if available, otherwise sort by year (newest first)
    const sortedCertifications = certifications.sort((a, b) => {
      if (orderMap[a.id] !== undefined && orderMap[b.id] !== undefined) {
        return orderMap[a.id] - orderMap[b.id];
      }
      return b.year.localeCompare(a.year);
    });
    
    return sortedCertifications;
  } catch (error) {
    console.error('Error fetching certifications:', error);
    // Return empty array instead of throwing error
    return [];
  }
}

/**
 * Fetches user specialties with custom ordering
 * Applies custom sort order from UserPreferences if available
 *
 * @returns Array of Specialty objects
 * @throws Error if database query fails
 * @example
 * const specialties = await getUserSpecialties()
 * specialties.forEach(s => console.log(s.title))
 */
export async function getUserSpecialties(): Promise<Specialty[]> {
  try {
    // Get the current user to fetch their preferences - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const specialties = await prisma.specialty.findMany({
      where: {
        userId: user.id
      }
    });

    // Get specialties order from UserPreferences
    const orderPreference = await prisma.userPreference.findUnique({
      where: {
        userId_key: {
          userId: user.id,
          key: 'specialtiesOrder'
        }
      }
    });

    if (orderPreference && orderPreference.value) {
      try {
        const orderedIds = JSON.parse(orderPreference.value);
        if (Array.isArray(orderedIds)) {
          // Apply the saved order, then append any new specialties not in the order
          const orderedSpecialties = orderedIds
            .map(id => specialties.find(specialty => specialty.id === id))
            .filter(Boolean) as Specialty[];
          
          const unorderedSpecialties = specialties.filter(specialty => !orderedIds.includes(specialty.id));
          
          return [...orderedSpecialties, ...unorderedSpecialties];
        }
      } catch (e) {
        console.error('Error parsing specialties order preference:', e);
      }
    }
    
    return specialties;
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw new Error('Failed to fetch specialty data');
  }
}

/**
 * Fetches about page sections sorted by order field
 * Used to build the about page content
 *
 * @returns Array of AboutSection objects sorted by order
 * @throws Error if database query fails
 * @example
 * const sections = await getUserAboutSections()
 * sections.forEach(section => console.log(section.title))
 */
export async function getUserAboutSections(): Promise<AboutSection[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const aboutSections = await prisma.aboutSection.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return aboutSections;
  } catch (error) {
    console.error('Error fetching about sections:', error);
    throw new Error('Failed to fetch about section data');
  }
}

/**
 * Fetches approach/methodology items sorted by order field
 * Used to display work approach on portfolio
 *
 * @returns Array of ApproachItem objects sorted by order
 * @throws Error if database query fails
 * @example
 * const items = await getUserApproachItems()
 * items.forEach(item => console.log(item.title))
 */
export async function getUserApproachItems(): Promise<ApproachItem[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const approachItems = await prisma.approachItem.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return approachItems;
  } catch (error) {
    console.error('Error fetching approach items:', error);
    throw new Error('Failed to fetch approach item data');
  }
}

/**
 * Fetches work experience entries sorted by custom order or date
 * Applies custom ordering from UserPreferences if available
 *
 * @returns Array of Experience objects sorted by preference or start date
 * @throws Error if database query fails
 * @example
 * const experiences = await getUserExperience()
 * experiences.forEach(exp => console.log(exp.company, exp.title))
 */
export async function getUserExperience(): Promise<Experience[]> {
  try {
    // Get the current user to fetch their preferences - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      console.warn('No user found');
      return [];
    }
    
    const experiences = await prisma.experience.findMany({
      where: {
        userId: user.id
      }
    });
    
    // Get custom ordering from UserPreferences
    const orderMap = await getExperienceOrder(user.id);
    
    // Apply custom ordering if available, otherwise sort by start date (newest first)
    const sortedExperiences = experiences.sort((a, b) => {
      if (orderMap[a.id] !== undefined && orderMap[b.id] !== undefined) {
        return orderMap[a.id] - orderMap[b.id];
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
    
    return sortedExperiences;
  } catch (error) {
    console.error('Error fetching experiences:', error);
    throw new Error('Failed to fetch experience data');
  }
}

/**
 * Fetches education history sorted by start date (newest first)
 *
 * @returns Array of Education objects
 * @throws Error if database query fails
 * @example
 * const education = await getUserEducation()
 * education.forEach(edu => console.log(edu.institution, edu.degree))
 */
export async function getUserEducation(): Promise<Education[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const education = await prisma.education.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    return education;
  } catch (error) {
    console.error('Error fetching education:', error);
    throw new Error('Failed to fetch education data');
  }
}

/**
 * Fetches featured projects for homepage display (limited to 3)
 * Returns projects sorted by featured status, order field, then date
 *
 * @returns Array of up to 3 featured Project objects
 * @throws Error if database query fails
 * @example
 * const featured = await getFeaturedProjects()
 * featured.forEach(project => console.log(project.title))
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        {
          featured: 'desc', // Featured projects first
        },
        {
          order: 'asc', // Then by order field
        },
        {
          createdAt: 'desc', // Then by date
        }
      ],
      take: 3, // Limit to 3 projects
    });
    
    return projects;
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    throw new Error('Failed to fetch featured projects');
  }
}

/**
 * Fetches all projects for the user
 * Returns all projects sorted by order, featured status, then creation date
 *
 * @returns Array of all Project objects
 * @throws Error if database query fails
 * @example
 * const projects = await getAllProjects()
 * projects.forEach(project => console.log(project.title, project.featured))
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        {
          order: 'asc', // First by order field
        },
        {
          featured: 'desc', // Then by featured status
        },
        {
          createdAt: 'desc', // Finally by creation date
        }
      ],
    });
    
    return projects;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

/**
 * Fetches a specific project by ID
 * Ensures project belongs to the portfolio owner
 *
 * @param id - The unique project ID
 * @returns Project object or null if not found
 * @throws Error if database query fails
 * @example
 * const project = await getProjectById('abc123')
 * if (project) console.log(project.title)
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return null;
    }
    
    const project = await prisma.project.findFirst({
      where: { 
        id: id,
        userId: user.id
      }
    });
    
    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project data');
  }
}

/**
 * Fetches all internship experiences sorted by start date (newest first)
 *
 * @returns Array of Internship objects
 * @throws Error if database query fails
 * @example
 * const internships = await getInternships()
 * internships.forEach(intern => console.log(intern.company, intern.title))
 */
export async function getInternships(): Promise<Internship[]> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return [];
    }
    
    const internships = await prisma.internship.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    return internships;
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw new Error('Failed to fetch internship data');
  }
}

/**
 * Fetches a specific internship by ID
 * Ensures internship belongs to the portfolio owner
 *
 * @param id - The unique internship ID
 * @returns Internship object or null if not found
 * @throws Error if database query fails
 * @example
 * const internship = await getInternshipById('abc123')
 * if (internship) console.log(internship.company, internship.outcome)
 */
export async function getInternshipById(id: string): Promise<Internship | null> {
  try {
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return null;
    }
    
    const internship = await prisma.internship.findFirst({
      where: { 
        id: id,
        userId: user.id
      }
    });
    
    return internship;
  } catch (error) {
    console.error('Error fetching internship:', error);
    throw new Error('Failed to fetch internship data');
  }
} 
/**
 * Fetches a specific certification by ID
 * Ensures certification belongs to the portfolio owner
 *
 * @param id - The unique certification ID
 * @returns Certification object or null if not found
 * @throws Error if database query fails
 * @example
 * const certification = await getCertificationById('abc123')
 * if (certification) console.log(certification.title, cert.pdfUrl)
 */
export async function getCertificationById(id: string): Promise<any | null> {
  try {
    // Check if the Certification model exists in the prisma client
    if (!prisma.certification) {
      console.warn('Certification model is not available in the Prisma client');
      return null;
    }
    
    // Get the first user (portfolio owner) - cached to prevent redundant queries
    const user = await getCachedUser();
    if (!user) {
      return null;
    }
    
    const certification = await prisma.certification.findFirst({
      where: { 
        id: id,
        userId: user.id
      }
    });
    
    return certification;
  } catch (error) {
    console.error('Error fetching certification:', error);
    return null;
  }
}
