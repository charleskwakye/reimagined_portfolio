// Content block types
export type ContentBlockType = 'heading' | 'paragraph' | 'image' | 'document' | 'powerpoint' | 'list' | 'video' | 'tabs' | 'markdown' | 'githubReadme';

// Tab item interface for tabs content block
export interface TabItem {
  id: string;
  label: string;
  contentBlocks: ContentBlock[];
}

// Content block interface
export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content?: string;
  level?: number;
  url?: string;
  caption?: string;
  items?: string[];
  showEmbed?: boolean;
  tabs?: TabItem[];
  defaultTab?: string;
  // New fields for markdown and GitHub README blocks
  markdownContent?: string;
  githubRepoUrl?: string;
  githubBranch?: string;
  lastUpdated?: string;
} 