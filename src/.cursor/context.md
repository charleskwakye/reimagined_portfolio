# Portfolio Project - AI Agent Context

> **Purpose**: This file helps LLM agents (Cursor, Claude, etc.) understand the codebase instantly.
> **Last Updated**: 2025-01-30
> **Phase 1 Complete**: Debloating finished

## Project Overview

A modern, responsive portfolio website built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL**. Features a flexible content block system for showcasing projects, experience, and skills.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3 + shadcn/ui components
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma 6.5
- **File Storage**: Vercel Blob
- **Authentication**: NextAuth.js 4
- **Testing**: Vitest 4 + MSW + Factory Pattern

## Directory Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (routes)/           # Page routes (grouped)
│   ├── api/                # API routes (65 total)
│   │   ├── about/
│   │   ├── approach/
│   │   ├── certifications/
│   │   ├── education/
│   │   ├── experience/
│   │   ├── internship/
│   │   ├── languages/
│   │   ├── projects/
│   │   ├── specialties/
│   │   ├── tools/
│   │   ├── cv/
│   │   ├── upload/
│   │   └── auth/
│   ├── admin/              # Admin dashboard
│   └── ...                 # Public pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── content-blocks/    # Content block components
│   └── ...                # Page components
├── lib/                    # Utilities & configuration
│   ├── actions/           # Server Actions
│   │   ├── user.ts        # 16 data fetching functions
│   │   └── admin.ts       # 9 CRUD functions
│   ├── db.ts              # Prisma client (singleton)
│   ├── utils.ts           # Utility functions
│   ├── auth.ts            # NextAuth config
│   ├── auth-utils.ts      # Auth helpers
│   ├── types.ts           # TypeScript types
│   ├── userPreferences.ts # User preferences logic
│   └── local-storage.ts   # Vercel Blob operations
├── __tests__/             # Test infrastructure
│   ├── integration/       # Database integration tests
│   │   ├── projects.test.ts
│   │   ├── internships.test.ts
│   │   └── certifications.test.ts
│   ├── factories/         # Test data factories
│   │   ├── index.ts
│   │   ├── user.factory.ts
│   │   ├── project.factory.ts
│   │   ├── internship.factory.ts
│   │   └── certification.factory.ts
│   ├── mocks/             # MSW handlers
│   │   ├── handlers.ts
│   │   └── server.ts
│   └── setup.ts           # Vitest setup & DB isolation
├── contexts/              # React contexts
└── hooks/                 # Custom React hooks

prisma/
├── schema.prisma          # Database schema
├── seed.ts               # Database seeding
└── migrations/           # Migration files

public/                   # Static assets
```

## Database Schema (Prisma)

### Core Entities
- **User**: Profile, about, intro, resumeUrl
- **SocialLink**: Platform, url, order
- **Language**: Name, proficiency level
- **Skill/Tool**: Name, category, proficiency
- **Experience**: Company, role, dates, bullets
- **Education**: Institution, degree, dates
- **Project**: Title, description, featured, order, contentBlocks (JSON)
- **Internship**: Similar to Project
- **Certification**: Name, org, year, pdfUrl, url
- **Specialty**: Title, description, featured
- **AboutSection**: Title, content, order
- **ApproachItem**: Title, description, order
- **UserPreference**: Key-value store for user settings

### Key Relationships
- All entities belong to User (userId foreign key)
- Projects & Internships have flexible contentBlocks (JSON array)
- UserPreference stores ordering and display preferences

## API Route Patterns

### RESTful Structure
```
GET    /api/[entity]           # List all
POST   /api/[entity]/new        # Create
GET    /api/[entity]/[id]       # Get one
PUT    /api/[entity]/[id]/update # Update
DELETE /api/[entity]/[id]/delete # Delete
POST   /api/[entity]/reorder     # Reorder items
```

### Auth Middleware
Most write operations require authentication via NextAuth session.

## Testing Infrastructure

### Factory Pattern
Test data creation using Faker.js:
```typescript
// Example usage
const f = getAllFactories(tx)
const user = await f.user.create()
const project = await f.project.create(user.id, { title: 'Custom' })
```

**Available Factories** (4 of 13):
- `user.create(overrides?)`
- `project.create(userId, overrides?)`
- `internship.create(userId, overrides?)`
- `certification.create(userId, overrides?)`

### Database Isolation
Tests use transaction-based rollback:
```typescript
await testWithDatabase(async (tx) => {
  // All operations auto-rollback after test
})
```

### Test Organization
```
src/__tests__/
├── integration/     # Database integration tests
├── api/            # API route tests (planned)
├── unit/           # Unit tests (planned)
├── factories/      # Test data factories
└── mocks/          # MSW handlers
```

## Coding Conventions

### Imports
- **Always use `@/` alias** (never relative paths like `../../lib/`)
- Examples:
  ```typescript
  import { prisma } from '@/lib/db'
  import { User } from '@/lib/types'
  import { getUserProfile } from '@/lib/actions/user'
  ```

### Server Actions
- Located in `src/lib/actions/`
- Use `'use server'` directive
- Return null or empty array on error (never throw to UI)
- Log errors to console for debugging

### Database Operations
- Use Prisma client from `@/lib/db`
- Handle Vercel Postgres connection retries (already configured in db.ts)
- Use transactions for multi-step operations

### TypeScript
- Strict mode enabled
- All functions should have return types
- Use Zod for runtime validation

## Common Patterns

### API Route Handler
```typescript
// src/app/api/entity/new/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await request.json()
    // Validate with Zod
    // Create in database
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

