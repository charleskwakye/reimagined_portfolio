import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { FiArrowLeft, FiGithub, FiExternalLink, FiCode, FiYoutube } from 'react-icons/fi';
import { getProjectById } from '@/lib/actions/user';
import { ContentBlockRenderer } from '@/components/ContentBlockRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { ImageLightbox } from '@/components/ImageLightbox';
import BackgroundPattern from '@/components/BackgroundPattern';

// Static generation with on-demand revalidation for instant updates via admin
export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProjectById(params.id);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.shortDesc,
  };
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <BackgroundPattern>
      <div className="container py-12">
        {/* Table of Contents - positioned outside main content */}
        {project.contentBlocks && project.contentBlocks.length > 0 && (
          <TableOfContents blocks={project.contentBlocks} />
        )}

        {/* Main content container with fixed max width */}
        <div className="max-w-3xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground rounded-lg transition-colors mb-8 shadow-sm border border-border"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>

          {/* Project content with consistent width */}
          <div className="space-y-8">
            {/* Title and description - left aligned */}
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">{project.title}</h1>
              <p className="text-xl text-muted-foreground">{project.shortDesc}</p>
            </div>

            {/* YouTube Video Card - if videoUrl exists */}
            {project.videoUrl && (
              <div className="max-w-2xl">
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all hover:border-primary/20 w-full"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiYoutube className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground">Watch on YouTube</div>
                    <div className="text-xs text-muted-foreground truncate">Project demonstration video</div>
                  </div>
                  <FiExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>
            )}

            {/* Cover image - centered for visual appeal */}
            {project.coverImage && (
              <div className="flex justify-center">
                <ImageLightbox
                  src={project.coverImage}
                  alt={project.title}
                  caption={project.title}
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg max-w-2xl w-full cursor-pointer hover:opacity-90 transition-opacity">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      width={1200}
                      height={675}
                      className="object-cover"
                      priority
                    />
                  </div>
                </ImageLightbox>
              </div>
            )}

            {/* Technologies - styled like internship page */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-2xl">
                {/* Map through technologies in the order they were saved */}
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="bg-secondary/30 text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                  >
                    <FiCode className="inline mr-1.5" size={14} />
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Project links - left aligned */}
            <div className="flex flex-wrap gap-4 max-w-2xl">
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
                >
                  <FiGithub className="mr-2 h-4 w-4" />
                  GitHub Repository
                </a>
              )}
              {project.demoLink && (
                <a
                  href={project.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <FiExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>

            {/* Content blocks - already centered by the ContentBlockRenderer */}
            <div className="border-t pt-8 w-full">
              {project.contentBlocks && <ContentBlockRenderer blocks={project.contentBlocks} />}
            </div>
          </div>
        </div>
      </div>
    </BackgroundPattern>
  );
}
