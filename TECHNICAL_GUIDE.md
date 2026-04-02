# Portfolio Website Technical Guide

This document provides comprehensive technical documentation for the portfolio website application, covering architecture, components, APIs, and functionality.

## System Architecture

### Core Technologies

- **Next.js 14+**: React framework with App Router architecture
- **TypeScript**: Strongly-typed JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **PostgreSQL**: Relational database for data storage
- **Prisma ORM**: Database access and schema management
- **Shadcn UI**: Component library based on Radix UI
- **Vercel Blob Storage**: For storing images, documents, and other files

### Architecture Overview

The application follows a modern Next.js App Router architecture:

- **Server Components**: Most UI is rendered as React Server Components
- **Client Components**: Interactive elements use Client Components
- **API Routes**: Server-side functionality is handled through API routes
- **Database Access**: Centralized through Prisma Client
- **Authentication**: Simple admin access control for content management

## Database Schema

### Primary Models

- **User**: Core profile information
- **SocialLink**: Social media profiles
- **Experience**: Work experience entries
- **Education**: Educational background
- **Project**: Portfolio projects with content blocks (includes ordering field)
- **Internship**: Internship experiences with content blocks
- **Language**: Language proficiencies
- **Tool**: Tools and technologies used
- **Specialty**: Areas of expertise
- **AboutSection**: Dynamic about page sections
- **ApproachItem**: Professional approach items

## Project Ordering System

The application implements a sophisticated project ordering system that controls how projects are displayed across the site:

### Database Structure
- Each project includes an `order` field (integer) in the database
- Lower values appear first in the display order

### Sorting Logic
Projects are sorted using a consistent algorithm across the application:
1. First by `order` field (ascending)
2. Then by `featured` status (featured projects first)
3. Finally by `createdAt` date (newest first)

### Admin Interface
- The admin dashboard provides UI controls for reordering projects
- Up/down arrows allow changing project positions
- Project order is persisted via the `/api/projects/reorder` endpoint

### Implementation
- Sorting is managed in both server components and client components
- Type safety ensures correct order comparisons even with missing data
- The same sorting logic is used on all project listing pages

## API Routes

### Admin API Endpoints

- **`/api/user`**: Manage user profile
  - `GET`: Get user profile
  - `POST`: Create user profile
  - `PUT`: Update user profile

- **`/api/social-links`**: Manage social links
  - `GET`: Get all social links
  - `POST`: Create new social link
  - `PUT`: Update social link
  - `DELETE`: Delete social link

- **`/api/projects`**: Manage portfolio projects
  - `GET`: Get all projects or single project
  - `POST`: Create new project
  - `PUT`: Update project
  - `DELETE`: Delete project

- **`/api/projects/reorder`**: Manage project display order
  - `POST`: Update order values for multiple projects at once

- **`/api/experiences`**: Manage work experiences
  - `GET`: Get all experiences
  - `POST`: Create new experience
  - `PUT`: Update experience
  - `DELETE`: Delete experience

- **`/api/education`**: Manage education entries
  - `GET`: Get all education entries
  - `POST`: Create new education entry
  - `PUT`: Update education entry
  - `DELETE`: Delete education entry

- **`/api/internships`**: Manage internship experiences
  - `GET`: Get all internships
  - `POST`: Create new internship
  - `PUT`: Update internship
  - `DELETE`: Delete internship

- **`/api/languages`**: Manage language proficiencies
  - `GET`: Get all languages
  - `POST`: Create new language
  - `PUT`: Update language
  - `DELETE`: Delete language

- **`/api/tools`**: Manage tools and technologies
  - `GET`: Get all tools
  - `POST`: Create new tool
  - `PUT`: Update tool
  - `DELETE`: Delete tool

- **`/api/specialties`**: Manage specialty areas
  - `GET`: Get all specialties
  - `POST`: Create new specialty
  - `PUT`: Update specialty
  - `DELETE`: Delete specialty

- **`/api/about-sections`**: Manage about page sections
  - `GET`: Get all about sections
  - `POST`: Create new about section
  - `PUT`: Update about section
  - `DELETE`: Delete about section

- **`/api/approach-items`**: Manage approach items
  - `GET`: Get all approach items
  - `POST`: Create new approach item
  - `PUT`: Update approach item
  - `DELETE`: Delete approach item

### Utility API Endpoints

- **`/api/upload`**: Handle file uploads to Vercel Blob Storage
  - `POST`: Upload a file and return its URL

## Key Components

### Document Viewer Component

The **DocumentViewer** component provides a standardized interface for viewing documents and PowerPoint presentations across the application:

- **Features**:
  - Consistent UI for both document and PowerPoint content
  - Control buttons for opening, downloading, and toggling embedded view
  - Responsive design optimized for all screen sizes
  - Loading state indicators for better user experience
  - Error handling for unavailable documents

- **Implementation**:
  - Located at `src/components/DocumentViewer.tsx`
  - Used by the ContentBlockRenderer for rendering document and PowerPoint blocks
  - Automatically detects document type and uses appropriate embed URL
  - Primarily uses Google Docs Viewer for consistent rendering

