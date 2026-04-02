'use client';

import { ContentBlock } from './content-blocks';
import DocumentViewer from './DocumentViewer';
import { ImageLightbox } from './ImageLightbox';
import { MarkdownBlock } from './MarkdownBlock';
import { GitHubReadmeBlock } from './GitHubReadmeBlock';
import { convertToYouTubeEmbedUrl } from '@/lib/utils';
import TabBlockRenderer from './TabBlockRenderer';

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  const renderBlock = (block: ContentBlock, index: number) => {
    // Generate unique ID for headings
    const generateHeadingId = (content: string, index: number) => {
      return `heading-${index}-${content.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    };

    switch (block.type) {
      case 'heading':
        const headingId = block.content ? generateHeadingId(block.content, index) : undefined;
        switch (block.level) {
          case 1:
            return <h1 id={headingId} className="text-3xl font-bold mt-8 mb-4 leading-tight scroll-mt-24">{block.content}</h1>;
          case 2:
            return <h2 id={headingId} className="text-2xl font-bold mt-8 mb-4 leading-tight pl-4 border-l-4 border-primary bg-primary/15 rounded-r-md py-2 scroll-mt-24">{block.content}</h2>;
          case 3:
            return <h3 id={headingId} className="text-xl font-bold mt-6 mb-4 leading-tight pl-3 border-l-2 border-primary/70 bg-primary/10 rounded-r-sm py-1 scroll-mt-24">{block.content}</h3>;
          case 4:
            return <h4 id={headingId} className="text-lg font-bold mt-6 mb-3 leading-tight scroll-mt-24">{block.content}</h4>;
          default:
            return <h2 id={headingId} className="text-2xl font-bold mt-8 mb-4 leading-tight pl-4 border-l-4 border-primary bg-primary/15 rounded-r-md py-2 scroll-mt-24">{block.content}</h2>;
        }

      case 'paragraph':
        return (
          <p className="mb-6 text-muted-foreground leading-relaxed">
            {block.content}
          </p>
        );

      case 'image':
        return (
          <figure className="my-8 flex flex-col items-center">
            <ImageLightbox
              src={block.url || ''}
              alt={block.caption || 'Project image'}
              caption={block.caption}
            >
              <div className="max-w-2xl w-full rounded-md overflow-hidden border border-border shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <img
                  src={block.url}
                  alt={block.caption || ''}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
            </ImageLightbox>
            {block.caption && (
              <figcaption className="mt-3 text-sm text-center text-muted-foreground max-w-2xl">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'video':
        return (
          <figure className="my-8 flex flex-col items-center">
            <div className="max-w-2xl w-full aspect-video rounded-md overflow-hidden border border-border shadow-sm">
              <iframe
                src={convertToYouTubeEmbedUrl(block.url || '')}
                title={block.caption || 'Embedded video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            {block.caption && (
              <figcaption className="mt-3 text-sm text-center text-muted-foreground max-w-2xl">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'list':
        return (
          <ul className="mb-6 pl-6 list-disc space-y-2">
            {block.items?.map((item, index) => (
              <li key={index} className="leading-relaxed text-muted-foreground">{item}</li>
            ))}
          </ul>
        );

      case 'document':
        return (
          <div className="my-8 flex flex-col items-center">
            <div className="max-w-2xl w-full">
              <DocumentViewer
                url={block.url || ''}
                title={block.caption || 'View Document'}
                caption={block.content}
                isPowerPoint={false}
                initialShowEmbed={Boolean(block.showEmbed)}
              />
            </div>
          </div>
        );

      case 'powerpoint':
        return (
          <div className="my-8 flex flex-col items-center">
            <div className="max-w-2xl w-full">
              <DocumentViewer
                url={block.url || ''}
                title={block.caption || 'View Presentation'}
                caption={block.content}
                isPowerPoint={true}
                initialShowEmbed={Boolean(block.showEmbed)}
              />
            </div>
          </div>
        );

      case 'tabs':
        return <TabBlockRenderer block={block as ContentBlock & { type: 'tabs'; tabs: any[] }} />;

      case 'markdown':
        return (
          <div className="my-8">
            <MarkdownBlock content={block.content || ''} />
          </div>
        );

      case 'githubReadme':
        return (
          <GitHubReadmeBlock 
            repoUrl={block.url || ''} 
            branch={block.caption || undefined}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-prose">
        {blocks.map((block, index) => (
          <div key={block.id} className="w-full">
            {renderBlock(block, index)}
          </div>
        ))}
      </div>
    </div>
  );
} 