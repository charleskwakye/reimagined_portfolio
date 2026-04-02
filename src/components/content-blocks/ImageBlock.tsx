'use client';

import Image from 'next/image';
import { ImageLightbox } from '@/components/ImageLightbox';

interface ImageBlockProps {
  url: string;
  caption?: string;
  alt?: string;
}

export function ImageBlock({ url, caption, alt = 'Project image' }: ImageBlockProps) {
  return (
    <figure className="my-8">
      <ImageLightbox
        src={url}
        alt={alt}
        caption={caption}
      >
        <div className="relative aspect-video overflow-hidden rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90 hover:shadow-lg">
          <Image
            src={url}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </ImageLightbox>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
} 