import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiExternalLink } from 'react-icons/fi';
import { getCertificationById } from '@/lib/actions/user';

// Static generation with on-demand revalidation for instant updates via admin
export const dynamic = 'force-static';

export default async function CertificationViewPage({ params }: { params: { id: string } }) {
  const certification = await getCertificationById(params.id);

  if (!certification) {
    notFound();
  }

  // If there's no PDF and no URL, show error
  if (!certification.pdfUrl && !certification.url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Certificate Available</h1>
          <p className="text-muted-foreground mb-6">This certification doesn't have a viewable document.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // If there's no PDF but there's a URL, redirect to the URL
  if (!certification.pdfUrl && certification.url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <p className="text-muted-foreground mb-6">Taking you to the external certification page.</p>
          <a
            href={certification.url}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <FiExternalLink className="mr-2 h-4 w-4" />
            View Certificate
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{certification.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {certification.organization} • {certification.year}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={certification.pdfUrl}
                download
                className="inline-flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Download
              </a>
              {certification.url && (
                <a
                  href={certification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                >
                  <FiExternalLink className="mr-2 h-4 w-4" />
                  View Original
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={certification.pdfUrl}
            className="w-full h-[calc(100vh-200px)] min-h-[600px]"
            title={`${certification.title} Certificate`}
          />
        </div>
      </div>
    </div>
  );
}
