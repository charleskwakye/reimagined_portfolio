'use client';

import { useState } from 'react';
import { ContentBlock, TabItem } from './content-blocks';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { cn } from '@/lib/utils';

interface TabBlockRendererProps {
  block: ContentBlock & { type: 'tabs'; tabs: TabItem[] };
}

export default function TabBlockRenderer({ block }: TabBlockRendererProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    block.defaultTab || block.tabs[0]?.id || ''
  );

  const activeTab = block.tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return null;
  }

  const outerBg = 'bg-background';
  const activeTabBg = 'bg-secondary';
  const contentBg = activeTabBg;
  const inactiveHoverBg = 'hover:bg-muted';
  const activeText = 'text-secondary-foreground font-semibold';
  const inactiveText = 'text-muted-foreground font-medium';

  return (
    <div className={cn('p-4 sm:p-6 rounded-xl', outerBg)}>
      {/* Tab Navigation Header - z-10 ensures tabs sit physically above content */}
      <div className="flex gap-1 relative z-10 -mb-[2px]">
        {block.tabs.map((tab) => {
          const isActive = activeTabId === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                'relative px-5 py-3 text-sm tracking-wider font-medium',
                'rounded-t-xl transition-all duration-200 ease-in-out',
                'focus:outline-none',
                isActive
                  ? `${activeTabBg} ${activeText} -mb-[2px] pt-4 pb-3`
                  : `text-transparent ${inactiveText} ${inactiveHoverBg} pt-4 pb-3`
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area - z-0 sits behind the active tab */}
      <div
        className={cn(
          `${contentBg} p-5 sm:p-6 rounded-b-xl rounded-tr-none rounded-tl-none relative z-0`,
          'transition-all duration-300'
        )}
      >
        <div className="animate-in fade-in duration-300">
          {activeTab.contentBlocks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No content in this tab yet.</p>
          ) : (
            <div className="space-y-4">
              <ContentBlockRenderer blocks={activeTab.contentBlocks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