- **Props**:
  - `url`: URL of the document to display
  - `title`: Title of the document
  - `caption`: Optional caption text
  - `isPowerPoint`: Boolean indicating if it's a PowerPoint presentation
  - `initialShowEmbed`: Boolean for initial embed visibility state

### Content Blocks System

The content block system allows for flexible content creation:

- **ContentBlockEditor**: UI for creating and editing content blocks
- **ContentBlockRenderer**: Component for displaying content blocks
- **content-blocks.ts**: Type definitions for content blocks

See the detailed [Content Blocks Guide](./CONTENT_BLOCKS_GUIDE.md) for more information.

### Project Cards

Project cards are used to display portfolio projects on the homepage:

- **ProjectCard**: Regular project card component
- **FeaturedProjectCard**: Enhanced card for featured projects

Properties:
- Title, short description, cover image
- Technologies used (displayed as tags)
- Links to GitHub and demo
- Featured status for special display

### Admin Forms

Form components for managing content in the admin dashboard:

- **UserForm**: Edit user profile information
- **SocialLinkForm**: Add/edit social links
- **ProjectForm**: Create/edit projects with content blocks
- **ExperienceForm**: Add/edit work experiences
- **EducationForm**: Add/edit education entries
- **InternshipForm**: Create/edit internships with content blocks
- **LanguageForm**: Add/edit language proficiencies
- **ToolForm**: Add/edit tools and technologies
- **SpecialtyForm**: Add/edit specialty areas
- **AboutSectionForm**: Add/edit about page sections
- **ApproachItemForm**: Add/edit approach items

## Data Flow

### Creating/Editing Content

1. User fills out form in admin dashboard
2. Client component collects form data
3. Form data is sent to appropriate API endpoint
4. API validates the data and performs database operation
5. Response is returned to client
6. UI updates to reflect changes

### Content Display

1. Page component fetches data from database using Prisma
2. Data is passed to appropriate display components
3. Display components render content (e.g., ProjectCard, ContentBlockRenderer)
4. For interactive elements, client components handle user interactions

## File Storage System

The application uses Vercel Blob Storage for file management:

- **Image Upload**: Profile images, project covers, content block images
- **Document Upload**: Resumes, project documents, presentations
- **Storage Management**: Files are stored with unique IDs

Upload Process:
1. File is selected in UI
2. File is sent to `/api/upload` endpoint
3. File is uploaded to Vercel Blob Storage
4. URL is returned and saved to database

## Import/Export Functionality

### Project Import

The system includes a script for importing projects from CSV:

- **Location**: `src/scripts/import-projects.ts`
- **Usage**: `npx tsx src/scripts/import-projects.ts`
- **Functionality**: 
  - Reads CSV file with project data
  - Transforms data into appropriate format
  - Checks for duplicates
  - Creates new projects in database

## Theme System

The application supports dark and light modes:

- **Theme Provider**: Wraps the application to provide theme context
- **Theme Toggle**: UI component for switching between themes
- **System Preference**: Detects and uses system color scheme preference

## Responsive Design

The application is designed to work on all screen sizes:

- **Mobile-first**: Base styles target mobile devices
- **Responsive breakpoints**: Styles adapt at sm, md, lg, xl breakpoints
- **Flexible layouts**: Components resize appropriately for different devices
- **Mobile optimization**: Document viewers and content blocks adjust to maximize space on small screens

## Standardized UI Across Sections

The application now features a standardized UI across project and internship detail pages:

- **Consistent Content Layout**: Both sections use the same card-based layout for content
- **Unified Document Viewing**: The same DocumentViewer component is used in both sections
- **Responsive Design**: Both sections share the same mobile optimizations
- **Navigation Elements**: Both sections have consistent "Back to" navigation links
- **Visual Styling**: Both use the same background patterns, spacing, and typography

## Known Issues and Solutions

### Embed Toggle Behavior

**Issue**: The "Show on page" toggle for documents and presentations may not update correctly if clicked on the label instead of the button itself.

**Solution**: 
- When toggling embed visibility, click directly on the toggle button
- The custom button component ensures proper state management
- Boolean conversion is applied to ensure correct data type

### Project Card Alignment

**Issue**: Project cards may appear misaligned due to varying short description lengths.

**Solution**:
- Try to keep short descriptions similar in length
- Consider using a fixed height or flexible container for cards
- Use grid layout with equal height settings

## Development Workflows

### Adding a New Feature

1. Create necessary database model updates (if needed)
2. Run Prisma migrations: `npx prisma migrate dev --name feature_name`
3. Create or update API routes
4. Implement UI components
5. Add any new admin dashboard controls
6. Test functionality

### Debugging Tips

- Use developer tools console for client-side debugging
- Check API responses with network tab
- For server components, use `console.log` statements (visible in server logs)
- Prisma Studio (`npx prisma studio`) for database inspection

## Performance Considerations

- **Image Optimization**: Use Next.js Image component for optimized images
- **Server Components**: Utilize where possible to reduce JavaScript bundle size
- **API Caching**: Cache API responses for frequently accessed data
- **Database Indexes**: Key fields are indexed for better query performance 