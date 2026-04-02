'use client';

import { useState } from 'react';
import { FiFileText, FiFile, FiEye, FiEyeOff, FiDownload, FiExternalLink, FiMaximize, FiMinimize } from 'react-icons/fi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentViewerProps {
  url: string;
  title: string;
  caption?: string;
  isPowerPoint?: boolean;
  initialShowEmbed?: boolean;
}

export default function DocumentViewer({ 
  url, 
  title, 
  caption, 
  isPowerPoint = false,
  initialShowEmbed = false 
}: DocumentViewerProps) {
  const [showEmbed, setShowEmbed] = useState(initialShowEmbed);
  const [isEmbedLoading, setIsEmbedLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const Icon = isPowerPoint ? FiFile : FiFileText;
  const fileType = isPowerPoint ? 'Presentation' : 'Document';
  
  const handleExpandedContentClick = (e: React.MouseEvent) => {
    // Close if clicking on the background area (not the content)
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };
  
  // Helper function to determine viewer URL
  const getEmbedUrl = () => {
    // Google Docs Viewer URL for PowerPoint and other formats
    if (isPowerPoint || url.toLowerCase().endsWith('.ppt') || url.toLowerCase().endsWith('.pptx')) {
      // Google Docs Viewer URL
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    
    // Direct PDF embedding with options for better viewing
    if (url.toLowerCase().endsWith('.pdf')) {
      return `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
    }
    
    // Default to Google Docs Viewer for other document types
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };
  
  return (
    <div className="w-full mb-4 sm:mb-8 border rounded-lg sm:rounded-xl overflow-hidden shadow-md bg-card border-border">
      {showEmbed ? (
        <div className="flex flex-col w-full">
          {/* Embedded document viewer */}
          <div className="p-2 sm:p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
            <h3 className="font-medium flex items-center gap-2 text-card-foreground mb-2 sm:mb-0 text-sm sm:text-base">
              <div className="p-1 sm:p-1.5 rounded-full bg-primary/15">
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <span className="truncate">{title || `View ${fileType}`}</span>
            </h3>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm"
              >
                <FiMaximize size={12} className="mr-1 sm:hidden" />
                <FiMaximize size={14} className="hidden sm:block mr-1" />
                <span>Expand</span>
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs rounded-md bg-muted/80 text-foreground hover:bg-muted transition-colors shadow-sm"
              >
                <FiExternalLink size={12} className="mr-1 sm:hidden" />
                <FiExternalLink size={14} className="hidden sm:block mr-1" />
                <span>Open</span>
              </a>
              <a
                href={url}
                download
                className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors shadow-sm"
              >
                <FiDownload size={12} className="mr-1 sm:hidden" />
                <FiDownload size={14} className="hidden sm:block mr-1" />
                <span>Download</span>
              </a>
              <button
                onClick={() => setShowEmbed(false)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors shadow-sm"
              >
                <FiEyeOff size={12} className="mr-1 sm:hidden" />
                <FiEyeOff size={14} className="hidden sm:block mr-1" />
                <span>Hide</span>
              </button>
            </div>
          </div>
          
          <div className="w-full relative bg-card">
            {isEmbedLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                <div className="animate-pulse flex flex-col items-center justify-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/20 rounded-full mb-3 flex items-center justify-center">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Loading {fileType}...</p>
                </div>
              </div>
            )}
            <iframe
              src={getEmbedUrl()}
              className="w-full h-[400px] sm:h-[500px] border-0"
              title={title || `Embedded ${fileType}`}
              onLoad={() => setIsEmbedLoading(false)}
            />
          </div>
          
          {caption && (
            <div className="p-2 sm:p-3 bg-muted/20 text-xs sm:text-sm text-muted-foreground border-t border-border">
              {caption}
            </div>
          )}
          
          {/* Expanded Modal - Larger than embedded with space around */}
          <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
            <DialogContent 
              className="!w-[75vw] !h-[75vh] !max-w-[75vw] !max-h-[75vh] !p-6 !border-0 !bg-background !rounded-xl overflow-hidden shadow-2xl"
              onClick={handleExpandedContentClick}
            >
              <div 
                className="w-full h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 sm:p-4 bg-muted border-b border-border flex justify-between items-center flex-shrink-0 rounded-t-lg">
                  <DialogHeader className="flex-1">
                    <DialogTitle className="text-foreground text-base font-medium">
                      {title || fileType}
                    </DialogTitle>
                  </DialogHeader>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <FiMinimize size={14} className="mr-1" />
                    <span>Close</span>
                  </button>
                </div>
                <div className="flex-1 w-full relative overflow-hidden rounded-b-lg bg-white">
                  <iframe
                    src={getEmbedUrl()}
                    className="w-full h-full border-0"
                    title={title || `Expanded ${fileType}`}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 flex-shrink-0">
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-card-foreground text-sm sm:text-base truncate">{title || fileType}</h3>
              {caption && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">{caption}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
            <button
              onClick={() => setShowEmbed(true)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <FiEye size={12} className="mr-1" />
              <span>View</span>
            </button>
            <a
              href={url}
              download
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-sm"
            >
              <FiDownload size={12} className="mr-1" />
              <span>Download</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
