# API Routes Documentation

> **Location**: `src/app/api/`  
> **Framework**: Next.js App Router  
> **Total Routes**: 65 across 16 domains

## Overview

All API routes follow RESTful conventions with consistent patterns:

```
GET    /api/[entity]              # List all
POST   /api/[entity]/new          # Create
GET    /api/[entity]/[id]         # Get one
PUT    /api/[entity]/[id]/update  # Update
DELETE /api/[entity]/[id]/delete  # Delete
POST   /api/[entity]/reorder      # Reorder items
```

## Authentication

- **Public routes**: GET requests for reading data
- **Protected routes**: POST, PUT, DELETE for mutations
- **Auth method**: NextAuth.js session-based

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... handle request
}
```

## Route Registry

See [manifest.ts](./manifest.ts) for the complete registry with all routes, methods, and auth requirements.

### Quick Reference

| Domain | Base Path | Routes | Auth Required |
|--------|-----------|--------|---------------|
| About | `/api/about` | 5 | Create/Update/Delete |
| Approach | `/api/approach` | 5 | Create/Update/Delete |
| Certifications | `/api/certifications` | 6 | Create/Update/Delete/Reorder |
| Education | `/api/education` | 4 | All operations |
| Experience | `/api/experience` | 6 | Create/Update/Delete/Reorder |
| Internship | `/api/internship` | 4 | All operations |
| Languages | `/api/languages` | 6 | Create/Update/Delete/Reorder |
| Projects | `/api/projects` | 7 | All operations |
| Specialties | `/api/specialties` | 6 | Create/Update/Delete/Reorder |
| Tools | `/api/tools` | 6 | Create/Update/Delete/Reorder |
| CV | `/api/cv` | 3 | Upload/Delete |
| Upload | `/api/upload` | 3 | All operations |
| Social Links | `/api/social-links` | 2 | Update |
| User | `/api/user` | 1 | None (read-only) |
| Quick Facts | `/api/quick-facts` | 1 | None |
| Auth | `/api/auth` | 1 | NextAuth handlers |

## Route Patterns

### Standard CRUD Route

```typescript
// src/app/api/projects/new/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request
    const data = await request.json();
    
    // Validate (using Zod)
    // const validated = projectSchema.parse(data);
    
    // Get user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create record
    const project = await prisma.project.create({
      data: { ...data, userId: user.id }
    });
    
    // Revalidate cache
    revalidatePath('/projects');
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Public Read Route

```typescript
// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json([]);
    }
    
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}
```

### Dynamic Route with ID

```typescript
// src/app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ... fetch by id
}
```

## File Upload Routes

### General Upload
- **POST** `/api/upload` - Upload any file

### Certification PDF
- **POST** `/api/upload/certification-pdf` - Upload certification PDF

### File Deletion
- **POST** `/api/file/delete` - Delete uploaded file

```typescript
// Upload example
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { /* entity data */ }
}
```

### Error
```json
{
  "error": "Error message",
  "details": "Optional details"
}
```

## Error Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no session)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

Test routes using the test suite:

```bash
# Run API tests
npm test

# Test specific route file
npm test -- api.projects.test.ts
```

Or use the factory pattern in tests:

```typescript
import { testWithDatabase } from '@/__tests__/setup';
import { getAllFactories } from '@/__tests__/factories';

describe('Projects API', () => {
  it('creates a project', async () => {
    await testWithDatabase(async (tx) => {
      const f = getAllFactories(tx);
      const user = await f.user.create();
      
      // Test API call
      const response = await fetch('/api/project/create', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', ... })
      });
      
      expect(response.status).toBe(200);
    });
  });
});
```

## Security

1. **Always validate session** on mutation routes
2. **Validate input data** using Zod schemas
3. **Sanitize user input** before database operations
4. **Rate limiting** recommended for production
5. **CORS** configured in next.config.mjs

## Performance

1. Use `revalidatePath()` to update static pages
2. Cache GET responses when appropriate
3. Use database indexes for frequent queries
4. Optimize file uploads (compress images, validate size)

## API Manifest

Import the manifest for programmatic access:

```typescript
import { API_REGISTRY, ROUTE_STATS } from './manifest';

// Get all routes
console.log(ROUTE_STATS);
// { total: 65, public: 20, protected: 45, domains: 16 }

// Check if route requires auth
const requiresAuth = API_REGISTRY.projects.routes.create.auth;
// true
```

## Related Documentation

- [API Manifest](./manifest.ts) - Complete route registry
- [Library Module](../lib/README.md) - Server actions
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [NextAuth.js](https://next-auth.js.org/)

---

**Last Updated**: 2025-01-30  
**Total Routes**: 65  
**Maintainer**: Project Team
