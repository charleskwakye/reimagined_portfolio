import { getInternshipById } from '@/lib/actions/user';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { FiCalendar, FiMapPin, FiCode, FiFileText, FiFile, FiArrowLeft } from 'react-icons/fi';
import BackgroundPattern from '@/components/BackgroundPattern';
import ContentCard from '@/components/ContentCard';
import DocumentViewer from '@/components/DocumentViewer';
import { ImageLightbox } from '@/components/ImageLightbox';
import { TableOfContents } from '@/components/TableOfContents';
import TabBlockRenderer from '@/components/TabBlockRenderer';
import Link from 'next/link';

// Format date for display
function formatDate(date: Date | string | null): string {
  if (!date) return 'Present';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface InternshipPageParams {
  params: {
    id: string;
  };
}

// Static generation with on-demand revalidation for instant updates via admin
export const dynamic = 'force-static';

export default async function InternshipDetailPage({ params }: InternshipPageParams) {
  // Properly await the params to fix the Next.js 15 error
  const { id } = await params;
  const internship = await getInternshipById(id);

  if (!internship) {
    notFound();
  }

  // Parse content blocks from JSON if needed
  let contentBlocks = internship.contentBlocks || [];
  if (typeof contentBlocks === 'string') {
    try {
      contentBlocks = JSON.parse(contentBlocks);
    } catch (error) {
      console.error('Error parsing content blocks:', error);
      contentBlocks = [];
    }
  }

  // Render content blocks based on type
  const renderContentBlock = (block: any, index: number) => {
    // Generate unique ID for headings (same format as ContentBlockRenderer)
    const generateHeadingId = (content: string, index: number) => {
      return `heading-${index}-${content.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    };

    switch (block.type) {
      case 'heading':
        const HeadingTag = block.level === 1 ? 'h1' : block.level === 3 ? 'h3' : 'h2';
        const headingClass = block.level === 1
          ? 'text-responsive-xl font-bold mt-10 mb-5 scroll-mt-24'
          : block.level === 3
            ? 'text-responsive-base font-semibold mt-8 mb-4 pl-3 border-l-2 border-primary/70 bg-primary/10 rounded-r-sm py-1 scroll-mt-24'
            : 'text-responsive-lg font-bold mt-10 mb-5 pl-4 border-l-4 border-primary bg-primary/15 rounded-r-md py-2 scroll-mt-24';

        const headingId = block.content ? generateHeadingId(block.content, index) : undefined;

        return (
          <HeadingTag key={`block_${index}`} id={headingId} className={headingClass}>
            {block.content}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={`block_${index}`} className="mb-5 text-card-foreground/90 leading-relaxed">
            {block.content}
          </p>
        );

      case 'list':
        if (!block.items || !Array.isArray(block.items)) return null;

        return (
          <ul key={`block_${index}`} className="mb-8 pl-6 list-disc space-y-2 text-card-foreground/90">
            {block.items.map((item: string, i: number) => (
              <li key={`item_${i}`} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );

      case 'image':
        return (
          <div key={`block_${index}`} className="my-8">
            <div className="rounded-lg overflow-hidden border border-border bg-muted/20 shadow-md">
              <ImageLightbox
                src={block.url}
                alt={block.caption || 'Internship image'}
                caption={block.caption}
              >
                <img
                  src={block.url}
                  alt={block.caption || 'Internship image'}
                  className="w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </ImageLightbox>
            </div>
            {block.caption && (
              <p className="text-sm text-muted-foreground text-center mt-3">{block.caption}</p>
            )}
          </div>
        );

      case 'document':
        const isPdf = block.url?.toLowerCase().endsWith('.pdf') ||
          block.url?.toLowerCase().includes('pdf') ||
          block.url?.toLowerCase().includes('document');
        return (
          <div key={`block_${index}`} className="my-4 md:my-8 -mx-4 sm:mx-0">
            <DocumentViewer
              url={block.url}
              title={block.content || 'View Document'}
              caption={block.caption}
              isPowerPoint={false}
              initialShowEmbed={block.showEmbed}
            />
          </div>
        );

      case 'powerpoint':
        const isPpt = block.url?.toLowerCase().endsWith('.ppt') ||
          block.url?.toLowerCase().endsWith('.pptx') ||
          block.url?.toLowerCase().includes('presentation');
        return (
          <div key={`block_${index}`} className="my-4 md:my-8 -mx-4 sm:mx-0">
            <DocumentViewer
              url={block.url}
              title={block.content || 'View Presentation'}
              caption={block.caption}
              isPowerPoint={true}
              initialShowEmbed={block.showEmbed}
            />
          </div>
        );

      case 'tabs':
        return (
          <div key={`block_${index}`} className="my-8">
            <TabBlockRenderer
              block={block as any}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BackgroundPattern>
      <div className="flex flex-col min-h-screen">
        {/* Table of Contents - positioned outside main content */}
        {contentBlocks && contentBlocks.length > 0 && (
          <TableOfContents blocks={contentBlocks} />
        )}

        <div className="container w-full px-3 sm:px-4 py-8 mt-16">
          <div className="w-full lg:max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                href="/internship"
                className="inline-flex items-center px-4 py-2 bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground rounded-lg transition-colors mb-6 shadow-sm border border-border"
              >
                <FiArrowLeft className="mr-2" /> Back to all internships
              </Link>
              <h1 className="text-responsive-2xl font-bold">{internship.title}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="bg-primary/5 text-primary rounded-md px-3 py-1.5 inline-flex items-center max-w-max shadow-sm border border-primary/15">
                <span className="font-medium text-sm">{internship.company}</span>
              </div>

              <div className="flex items-center text-muted-foreground bg-background/80 border border-border/50 rounded-md px-3 py-1 max-w-max shadow-sm">
                <FiMapPin className="mr-1.5 flex-shrink-0 h-3.5 w-3.5" />
                <div className="truncate max-w-[250px] text-xs" title={internship.location || ''}>
                  {internship.location}
                </div>
              </div>

              <div className="flex items-center text-muted-foreground bg-background/80 border border-border/50 rounded-md px-3 py-1 shadow-sm">
                <FiCalendar className="mr-1.5 flex-shrink-0 h-3.5 w-3.5" />
                <span className="text-xs font-medium whitespace-nowrap">{formatDate(internship.startDate || new Date())} - {formatDate(internship.endDate || new Date())}</span>
              </div>
            </div>

            {internship.technologies && internship.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {internship.technologies.map((tech: string, index: number) => (
                  <span
                    key={`tech_${index}`}
                    className="bg-secondary/30 text-secondary-foreground px-3 py-1 rounded-md text-xs font-medium shadow-sm border border-secondary/40"
                  >
                    <FiCode className="inline mr-1.5" size={12} />
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="py-8 md:py-12">
              <div className="bg-card rounded-xl shadow-md border border-border p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
                <h2 className="text-responsive-lg font-semibold mb-4 text-card-foreground border-b border-border pb-3">Overview</h2>
                <p className="text-card-foreground/80 leading-relaxed pt-2">{internship.shortDesc}</p>
              </div>

              <div className="bg-card rounded-xl shadow-md border border-border p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
                <h2 className="text-responsive-lg font-semibold mb-4 sm:mb-6 pb-3 border-b border-border text-card-foreground">Experience Details</h2>
                <div className="prose prose-lg max-w-none prose-headings:text-card-foreground prose-p:text-card-foreground/90 pt-2">
                  {contentBlocks.length > 0 ? (
                    contentBlocks.map((block: any, index: number) => (
                      <div key={index}>
                        {renderContentBlock(block, index)}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No detailed content available for this internship.</p>
                  )}
                </div>

                {internship.outcome && (
                  <div className="mt-8 md:mt-12 p-4 sm:p-6 md:p-8 bg-primary/5 rounded-lg border border-primary/20 shadow-sm">
                    <h2 className="text-responsive-lg font-semibold mb-4 md:mb-5 text-card-foreground">Outcome & Key Achievements</h2>
                    <p className="text-card-foreground/90 leading-relaxed">{internship.outcome}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-12">
              <Link
                href="/internship"
                className="inline-flex items-center px-4 py-2 bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground rounded-lg transition-colors font-medium shadow-sm border border-border"
              >
                <FiArrowLeft className="mr-2" /> Back to all internships
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BackgroundPattern>
  );
}