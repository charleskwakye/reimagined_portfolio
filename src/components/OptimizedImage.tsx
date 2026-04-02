'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fallback?: React.ReactNode;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
    src,
    alt,
    width = 400,
    height = 225,
    className = '',
    priority = false,
    fallback,
    objectFit = 'cover'
}: OptimizedImageProps) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorDetails, setErrorDetails] = useState<string>('');

    // Check for problematic URL patterns that cause production issues
    const hasProblematicChars = src.includes('%E2%80%AF') || src.includes('%C2%A0') || src.includes('%E2%80%8B');

    // Enhanced fallback for problematic images
    const enhancedFallback = (
        <div className="bg-muted h-full w-full flex flex-col items-center justify-center p-4">
            <span className="text-muted-foreground text-sm text-center">Image not available</span>
            {hasProblematicChars && (
                <span className="text-xs text-orange-500 text-center mt-1">
                    ⚠️ Filename contains special characters
                </span>
            )}
            {errorDetails && (
                <span className="text-xs text-muted-foreground text-center mt-1">
                    {errorDetails}
                </span>
            )}
        </div>
    );

    // Default fallback if none provided
    const defaultFallback = (
        <div className="bg-muted h-full w-full flex items-center justify-center">
            <span className="text-muted-foreground">Image not available</span>
        </div>
    );

    if (imageError) {
        return fallback || (hasProblematicChars ? enhancedFallback : defaultFallback);
    }

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                style={{ objectFit }}
                priority={priority}
                unoptimized={true} // Disable optimization for better compatibility with Vercel Blob
                onLoad={() => setIsLoading(false)}
                onError={(e) => {
                    const errorMsg = hasProblematicChars
                        ? 'Special characters in filename may cause loading issues'
                        : 'Failed to load image';

                    console.error('Failed to load image:', src);
                    console.error('Error details:', errorMsg);

                    setErrorDetails(errorMsg);
                    setImageError(true);
                    setIsLoading(false);
                }}
            />
        </div>
    );
}
