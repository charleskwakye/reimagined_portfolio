'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ContentBlock } from './content-blocks';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    blocks: ContentBlock[];
}

export function TableOfContents({ blocks }: TableOfContentsProps) {
    const [activeSection, setActiveSection] = useState<string>('');
    const tocNavRef = useRef<HTMLElement>(null);

    // Extract headings from content blocks
    const tocItems = useMemo(() => {
        const items: TOCItem[] = [];

        blocks.forEach((block, index) => {
            if (block.type === 'heading' && block.content) {
                // Create a unique ID for each heading
                const id = `heading-${index}-${block.content.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                items.push({
                    id,
                    text: block.content,
                    level: block.level || 2
                });
            }
        });

        return items;
    }, [blocks]);

    // Don't render if no headings
    if (tocItems.length === 0) {
        return null;
    }

    // Set up intersection observer to track active section
    useEffect(() => {
        const observerOptions = {
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        // Observe all heading elements
        tocItems.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [tocItems]);

    // Auto-scroll TOC to center the active section
    useEffect(() => {
        if (activeSection && tocNavRef.current) {
            const activeButton = tocNavRef.current.querySelector(`[data-section-id="${activeSection}"]`) as HTMLElement;
            if (activeButton) {
                const navContainer = tocNavRef.current;
                const containerHeight = navContainer.clientHeight;
                const buttonTop = activeButton.offsetTop;
                const buttonHeight = activeButton.clientHeight;

                // Calculate position to center the active button
                const centerPosition = buttonTop - (containerHeight / 2) + (buttonHeight / 2);

                // Smooth scroll to center the active item
                navContainer.scrollTo({
                    top: centerPosition,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeSection]);

    const handleItemClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <div className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-20 max-h-[70vh] overflow-y-auto">
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 w-80">
                <h3 className="text-sm font-semibold text-card-foreground mb-3 border-b border-border pb-2 antialiased">
                    Table of Contents
                </h3>
                <nav ref={tocNavRef} className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {tocItems.map(({ id, text, level }) => (
                        <button
                            key={id}
                            data-section-id={id}
                            onClick={() => handleItemClick(id)}
                            className={`
                block w-full text-left transition-colors duration-200 py-2 rounded antialiased relative
                ${activeSection === id
                                    ? 'bg-primary/20 text-primary font-medium border-l-2 border-primary'
                                    : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                                }
                ${level === 1 ? 'font-semibold text-sm' : ''}
                ${level === 2 ? 'text-sm' : ''}
                ${level === 3 ? 'text-sm' : ''}
                ${level === 4 ? 'text-sm' : ''}
              `}
                            style={{
                                paddingLeft: level === 1 ? '12px' : level === 2 ? '12px' : level === 3 ? '24px' : '36px'
                            }}
                            title={text}
                        >
                            <span className="block leading-snug truncate pr-2">
                                {level >= 3 && (
                                    <span className="text-muted-foreground/60 mr-2">
                                        {level === 3 ? '└' : '└─'}
                                    </span>
                                )}
                                {text}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
