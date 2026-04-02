'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  style?: 'simple' | 'framed' | 'elegant' | 'shadow' | 'outline' | 'glow' | 'circular';
  objectFit?: 'cover' | 'contain' | 'fill';
  responsive?: boolean;
  borderColor?: string;
}

export default function ProfileImage({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  style = 'simple',
  objectFit = 'cover',
  responsive = false,
  borderColor
}: ProfileImageProps) {
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine dimensions based on size
  const dimensions = {
    sm: { width: 100, height: 100 },
    md: { width: 200, height: 200 },
    lg: { width: 300, height: 300 },
    xl: { width: 400, height: 400 },
    '2xl': { width: 500, height: 500 }
  };

  const { width, height } = dimensions[size];
  
  // Object fit styles
  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  }[objectFit];
  
  // Show loading state
  const handleLoad = () => {
    console.log("Image loaded successfully");
    setIsLoaded(true);
  };

  // Handle image load error
  const handleError = () => {
    console.error("Error loading image:", src);
    setIsError(true);
  };
  
  // Style for the container - responsive or fixed
  const containerStyle = responsive 
    ? { width: '100%', height: 'auto', aspectRatio: '1/1' } 
    : { width, height };

  // Choose styling based on prop
  let wrapperClassNames = 'relative';
  let imageClassNames = `transition-all duration-500 ${objectFitClass}`;
  let decorativeElements = null;

  switch (style) {
    case 'framed':
      wrapperClassNames += ' p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg';
      imageClassNames += ' rounded-lg';
      break;
    case 'elegant':
      wrapperClassNames += ' p-0';
      imageClassNames += ' rounded-xl overflow-hidden';
      decorativeElements = (
        <>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 mix-blend-overlay" />
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary to-primary/50 opacity-30 blur-sm" 
               style={{transform: isHovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.3s ease'}} />
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
          <div className="absolute -top-2 -left-2 w-20 h-20 bg-primary/20 rounded-full blur-xl" />
        </>
      );
      break;
    case 'shadow':
      wrapperClassNames += ' p-0';
      imageClassNames += ' rounded-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]';
      break;
    case 'outline':
      wrapperClassNames += ' p-2 border-2 rounded-xl';
      wrapperClassNames += borderColor ? ` border-[${borderColor}]` : ' border-primary';
      imageClassNames += ' rounded-lg';
      break;
    case 'glow':
      wrapperClassNames += ' p-0';
      imageClassNames += ' rounded-2xl overflow-hidden';
      decorativeElements = (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
      );
      break;
    case 'circular':
      wrapperClassNames += ' p-0 rounded-full overflow-hidden';
      imageClassNames += ' rounded-full';
      decorativeElements = (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-primary/30 rounded-full mix-blend-overlay group-hover:opacity-80 transition-opacity" />
      );
      break;
    default: // simple
      wrapperClassNames += ' p-0';
      imageClassNames += ' rounded-xl overflow-hidden';
  }

  return (
    <div 
      className={`${wrapperClassNames} overflow-hidden ${className} group`}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {decorativeElements}
      
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      )}
      
      {isError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <span className="text-destructive">Image Failed to Load</span>
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={src}
            alt={alt}
            width={responsive ? undefined : width}
            height={responsive ? undefined : height}
            fill={responsive}
            className={`${imageClassNames} ${!isLoaded ? 'opacity-0' : 'opacity-100'} z-0`}
            style={{ 
              objectPosition: 'center 30%', // Better face positioning
              filter: 'contrast(1.05) brightness(1.02)', // Slightly enhance the image
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease'
            }}
            quality={95} // Higher quality
            onLoad={handleLoad}
            onError={handleError}
            priority
          />
        </div>
      )}
    </div>
  );
} 