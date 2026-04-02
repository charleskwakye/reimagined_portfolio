'use client';

import { useState } from 'react';
import { FiDownload, FiMaximize, FiMinimize } from 'react-icons/fi';

interface CVClientWrapperProps {
  resumeUrl: string | null;
}

export default function CVClientWrapper({ resumeUrl }: CVClientWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {resumeUrl ? (
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FiDownload className="mr-2 h-4 w-4" />
              Download CV
            </a>
          ) : (
            <span className="text-muted-foreground">CV not available</span>
          )}
        </div>
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
      <div className={`relative overflow-hidden rounded-lg border ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[800px]'}`}>
        {resumeUrl ? (
          <iframe
            src={resumeUrl}
            className="w-full h-full"
            title="CV"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <p className="text-lg font-medium">CV Not Available</p>
              <p className="text-muted-foreground">
                Please check back later or contact me for more information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
