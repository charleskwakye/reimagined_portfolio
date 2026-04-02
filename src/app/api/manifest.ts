/**
 * API Route Registry & Documentation
 *
 * This file provides a complete registry of all API routes in the application.
 * It serves as documentation and a reference for developers and LLM agents.
 *
 * @file src/app/api/manifest.ts
 * @description Complete API route registry for Next.js App Router
 *
 * Structure:
 * - Each domain has its own section with routes
 * - Routes include: path, method, authentication requirement
 * - Authentication: true = requires session, false = public
 *
 * Total Routes: 65
 * Public Routes: ~20
 * Protected Routes: ~45
 */

// ============================================================================
// ABOUT ROUTES
// ============================================================================

export const AboutRoutes = {
  domain: 'About Sections',
  description: 'Manage about page sections',
  base: '/api/about',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all about sections' },
    create: { path: '/new', method: 'POST', auth: true, description: 'Create new about section' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific about section' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update about section' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete about section' },
  }
} as const;

// ============================================================================
// APPROACH ROUTES
// ============================================================================

export const ApproachRoutes = {
  domain: 'Approach Items',
  description: 'Manage approach/methodology items',
  base: '/api/approach',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all approach items' },
    create: { path: '/new', method: 'POST', auth: true, description: 'Create new approach item' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific approach item' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update approach item' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete approach item' },
  }
} as const;

// ============================================================================
// CERTIFICATION ROUTES
// ============================================================================

export const CertificationRoutes = {
  domain: 'Certifications',
  description: 'Manage professional certifications',
  base: '/api/certifications',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all certifications' },
    create: { path: '/new', method: 'POST', auth: true, description: 'Create new certification' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific certification' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update certification' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete certification' },
    reorder: { path: '/reorder', method: 'POST', auth: true, description: 'Reorder certifications' },
  }
} as const;

// ============================================================================
// EDUCATION ROUTES
// ============================================================================

