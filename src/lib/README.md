# Library Module Documentation

> **Location**: `src/lib/`  
> **Purpose**: Core utilities, database client, and server actions

## Module Overview

This directory contains the core business logic and utilities for the portfolio application:

- **actions/**: Server Actions for data fetching and mutations
- **db.ts**: Prisma client singleton
- **auth.ts**: NextAuth.js configuration
- **utils.ts**: General utility functions
- **types.ts**: TypeScript type definitions

## Quick Reference

### Import Patterns

Always use the `@/` alias:

```typescript
// Database
import { prisma } from '@/lib/db';

// Server Actions
import { getUserProfile } from '@/lib/actions/user';
import { createUserProfile } from '@/lib/actions/admin';

// Utilities
import { cn } from '@/lib/utils';

// Types
import { User, Project } from '@/lib/types';
```

## File Descriptions

### `actions/user.ts`
Data fetching functions for the public-facing site.

**16 Functions**:
- `getUserProfile()` - Get main profile with social links
- `getUserLanguages()` - Get language proficiencies
- `getUserSkills()` - Get skills grouped by category
- `getUserTools()` - Get tools with custom ordering
- `getUserCertifications()` - Get certifications with ordering
- `getUserSpecialties()` - Get specialties with ordering
- `getUserAboutSections()` - Get about page sections
- `getUserApproachItems()` - Get approach items
- `getUserExperience()` - Get work experience
- `getUserEducation()` - Get education history
- `getFeaturedProjects()` - Get featured projects (max 3)
- `getAllProjects()` - Get all projects
- `getProjectById(id)` - Get specific project
- `getInternships()` - Get all internships
- `getInternshipById(id)` - Get specific internship

All functions return `Promise<T>` and handle errors gracefully.

### `actions/admin.ts`
Admin-only server actions for CRUD operations.

**9 Functions**:
- `createUserProfile(data)` - Create/update user profile
- `addSocialLink(data)` - Add social media link
- `addSkill(data)` - Add skill/tool
- `addExperience(data)` - Add work experience
- `addEducation(data)` - Add education entry
- `addProject(data)` - Add project
- `addInternship(data)` - Add internship
- `addLanguage(data)` - Add language
- `updateResumeUrl(url)` - Update resume URL

All functions return `{ success: boolean, data?: T, error?: string }`.

### `db.ts`
Prisma client singleton with serverless database retry logic.

**Key Features**:
- Singleton pattern (prevents connection exhaustion)
- Retry logic for transient connection errors
- Vercel Postgres optimized

```typescript
import { prisma } from '@/lib/db';

// Usage
const user = await prisma.user.findFirst();
```

### `utils.ts`
General utility functions.

**Functions**:
- `cn(...inputs)` - Merge Tailwind classes
- `deleteVercelBlobFile(url)` - Delete file from storage
- `convertToYouTubeEmbedUrl(url)` - Convert YouTube URL to embed format

### `auth.ts`
NextAuth.js configuration.

**Exports**:
- `authOptions` - NextAuth configuration object

### `auth-utils.ts`
Authentication helper functions.

**Functions**:
- `withAuth(callback)` - Protect server components
- `getCurrentSession()` - Get current session

### `userPreferences.ts`
User preferences management.

**Functions**:
- `getUserPreference(userId, key)` - Get preference value
- `setUserPreference(userId, key, value)` - Set preference
- `deleteUserPreference(userId, key)` - Delete preference
- `getCertificationOrder(userId)` - Get certification ordering
- `setCertificationOrder(userId, orderMap)` - Set certification ordering
- `getExperienceOrder(userId)` - Get experience ordering
- `setExperienceOrder(userId, orderMap)` - Set experience ordering
- `getContactInfo(userId)` - Get contact info
- `setContactInfo(userId, contactInfo)` - Set contact info

### `types.ts`
TypeScript type definitions for all data models.

**Types**:
- `User`
- `SocialLink`
- `Language`
- `Skill`
- `Experience`
- `Education`
- `Project`
- `Internship`
- `Certification`
- `Specialty`
- `AboutSection`
- `ApproachItem`
- `UserPreference`

## Usage Examples

### Fetching Data

```typescript
'use server';

import { getUserProfile, getFeaturedProjects } from '@/lib/actions/user';

export async function loadHomepageData() {
  const [user, projects] = await Promise.all([
    getUserProfile(),
    getFeaturedProjects()
  ]);
  
  return { user, projects };
}
```

### Admin Operations

```typescript
'use server';

import { addProject } from '@/lib/actions/admin';

export async function createProject(formData: FormData) {
  const result = await addProject({
    title: formData.get('title') as string,
    shortDesc: formData.get('shortDesc') as string,
    technologies: ['React', 'TypeScript'],
    featured: true,
    contentBlocks: []
  });
  
  if (result.success) {
    return { message: 'Project created!' };
  } else {
    return { error: result.error };
  }
}
```

### Database Queries

```typescript
import { prisma } from '@/lib/db';

// Direct Prisma usage (rarely needed)
const user = await prisma.user.findFirst({
  include: {
    SocialLink: true,
    projects: true
  }
});
```

## Error Handling

All functions follow consistent error handling:

- **Data fetching**: Return `null` or `[]` on error, log to console
- **Admin actions**: Return `{ success: false, error: string }` on error
- **Never throw errors to the UI layer**

## Database Patterns

### User Isolation
All queries assume single-user portfolio:

```typescript
const user = await prisma.user.findFirst();
// All subsequent queries use user.id
```

### Ordering
Many entities support custom ordering via UserPreferences:

```typescript
// 1. Try to get custom order from preferences
const orderPreference = await prisma.userPreference.findUnique({...});

// 2. Apply custom order or default sorting
if (orderPreference) {
  // Apply custom order
} else {
  // Default sort (e.g., by date)
}
```

## Testing

When testing functions in this module:

1. Use the test factories from `src/__tests__/factories/`
2. Wrap tests in `testWithDatabase()` for transaction isolation
3. Mock external services (Vercel Blob, etc.)

See `src/__tests__/integration/` for examples.

## Best Practices

1. ✅ Always use `@/` imports, never relative paths
2. ✅ Return null/empty on errors, never throw
3. ✅ Log errors to console for debugging
4. ✅ Use transactions for multi-step operations
5. ✅ Cache with `revalidatePath()` after mutations
6. ❌ Don't use `prisma` directly in components (use actions)
7. ❌ Don't expose database IDs in error messages

## Related Documentation

- [API Routes](../app/api/README.md)
- [Database Schema](../../prisma/schema.prisma)
- [AI Context](../.cursor/context.md)

---

**Last Updated**: 2025-01-30  
**Maintainer**: Project Team
