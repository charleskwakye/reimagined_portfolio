# Charles Kwakye | Professional Portfolio

A modern, professional portfolio website built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL**. Features a clean corporate design system, dynamic content management, and responsive layouts.

## ✨ Features

- **Professional Design System** — Corporate-grade UI with gradient accents, smooth animations, and glass morphism effects
- **Modern Tech Stack** — Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS
- **Database Integration** — PostgreSQL with Prisma ORM for content management
- **File Storage** — Vercel Blob for profile photos and document uploads
- **Responsive Design** — Mobile-first approach with fluid typography and adaptive layouts
- **Dark/Light Mode** — Theme toggle with system preference detection and smooth transitions
- **Dynamic Content Blocks** — Flexible rendering system for text, images, videos, code, PDFs, and more
- **Admin Dashboard** — Full CRUD operations for managing portfolio content
- **Authentication** — NextAuth.js for secure admin access
- **Internationalization** — Multi-language support with context-based translations
- **SEO Optimized** — Meta tags, Open Graph, structured data, and semantic HTML
- **Performance** — Static generation, on-demand revalidation, and optimized image loading
- **Accessibility** — WCAG-compliant contrast ratios, keyboard navigation, and ARIA labels

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 3 + CSS Variables |
| **Components** | shadcn/ui + Radix UI |
| **Database** | PostgreSQL (Vercel Postgres) |
| **ORM** | Prisma 6 |
| **File Storage** | Vercel Blob |
| **Authentication** | NextAuth.js 4 |
| **Forms** | React Hook Form + Zod |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local or Vercel Postgres)
- Vercel account (for Blob storage and deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/charleskwakye/reimagined_portfolio.git
   cd reimagined_portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://..."
   DATABASE_URL_UNPOOLED="postgresql://..."
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Public pages
│   │   ├── about/         # About page
│   │   ├── projects/      # Projects listing & detail
│   │   ├── contact/       # Contact form
│   │   ├── certifications/# Certifications
│   │   └── cv/            # CV/Resume
│   ├── admin/             # Admin dashboard (protected)
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles & design tokens
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── content-blocks/   # Dynamic content renderers
│   ├── Header.tsx        # Navigation header
│   ├── Footer.tsx        # Site footer
│   └── ...
├── lib/                   # Utilities & server actions
│   ├── actions/          # Server actions (user, admin)
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # NextAuth config
│   └── types.ts          # TypeScript types
├── contexts/              # React contexts
└── middleware.ts          # Next.js middleware
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Database seeding
```

## 🎨 Design System

The portfolio uses a professional corporate design system with:

- **Color Palette** — Blue/indigo primary with semantic colors (success, warning, info)
- **Typography** — Inter for body text, JetBrains Mono for code
- **Spacing** — Consistent 4px-based spacing scale
- **Components** — Reusable card, button, and section patterns
- **Animations** — Subtle fade-in, slide-up, and scale-in transitions
- **Dark Mode** — Full dark mode support with optimized contrast

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Deploy database migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:reset` | Reset database and reapply migrations |
| `npm test` | Run test suite |

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## 📄 License

This project is proprietary and owned by Charles Kwakye.

## 🤝 Contact

- **Email**: hello@charleskwakye.dev
- **LinkedIn**: [linkedin.com/in/charleskwakye](https://linkedin.com/in/charleskwakye)
- **GitHub**: [github.com/charleskwakye](https://github.com/charleskwakye)
