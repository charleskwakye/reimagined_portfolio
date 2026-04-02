'use client';

import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  children: ReactNode;
}

export function ImageLightbox({
  src,
  alt,
  caption,
  children,
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleContentClick = (e: React.MouseEvent) => {
    // Close if clicking on the background area (not the image)
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="!w-[75vw] !h-[75vh] !max-w-[75vw] !max-h-[75vh] !p-8 !border-0 !bg-black/90 !rounded-xl overflow-auto"
          onClick={handleContentClick}
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {caption && (
              <div className="mt-4 px-4 flex-shrink-0">
                <DialogHeader>
                  <DialogTitle className="text-white text-center text-lg font-normal">
                    {caption}
                  </DialogTitle>
                </DialogHeader>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
