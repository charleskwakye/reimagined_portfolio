'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

/**
 * Admin Action: Create or update the user profile
 * Creates new user if none exists, otherwise updates existing
 * Revalidates all relevant paths after successful operation
 *
 * @param data - User profile data (name, jobTitle, intro, about, optional profileImage and resumeUrl)
 * @returns Object with success flag and user data, or error message
 * @example
 * const result = await createUserProfile({
 *   name: 'John Doe',
 *   jobTitle: 'Software Engineer',
 *   intro: 'Full-stack developer...',
 *   about: 'Detailed bio...',
 *   profileImage: 'https://...',
 *   resumeUrl: 'https://...'
 * })
 * if (result.success) console.log('Profile updated:', result.user)
 */
export async function createUserProfile(data: {
  name: string;
  jobTitle: string;
  intro: string;
  about: string;
  profileImage?: string;
  resumeUrl?: string;
}) {
  try {
    // Check if a user already exists
    const existingUser = await prisma.user.findFirst();
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data,
      });
      
      revalidatePath('/');
      revalidatePath('/about');
      revalidatePath('/admin');
      revalidatePath('/resume');
      revalidatePath('/cv');
      
      return { success: true, user: updatedUser };
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          ...data,
          updatedAt: new Date(),
        },
      });
      
      revalidatePath('/');
      revalidatePath('/about');
      revalidatePath('/admin');
      revalidatePath('/resume');
      revalidatePath('/cv');
      
      return { success: true, user: newUser };
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return { success: false, error: 'Failed to create or update user profile' };
  }
}

/**
 * Admin Action: Add a social media link to the profile
 * Creates a new SocialLink record associated with the first user found
 *
 * @param data - Social link data (platform name, URL, optional icon)
 * @returns Object with success flag and socialLink data, or error message
 * @example
 * const result = await addSocialLink({
 *   platform: 'GitHub',
 *   url: 'https://github.com/username',
 *   icon: 'github'
 * })
 * if (result.success) console.log('Link added:', result.socialLink)
 */
export async function addSocialLink(data: {
  platform: string;
  url: string;
  icon?: string;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create social link
    const socialLink = await prisma.socialLink.create({
      data: {
        id: randomUUID(),
        ...data,
        updatedAt: new Date(),
        userId: user.id,
      },
    });
    
    revalidatePath('/');
    
    return { success: true, socialLink };
  } catch (error) {
    console.error('Error adding social link:', error);
    return { success: false, error: 'Failed to add social link' };
  }
}

/**
 * Admin Action: Add a skill/tool to the profile
 * Note: Currently references 'skill' model but database uses 'tool' model
 *
 * @param data - Skill data (name, category, familiarity level 1-5, optional icon)
 * @returns Object with success flag and skill data, or error message
 * @example
 * const result = await addSkill({
 *   name: 'React',
 *   category: 'Frontend',
 *   familiarity: 5,
 *   icon: 'react'
 * })
 * if (result.success) console.log('Skill added:', result.skill)
 */
