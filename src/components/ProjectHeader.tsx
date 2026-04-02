import React from 'react';
import { FiExternalLink, FiGithub, FiYoutube } from 'react-icons/fi';

interface ProjectHeaderProps {
  title: string;
  coverImage?: string;
  shortDesc: string;
  technologies: string[];
  featured?: boolean;
  demoLink?: string;
  githubLink?: string;
  videoUrl?: string;
}

export function ProjectHeader({
  title,
  coverImage,
  shortDesc,
  technologies,
  featured,
  demoLink,
  githubLink,
  videoUrl
}: ProjectHeaderProps) {
  return (
    <header className="mb-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center pb-4 border-b border-border">{title}</h1>
        </div>

        {/* Cover Image - constrained width */}
        {coverImage && (
          <div className="relative mb-8 overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="aspect-video">
              <img
                src={coverImage}
                alt={title}
                className="object-cover w-full h-full"
              />
            </div>
            {featured && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-medium py-1 px-3 rounded-md">
                Featured Project
              </div>
            )}
          </div>
        )}

        {/* Short description - constrained width */}
        <p className="mt-4 text-xl text-muted-foreground leading-relaxed text-center">{shortDesc}</p>

        {/* YouTube Video Card - if videoUrl exists */}
        {videoUrl && (
          <div className="mt-6 flex justify-center">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all hover:border-primary/20 max-w-md w-full"
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

        {/* Technologies */}
        {technologies && technologies.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {technologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-secondary/30 text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Project Links */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {demoLink && (
            <a
              href={demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <FiExternalLink className="mr-2 h-4 w-4" />
              View Live Demo
            </a>
          )}

          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              <FiGithub className="mr-2 h-4 w-4" />
              View Code
            </a>
          )}

          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              <FiYoutube className="mr-2 h-4 w-4" />
              Watch Video
            </a>
          )}
        </div>
      </div>
    </header>
  );
} 