import React from 'react';

interface BackgroundPatternProps {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

export default function BackgroundPattern({ 
  children, 
  interactive = false,
  className = "" 
}: BackgroundPatternProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 pointer-events-none bg-grid opacity-[0.4]" 
        style={{ zIndex: -10 }} 
      />
      
      {/* Primary gradient overlay - top right */}
      <div 
        className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none rounded-full blur-[120px] opacity-20"
        style={{ 
          background: 'hsl(var(--primary))',
          zIndex: -10
        }}
      />
      
      {/* Secondary gradient overlay - bottom left */}
      <div 
        className="fixed bottom-0 left-0 w-[600px] h-[600px] pointer-events-none rounded-full blur-[120px] opacity-10"
        style={{ 
          background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(217 91% 60%))',
          zIndex: -10
        }}
      />
      
      {/* Content */}
      {children}
    </div>
  );
} 