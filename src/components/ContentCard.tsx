'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function ContentCard({ children, className = '', hover = true }: ContentCardProps) {
  return (
    <div 
      className={cn(
        'card relative overflow-hidden',
        hover && 'group',
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 