### Server Action
```typescript
// src/lib/actions/user.ts
'use server'

import { prisma } from '@/lib/db'

export async function getUserProfile(): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({
      include: { SocialLink: true }
    })
    return user as User
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}
```

## Critical Files to Know

### Database
- `src/lib/db.ts` - Prisma client singleton with retry logic
- `prisma/schema.prisma` - Database schema definition

### Actions (Server Functions)
- `src/lib/actions/user.ts` - 16 data fetching functions
- `src/lib/actions/admin.ts` - 9 CRUD functions

### Utilities
- `src/lib/utils.ts` - `cn()` (Tailwind merge), file operations
- `src/lib/auth-utils.ts` - `withAuth()`, `getCurrentSession()`
- `src/lib/userPreferences.ts` - User preference management

### Testing
- `src/__tests__/setup.ts` - Test database isolation
- `src/__tests__/factories/index.ts` - Factory exports

## Known Gotchas

1. **Database in Tests**: Always use `tx` (transaction) parameter in tests, never the global `prisma` client
2. **Vercel Postgres**: Uses connection pooling, singleton Prisma client handles this
3. **File Storage**: Uses Vercel Blob, not AWS S3 (removed unused dependencies)
4. **Content Blocks**: Stored as JSON in database, validated at runtime
5. **User Isolation**: All data is scoped to a single user (findFirst() pattern used)

## Environment Variables

Required:
```bash
DATABASE_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
NEXTAUTH_SECRET="secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="secure_password"
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint

# Database
npm run db:migrate       # Apply migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database (danger!)

# Testing
npm test                 # Run tests once
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:ui          # Visual test runner

# Verification
npm run verify           # Lint + typecheck + test (custom)
```

## Documentation Structure (Post-Debloat)

```
root/
├── README.md                 # Main project guide
├── TECHNICAL_GUIDE.md        # Architecture details
├── CONTENT_BLOCKS_GUIDE.md   # Content system
├── TROUBLESHOOTING.md        # Common issues (trimmed)
├── docs/
│   ├── ARCHIVE/             # Historical docs
│   │   ├── VITEST_MIGRATION.md
│   │   └── IMPLEMENTATION_SUMMARY.md
│   ├── scripts/             # Utility scripts
│   └── AUTH.md              # Auth documentation
└── src/.cursor/
    └── context.md           # This file
```

## Current Test Coverage

**Integration Tests**: 24 tests across 3 entities
- ✅ Projects (7 tests)
- ✅ Internships (8 tests)  
- ✅ Certifications (9 tests)

**Untested** (Phase 4 will address):
- 62 API routes (95% untested)
- 47 library functions (0% tested)
- 46 React components (0% tested)
- 9 missing test factories

## Next Development Phases

### Phase 2: Codebase Understandability
- Add JSDoc to all functions
- Create API route manifest
- Standardize patterns

### Phase 3: Modernization  
- Update dependencies
- Optimize configurations

### Phase 4: Testing Expansion
- Create 9 missing factories
- Write API tests for 62 routes
- Write unit tests for 47 functions
- Target: 85%+ coverage

## Tips for LLM Agents

1. **Always check existing patterns** in similar files before implementing new features
2. **Use factories** for any database operations in tests
3. **Follow the error handling pattern**: Log to console, return null/empty for UI
4. **Import from `@/`** - never use relative paths beyond one level
5. **Database changes** should support transaction rollback for testing
6. **Content blocks** are JSON arrays with type/discriminator pattern
7. **Single user assumption** - most queries use `findFirst()` not `findUnique()`

## Questions?

If you need clarification:
1. Check TECHNICAL_GUIDE.md for architecture details
2. Check existing similar implementations in the codebase
3. Review the test factories for data patterns
4. This file is updated after major changes
