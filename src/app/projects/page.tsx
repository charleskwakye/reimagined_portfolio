import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiExternalLink, FiGithub, FiArrowRight, FiYoutube } from 'react-icons/fi';
import { getAllProjects } from '@/lib/actions/user';
import { Project } from '@/lib/types';
import { Metadata } from 'next';
import BackgroundPattern from '@/components/BackgroundPattern';
import { OptimizedImage } from '@/components/OptimizedImage';

export const metadata: Metadata = {
  title: 'Projects | Portfolio',
  description: 'Explore my portfolio of projects and software development work.',
};

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  // Use the same sorting logic as the admin page:
  // First by order field, then by featured status, then by creation date
  const sortedProjects = [...projects].sort((a, b) => {
    // First sort by order field (ensure it's a number for comparison)
    const orderA = typeof a.order === 'number' ? a.order : 0;
    const orderB = typeof b.order === 'number' ? b.order : 0;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Then by featured status
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <BackgroundPattern>
      <div className="flex flex-col min-h-screen">
        <div className="container mx-auto px-4 mt-16">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8 text-center py-16">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold pb-4 border-b border-border inline-block">Projects</h1>
              </div>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                A collection of my software development projects, applications, and contributions.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
              {sortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </BackgroundPattern>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border bg-background/80 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:translate-y-[-4px] flex flex-col h-[32rem]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Cover Image */}
      <div className="aspect-video overflow-hidden">
        {project.coverImage ? (
          <OptimizedImage
            src={project.coverImage}
            alt={project.title}
            width={400}
            height={225}
            className="h-full w-full transition-transform group-hover:scale-105"
            priority={project.featured}
            objectFit="cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        {project.featured && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium py-1 px-2 rounded">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 relative">
        <h2 className="text-lg font-semibold mb-2 line-clamp-1 text-foreground">{project.title}</h2>
        <p className="text-foreground/80 dark:text-foreground/90 mb-4 line-clamp-3 leading-relaxed text-sm">{project.shortDesc}</p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="inline-block bg-muted/80 backdrop-blur-sm px-2 py-1 text-xs font-medium rounded text-foreground/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="flex gap-3">
            {project.demoLink && (
              <a
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="View Demo"
              >
                <FiExternalLink className="mr-1" />
                <span>Demo</span>
              </a>
            )}
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="View Code"
              >
                <FiGithub className="mr-1" />
                <span>Code</span>
              </a>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="Watch Video"
              >
                <FiYoutube className="mr-1" />
                <span>Video</span>
              </a>
            )}
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 hover:text-primary-foreground transition-colors shadow-sm"
          >
            <span>View Project</span>
            <FiArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
} 