export async function addSkill(data: {
  name: string;
  category: string;
  familiarity: number;
  icon?: string;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create tool (using tool model instead of skill)
    const tool = await prisma.tool.create({
      data: {
        id: randomUUID(),
        name: data.name,
        category: data.category,
        icon: data.icon || null,
        updatedAt: new Date(),
        userId: user.id,
      },
    });
    
    revalidatePath('/resume');
    
    return { success: true, tool };
  } catch (error) {
    console.error('Error adding skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

/**
 * Admin Action: Add work experience entry
 * Creates an Experience record with job details and timeline
 *
 * @param data - Experience data (title, company, dates, current status, description)
 * @returns Object with success flag and experience data, or error message
 * @example
 * const result = await addExperience({
 *   title: 'Senior Developer',
 *   company: 'Tech Corp',
 *   location: 'Remote',
 *   startDate: new Date('2020-01-01'),
 *   endDate: null,
 *   current: true,
 *   description: 'Led frontend team...'
 * })
 * if (result.success) console.log('Experience added:', result.experience)
 */
export async function addExperience(data: {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  description: string;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create experience
    const experience = await prisma.experience.create({
      data: {
        id: randomUUID(),
        ...data,
        updatedAt: new Date(),
        userId: user.id,
      },
    });
    
    revalidatePath('/resume');
    
    return { success: true, experience };
  } catch (error) {
    console.error('Error adding experience:', error);
    return { success: false, error: 'Failed to add experience' };
  }
}

/**
 * Admin Action: Add education entry
 * Creates an Education record with academic details
 *
 * @param data - Education data (degree, institution, dates, current status)
 * @returns Object with success flag and education data, or error message
 * @example
 * const result = await addEducation({
 *   degree: 'B.S. Computer Science',
 *   institution: 'University Name',
 *   location: 'City, State',
 *   startDate: new Date('2016-09-01'),
 *   endDate: new Date('2020-05-01'),
 *   current: false,
 *   description: 'Graduated with honors...'
 * })
 * if (result.success) console.log('Education added:', result.education)
 */
export async function addEducation(data: {
  degree: string;
  institution: string;
  location?: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  description?: string;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create education
    const education = await prisma.education.create({
      data: {
        id: randomUUID(),
        ...data,
        updatedAt: new Date(),
        userId: user.id,
      },
    });
    
    revalidatePath('/resume');
    
    return { success: true, education };
  } catch (error) {
    console.error('Error adding education:', error);
    return { success: false, error: 'Failed to add education' };
  }
}

/**
 * Admin Action: Add a portfolio project
 * Creates a Project record with content blocks and metadata
 *
 * @param data - Project data (title, description, links, technologies, etc.)
 * @returns Object with success flag and project data, or error message
 * @example
 * const result = await addProject({
 *   title: 'E-commerce Platform',
 *   shortDesc: 'Full-stack online store',
 *   coverImage: 'https://...',
 *   githubLink: 'https://github.com/...',
 *   demoLink: 'https://...',
 *   contentBlocks: [{ type: 'text', content: '...' }],
 *   technologies: ['React', 'Node.js', 'PostgreSQL'],
 *   featured: true
 * })
 * if (result.success) console.log('Project added:', result.project)
 */
export async function addProject(data: {
  title: string;
  shortDesc: string;
  coverImage?: string;
  githubLink?: string;
  demoLink?: string;
  contentBlocks: any;
  technologies: string[];
  featured: boolean;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
    
    revalidatePath('/');
    revalidatePath('/projects');
    
    return { success: true, project };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: 'Failed to add project' };
  }
}

/**
 * Admin Action: Add an internship experience
 * Creates an Internship record similar to projects but for work experience
 *
 * @param data - Internship data (title, company, dates, content blocks, testimonials)
 * @returns Object with success flag and internship data, or error message
 * @example
 * const result = await addInternship({
 *   title: 'Software Engineering Intern',
 *   company: 'Tech Startup',
 *   location: 'San Francisco',
 *   startDate: new Date('2023-06-01'),
 *   endDate: new Date('2023-08-15'),
 *   shortDesc: 'Worked on core product features',
 *   contentBlocks: [{ type: 'text', content: '...' }],
 *   technologies: ['Python', 'Django'],
 *   testimonials: [{ author: 'Manager', text: '...' }],
 *   outcome: 'Full-time offer received'
 * })
 * if (result.success) console.log('Internship added:', result.internship)
 */
export async function addInternship(data: {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date | null;
  shortDesc: string;
  contentBlocks: any;
  technologies: string[];
  testimonials?: any;
  outcome?: string;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create internship
    const internship = await prisma.internship.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
    
    revalidatePath('/internship');
    
    return { success: true, internship };
  } catch (error) {
    console.error('Error adding internship:', error);
    return { success: false, error: 'Failed to add internship' };
  }
}

/**
 * Admin Action: Add a language proficiency
 * Creates a Language record for the user
 *
 * @param data - Language data (name and proficiency level)
 * @returns Object with success flag and language data, or error message
 * @example
 * const result = await addLanguage({
 *   name: 'Spanish',
 *   proficiency: 'Fluent'
 * })
 * if (result.success) console.log('Language added:', result.language)
 */
export async function addLanguage(data: {
  name: string;
  proficiency: string;
}) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Create language
    const language = await prisma.language.create({
      data: {
        id: randomUUID(),
        ...data,
        updatedAt: new Date(),
        userId: user.id,
      },
    });
    
    revalidatePath('/');
    
    return { success: true, language };
  } catch (error) {
    console.error('Error adding language:', error);
    return { success: false, error: 'Failed to add language' };
  }
}

/**
 * Admin Action: Update the user's resume/CV URL
 * Updates the resumeUrl field on the user profile
 *
 * @param resumeUrl - URL to the resume file (PDF)
 * @returns Object with success flag and updated user data, or error message
 * @example
 * const result = await updateResumeUrl('https://blob.vercel-storage.com/resume.pdf')
 * if (result.success) console.log('Resume URL updated:', result.user.resumeUrl)
 */
export async function updateResumeUrl(resumeUrl: string) {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Update resume URL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { resumeUrl },
    });
    
    revalidatePath('/resume');
    revalidatePath('/cv');
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating resume URL:', error);
    return { success: false, error: 'Failed to update resume URL' };
  }
} 