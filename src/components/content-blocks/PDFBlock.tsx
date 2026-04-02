'use client';

import { useState } from 'react';
import { FiDownload, FiMaximize, FiMinimize } from 'react-icons/fi';

interface PDFBlockProps {
  url: string;
  title: string;
}

export function PDFBlock({ url, title }: PDFBlockProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`my-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <a
            href={url}
            download
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            aria-label="Download PDF"
          >
            <FiDownload className="h-4 w-4" />
          </a>
          <button
            onClick={toggleFullscreen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <FiMinimize className="h-4 w-4" />
            ) : (
              <FiMaximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className={`relative overflow-hidden rounded-lg border ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[500px]'}`}>
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          title={title}
          className="absolute top-0 left-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
} 