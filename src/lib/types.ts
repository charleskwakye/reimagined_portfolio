// Types for the database models
import { PrismaClient } from '@prisma/client';

// Export model types based on Prisma schema
export type User = {
  id: string;
  name: string;
  jobTitle: string;
  intro: string;
  about: string;
  profileImage?: string | null;
  resumeUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  socialLinks?: SocialLink[];
  // Support for both formats to make it more flexible
  SocialLink?: SocialLink[];
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Language = {
  id: string;
  name: string;
  proficiency: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  familiarity: number;
  icon?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Tool = {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Specialty = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AboutSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ApproachItem = {
  id: string;
  title: string;
  description: string;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Certification = {
  id: string;
  title: string;
  organization: string;
  year: string;
  url?: string | null;
  iconUrl?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  description?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  id: string;
  title: string;
  shortDesc: string;
  coverImage?: string | null;
  githubLink?: string | null;
  demoLink?: string | null;
  videoUrl?: string | null;
  contentBlocks: any;
  technologies: string[];
  featured: boolean;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Internship = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  shortDesc: string;
  contentBlocks: any;
  technologies: string[];
  testimonials?: any | null;
  outcome?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}; 