export const EducationRoutes = {
  domain: 'Education',
  description: 'Manage education history',
  base: '/api/education',
  routes: {
    create: { path: '/new', method: 'POST', auth: true, description: 'Create new education entry' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific education entry' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update education entry' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete education entry' },
  }
} as const;

// ============================================================================
// EXPERIENCE ROUTES
// ============================================================================

export const ExperienceRoutes = {
  domain: 'Experience',
  description: 'Manage work experience entries',
  base: '/api/experience',
  routes: {
    list: { path: '/experiences', method: 'GET', auth: false, description: 'Get all experiences' },
    create: { path: '/experience/new', method: 'POST', auth: true, description: 'Create new experience' },
    get: { path: '/experience/[id]', method: 'GET', auth: false, description: 'Get specific experience' },
    update: { path: '/experience/[id]/update', method: 'PUT', auth: true, description: 'Update experience' },
    delete: { path: '/experience/[id]/delete', method: 'DELETE', auth: true, description: 'Delete experience' },
    reorder: { path: '/experiences/reorder', method: 'POST', auth: true, description: 'Reorder experiences' },
  }
} as const;

// ============================================================================
// INTERNSHIP ROUTES
// ============================================================================

export const InternshipRoutes = {
  domain: 'Internships',
  description: 'Manage internship experiences',
  base: '/api/internship',
  routes: {
    create: { path: '/new', method: 'POST', auth: true, description: 'Create new internship' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific internship' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update internship' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete internship' },
  }
} as const;

// ============================================================================
// LANGUAGE ROUTES
// ============================================================================

export const LanguageRoutes = {
  domain: 'Languages',
  description: 'Manage language proficiencies',
  base: '/api/languages',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all languages' },
    create: { path: '/new', method: 'POST', auth: true, description: 'Add new language' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific language' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update language' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete language' },
    reorder: { path: '/reorder', method: 'POST', auth: true, description: 'Reorder languages' },
  }
} as const;

// ============================================================================
// PROJECT ROUTES
// ============================================================================

export const ProjectRoutes = {
  domain: 'Projects',
  description: 'Manage portfolio projects',
  base: '/api/projects',
  routes: {
    list: { path: '/projects', method: 'GET', auth: false, description: 'Get all projects' },
    create: { path: '/project/create', method: 'POST', auth: true, description: 'Create new project' },
    get: { path: '/project/[id]', method: 'GET', auth: false, description: 'Get specific project' },
    update: { path: '/project/[id]/update', method: 'PUT', auth: true, description: 'Update project' },
    delete: { path: '/project/[id]/delete', method: 'DELETE', auth: true, description: 'Delete project' },
    reorder: { path: '/projects/reorder', method: 'POST', auth: true, description: 'Reorder projects' },
    unflagAll: { path: '/projects/unflag-all', method: 'POST', auth: true, description: 'Remove featured status from all projects' },
  }
} as const;

// ============================================================================
// SPECIALTY ROUTES
// ============================================================================

export const SpecialtyRoutes = {
  domain: 'Specialties',
  description: 'Manage specialty/skills sections',
  base: '/api/specialties',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all specialties' },
    create: { path: '/new', method: 'POST', auth: true, description: 'Create new specialty' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific specialty' },
    update: { path: '/[id]/update', method: 'PUT', auth: true, description: 'Update specialty' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete specialty' },
    reorder: { path: '/reorder', method: 'POST', auth: true, description: 'Reorder specialties' },
  }
} as const;

// ============================================================================
// TOOL/SKILL ROUTES
// ============================================================================

export const ToolRoutes = {
  domain: 'Tools/Skills',
  description: 'Manage tools and skills',
  base: '/api/tools',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all tools' },
    get: { path: '/[id]', method: 'GET', auth: false, description: 'Get specific tool' },
    delete: { path: '/[id]/delete', method: 'DELETE', auth: true, description: 'Delete tool' },
    reorder: { path: '/reorder', method: 'POST', auth: true, description: 'Reorder tools' },
    categories: { path: '/tool-categories', method: 'GET', auth: false, description: 'Get tool categories' },
    reorderCategories: { path: '/tool-categories/reorder', method: 'POST', auth: true, description: 'Reorder tool categories' },
  }
} as const;

// ============================================================================
// CV/RESUME ROUTES
// ============================================================================

export const CvRoutes = {
  domain: 'CV/Resume',
  description: 'Manage CV and resume files',
  base: '/api/cv',
  routes: {
    upload: { path: '/upload', method: 'POST', auth: true, description: 'Upload resume/CV file' },
    delete: { path: '/delete', method: 'DELETE', auth: true, description: 'Delete resume/CV file' },
    contact: { path: '/contact', method: 'POST', auth: false, description: 'Contact form submission' },
  }
} as const;

// ============================================================================
// FILE UPLOAD ROUTES
// ============================================================================

export const UploadRoutes = {
  domain: 'File Upload',
  description: 'Handle file uploads and management',
  base: '/api/upload',
  routes: {
    upload: { path: '/', method: 'POST', auth: true, description: 'General file upload' },
    certificationPdf: { path: '/certification-pdf', method: 'POST', auth: true, description: 'Upload certification PDF' },
    delete: { path: '/file/delete', method: 'POST', auth: true, description: 'Delete uploaded file' },
  }
} as const;

// ============================================================================
// SOCIAL LINKS ROUTES
// ============================================================================

export const SocialLinkRoutes = {
  domain: 'Social Links',
  description: 'Manage social media links',
  base: '/api/social-links',
  routes: {
    list: { path: '/', method: 'GET', auth: false, description: 'Get all social links' },
    update: { path: '/[id]', method: 'PUT', auth: true, description: 'Update social link' },
  }
} as const;

// ============================================================================
// USER ROUTES
// ============================================================================

export const UserRoutes = {
  domain: 'User',
  description: 'User profile management',
  base: '/api/user',
  routes: {
    profile: { path: '/', method: 'GET', auth: false, description: 'Get user profile' },
  }
} as const;

// ============================================================================
// QUICK FACTS ROUTES
// ============================================================================

export const QuickFactsRoutes = {
  domain: 'Quick Facts',
  description: 'Quick statistics and facts',
  base: '/api/quick-facts',
  routes: {
    get: { path: '/', method: 'GET', auth: false, description: 'Get quick facts/stats' },
  }
} as const;

// ============================================================================
// AUTH ROUTES
// ============================================================================

export const AuthRoutes = {
  domain: 'Authentication',
  description: 'NextAuth.js authentication routes',
  base: '/api/auth',
  routes: {
    nextAuth: { path: '/[...nextauth]', method: 'ALL', auth: false, description: 'NextAuth.js handlers (login, logout, session)' },
  }
} as const;

// ============================================================================
// MASTER EXPORT
// ============================================================================

/**
 * Complete API Registry
 * Import this to get all API routes organized by domain
 */
export const API_REGISTRY = {
  about: AboutRoutes,
  approach: ApproachRoutes,
  certifications: CertificationRoutes,
  education: EducationRoutes,
  experience: ExperienceRoutes,
  internship: InternshipRoutes,
  languages: LanguageRoutes,
  projects: ProjectRoutes,
  specialties: SpecialtyRoutes,
  tools: ToolRoutes,
  cv: CvRoutes,
  upload: UploadRoutes,
  socialLinks: SocialLinkRoutes,
  user: UserRoutes,
  quickFacts: QuickFactsRoutes,
  auth: AuthRoutes,
} as const;

/**
 * Route Counts by Type
 */
export const ROUTE_STATS = {
  total: 65,
  public: 20,
  protected: 45,
  domains: 16,
} as const;

/**
 * Authentication Summary
 * All POST/PUT/DELETE operations require authentication
 * GET operations are mostly public (except sensitive data)
 */
export const AUTH_POLICY = {
  read: 'Mostly public (GET requests)',
  write: 'Protected (POST, PUT, DELETE)',
  admin: 'Protected (all admin routes)',
  authMethod: 'NextAuth.js session-based',
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * @example
 * // Import specific route group
 * import { ProjectRoutes } from './manifest';
 *
 * // Get project creation route
 * const createRoute = ProjectRoutes.routes.create;
 * // { path: '/project/create', method: 'POST', auth: true }
 *
 * @example
 * // Import full registry
 * import { API_REGISTRY } from './manifest';
 *
 * // Iterate over all domains
 * Object.entries(API_REGISTRY).forEach(([domain, config]) => {
 *   console.log(`${domain}: ${config.description}`);
 * });
 *
 * @example
 * // Check if route requires auth
 * import { API_REGISTRY } from './manifest';
 *
 * const requiresAuth = API_REGISTRY.projects.routes.create.auth;
 * // true
 */

// Default export for convenience
export default API_REGISTRY;
