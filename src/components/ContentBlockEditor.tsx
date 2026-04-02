'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiPlus, FiTrash, FiUpload, FiChevronUp, FiChevronDown, FiX, FiGithub, FiFileText } from 'react-icons/fi';
import { ContentBlock, ContentBlockType } from './content-blocks';
import TabBlockEditor from './TabBlockEditor';
import toast from 'react-hot-toast';
import { deleteVercelBlobFile } from '@/lib/utils';
import { convertToYouTubeEmbedUrl } from '@/lib/utils';

// Export this interface for use in parent components
export interface PendingFileUpload {
  blockId: string;
  file: File;
  fileType: string;
  tempUrl: string;
}

export interface ContentBlockChanges {
  pendingUploads: PendingFileUpload[];
  pendingDeletions: string[];
}

interface ContentBlockEditorProps {
  contentBlocks: ContentBlock[];
  onChange: (blocks: ContentBlock[], changes?: ContentBlockChanges) => void;
}

// Simple, standard text input component
function SimpleTextInput({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
}) {
  const [inputValue, setInputValue] = useState(value || '');

  // Keep local state in sync with props
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Update local state immediately
    onChange(newValue); // Propagate to parent
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

// Simple, standard textarea component
function SimpleTextarea({ value, onChange, placeholder, className, rows = 4 }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
  rows?: number;
}) {
  const [textareaValue, setTextareaValue] = useState(value || '');

  // Keep local state in sync with props
  useEffect(() => {
    setTextareaValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextareaValue(newValue); // Update local state immediately
    onChange(newValue); // Propagate to parent
  };

  return (
    <textarea
      value={textareaValue}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  );
}

// Create a component for list item input
function ListItemInput({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
}) {
  const [inputValue, setInputValue] = useState(value || '');

  // Keep local state in sync with props
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Update local state immediately
    onChange(newValue); // Propagate to parent
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

// Main content block editor component
function ContentBlockEditor({ contentBlocks, onChange }: ContentBlockEditorProps) {
  // Local state for content blocks
  const [blocks, setBlocks] = useState<ContentBlock[]>(contentBlocks);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [showBottomAddBlockMenu, setShowBottomAddBlockMenu] = useState(false);

  // Track pending file operations
  const pendingUploads = useRef<PendingFileUpload[]>([]);
  const pendingDeletions = useRef<string[]>([]);

  // Sync blocks when contentBlocks prop changes
  useEffect(() => {
    setBlocks(contentBlocks);
  }, [contentBlocks]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.add-block-container')) {
        setShowAddBlockMenu(false);
      }
      if (!target.closest('.bottom-add-block-container')) {
        setShowBottomAddBlockMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update a content block
  const handleContentBlockChange = (id: string, field: string, value: any) => {
    // First track any file URLs for deletion if needed
    if (field === 'url' && blocks.find(b => b.id === id)?.url &&
      blocks.find(b => b.id === id)?.url !== value &&
      blocks.find(b => b.id === id)?.url?.includes('blob.vercel-storage.com')) {
      pendingDeletions.current = [...pendingDeletions.current, blocks.find(b => b.id === id)?.url || ''];
    }

    // Update blocks immediately without relying on previous state
    const updatedBlocks = blocks.map(block => {
      if (block.id === id) {
        return { ...block, [field]: value };
      }
      return block;
    });

    // Update local state
    setBlocks(updatedBlocks);

    // Notify parent of the change immediately
    onChange(updatedBlocks, {
      pendingUploads: pendingUploads.current,
      pendingDeletions: pendingDeletions.current
    });
  };

  // Add a new content block
  const handleAddContentBlock = (type: ContentBlockType) => {
    const firstTabId = uuidv4();
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      // Initialize with default values based on type
      ...(type === 'heading' && { level: 2, content: '' }),
      ...(type === 'paragraph' && { content: '' }),
      ...(type === 'list' && { items: [''] }),
      ...(type === 'powerpoint' && { showEmbed: false }),
      ...(type === 'document' && { showEmbed: false }),
      ...(type === 'tabs' && {
        tabs: [{ id: firstTabId, label: 'Tab 1', contentBlocks: [] }],
        defaultTab: firstTabId,
      }),
      ...(type === 'markdown' && { content: '' }),
      ...(type === 'githubReadme' && { url: '' }),
    };

    // Add new block
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);

    // Notify parent
    onChange(newBlocks, {
      pendingUploads: pendingUploads.current,
      pendingDeletions: pendingDeletions.current
    });

    setShowAddBlockMenu(false); // Close the menu after selection
    setShowBottomAddBlockMenu(false); // Close the bottom menu after selection
  };

  // Delete a content block
  const handleDeleteContentBlock = (id: string) => {
    // Find block to delete
    const blockToDelete = blocks.find(block => block.id === id);

    // Add file URL to pending deletions if applicable
    if (blockToDelete?.url && blockToDelete.url.includes('blob.vercel-storage.com')) {
      pendingDeletions.current = [...pendingDeletions.current, blockToDelete.url];
    }

    // Remove any pending uploads for this block
    pendingUploads.current = pendingUploads.current.filter(
      upload => upload.blockId !== id
    );

    // Remove the block
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks);

    // Notify parent
    onChange(newBlocks, {
      pendingUploads: pendingUploads.current,
      pendingDeletions: pendingDeletions.current
    });
  };

  // Handle file selection
  const handleFileSelection = async (id: string, e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);

    // Store the file for later upload
    const pendingUpload: PendingFileUpload = {
      blockId: id,
      file,
      fileType: file.type,
      tempUrl
    };

    // Add to pending uploads
    pendingUploads.current = [...pendingUploads.current, pendingUpload];

    // Update the block with the temporary URL
    handleContentBlockChange(id, 'url', tempUrl);

    toast.success(`File selected: ${file.name}. It will be uploaded when you save the project.`);
  };

  // Handle list item changes
  const handleListItemChange = (blockId: string, index: number, value: string) => {
    // Update blocks immediately without relying on previous state callback
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId && block.items) {
        const newItems = [...block.items];
        newItems[index] = value;
        return { ...block, items: newItems };
      }
      return block;
    });

    // Update local state
    setBlocks(updatedBlocks);

    // Notify parent immediately
    onChange(updatedBlocks, {
      pendingUploads: pendingUploads.current,
      pendingDeletions: pendingDeletions.current
    });
  };

  // Handle adding a list item
  const handleAddListItem = (blockId: string) => {
    // Update blocks immediately without relying on setState callback
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId && block.items) {
        return { ...block, items: [...block.items, ''] };
      }
      return block;
    });

    // Update local state
    setBlocks(updatedBlocks);

    // Notify parent immediately
    onChange(updatedBlocks, {
      pendingUploads: pendingUploads.current,
      pendingDeletions: pendingDeletions.current
    });
  };

  // Handle removing a list item
  const handleRemoveListItem = (blockId: string, index: number) => {
    // Update blocks immediately without relying on setState callback
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId && block.items && block.items.length > 1) {
        const newItems = [...block.items];
        newItems.splice(index, 1);
        return { ...block, items: newItems };
      }
      return block;
    });

    // Update local state
    setBlocks(updatedBlocks);

    // Notify parent immediately
    onChange(updatedBlocks, {
      pendingUploads: pendingUploads.current,
      pendingDeletions: pendingDeletions.current
    });
  };

  // Handle moving a block up
  const handleMoveBlockUp = (index: number) => {
    if (index > 0) {
      const updatedBlocks = [...blocks];
      [updatedBlocks[index - 1], updatedBlocks[index]] = [updatedBlocks[index], updatedBlocks[index - 1]];

      // Update local state
      setBlocks(updatedBlocks);

      // Notify parent
      onChange(updatedBlocks, {
        pendingUploads: pendingUploads.current,
        pendingDeletions: pendingDeletions.current
      });
    }
  };

  // Handle moving a block down
  const handleMoveBlockDown = (index: number) => {
    if (index < blocks.length - 1) {
      const updatedBlocks = [...blocks];
      [updatedBlocks[index], updatedBlocks[index + 1]] = [updatedBlocks[index + 1], updatedBlocks[index]];

      // Update local state
      setBlocks(updatedBlocks);

      // Notify parent
      onChange(updatedBlocks, {
        pendingUploads: pendingUploads.current,
        pendingDeletions: pendingDeletions.current
      });
    }
  };

  // Render content block based on type
  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-2">
            <SimpleTextarea
              value={block.content || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'content', value)}
              placeholder="Heading text"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              rows={2}
            />
            <select
              value={block.level || 2}
              onChange={(e) => handleContentBlockChange(block.id, 'level', Number(e.target.value))}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value={1}>Heading 1 (Large)</option>
              <option value={2}>Heading 2 (Medium)</option>
              <option value={3}>Heading 3 (Small)</option>
              <option value={4}>Heading 4 (Extra Small)</option>
            </select>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-2">
            <SimpleTextarea
              value={block.content || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'content', value)}
              placeholder="Paragraph text"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="file"
                id={`image-${block.id}`}
                accept="image/*"
                onChange={(e) => handleFileSelection(block.id, e, 'image')}
                className="hidden"
              />
              <label
                htmlFor={`image-${block.id}`}
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Image
              </label>
              <SimpleTextInput
                value={block.url || ''}
                onChange={(value) => handleContentBlockChange(block.id, 'url', value)}
                placeholder="Or paste image URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <SimpleTextInput
              value={block.caption || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'caption', value)}
              placeholder="Image caption (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            {block.url && (
              <div className="mt-2 relative max-w-md rounded-md overflow-hidden border border-input">
                <img src={block.url} alt={block.caption || 'Preview'} className="w-full h-auto" />
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <SimpleTextInput
              value={block.url || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'url', value)}
              placeholder="YouTube or Vimeo URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube or Vimeo URL. For YouTube, you can use standard watch URLs or short URLs.
            </p>
            <SimpleTextInput
              value={block.caption || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'caption', value)}
              placeholder="Video caption (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            {block.url && (
              <div className="mt-2 relative rounded-md overflow-hidden border border-input aspect-video">
                <iframe
                  src={convertToYouTubeEmbedUrl(block.url)}
                  title={block.caption || "Embedded video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {block.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center">
                  <span className="mr-2">•</span>
                  <ListItemInput
                    value={item}
                    onChange={(value) => handleListItemChange(block.id, itemIndex, value)}
                    placeholder="List item"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveListItem(block.id, itemIndex)}
                    className="ml-2 p-1 text-muted-foreground hover:text-destructive"
                    disabled={block.items?.length === 1}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddListItem(block.id)}
              className="inline-flex items-center text-sm text-primary hover:text-primary/80"
            >
              <FiPlus size={16} className="mr-1" /> Add Item
            </button>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="file"
                id={`document-${block.id}`}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => handleFileSelection(block.id, e, 'document')}
                className="hidden"
              />
              <label
                htmlFor={`document-${block.id}`}
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Document
              </label>
              <SimpleTextInput
                value={block.url || ''}
                onChange={(value) => handleContentBlockChange(block.id, 'url', value)}
                placeholder="Or paste document URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <SimpleTextInput
              value={block.caption || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'caption', value)}
              placeholder="Document title/caption"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id={`doc-embed-${block.id}`}
                checked={Boolean(block.showEmbed)}
                onChange={(e) => handleContentBlockChange(block.id, 'showEmbed', e.target.checked)}
                className="w-4 h-4 rounded border"
              />
              <label htmlFor={`doc-embed-${block.id}`} className="ml-2 text-sm text-muted-foreground">
                Show document on page (embed viewer)
              </label>
            </div>
          </div>
        );

      case 'powerpoint':
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="file"
                id={`presentation-${block.id}`}
                accept=".ppt,.pptx"
                onChange={(e) => handleFileSelection(block.id, e, 'powerpoint')}
                className="hidden"
              />
              <label
                htmlFor={`presentation-${block.id}`}
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Presentation
              </label>
              <SimpleTextInput
                value={block.url || ''}
                onChange={(value) => handleContentBlockChange(block.id, 'url', value)}
                placeholder="Or paste presentation URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <SimpleTextInput
              value={block.caption || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'caption', value)}
              placeholder="Presentation title/caption"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id={`ppt-embed-${block.id}`}
                checked={Boolean(block.showEmbed)}
                onChange={(e) => handleContentBlockChange(block.id, 'showEmbed', e.target.checked)}
                className="w-4 h-4 rounded border"
              />
              <label htmlFor={`ppt-embed-${block.id}`} className="ml-2 text-sm text-muted-foreground">
                Show presentation on page (embed viewer)
              </label>
            </div>
          </div>
        );

      case 'tabs':
        return (
          <TabBlockEditor
            block={block as ContentBlock & { type: 'tabs'; tabs: any[] }}
            onChange={(updatedTabs, uploads, deletions) => {
              handleContentBlockChange(block.id, 'tabs', updatedTabs);

              if (uploads) {
                uploads.forEach(upload => {
                  pendingUploads.current = [...pendingUploads.current, upload];
                });
              }
              if (deletions) {
                deletions.forEach(deletion => {
                  if (!pendingDeletions.current.includes(deletion)) {
                    pendingDeletions.current = [...pendingDeletions.current, deletion];
                  }
                });
              }
            }}
          />
        );

      case 'markdown':
        return (
          <div className="space-y-3">
            <SimpleTextarea
              value={block.content || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'content', value)}
              placeholder="# Markdown Content

Write your markdown here...

## Features
- **Bold text**
- *Italic text*
- `Code snippets`
- [Links](https://example.com)
- ![Images](image-url.jpg)

### Code Block
```javascript
console.log('Hello World');
```"
              rows={15}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supports GitHub-flavored markdown:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Headers (# ## ###)</li>
                <li>Bold (**text**) and italic (*text*)</li>
                <li>Links and images</li>
                <li>Code blocks (```language)</li>
                <li>Tables and lists</li>
                <li>Blockquotes and horizontal rules</li>
              </ul>
            </div>
          </div>
        );

      case 'githubReadme':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FiGithub className="h-5 w-5 text-muted-foreground" />
              <SimpleTextInput
                value={block.url || ''}
                onChange={(value) => handleContentBlockChange(block.id, 'url', value)}
                placeholder="https://github.com/username/repository"
                className="flex-1 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <SimpleTextInput
              value={block.caption || ''}
              onChange={(value) => handleContentBlockChange(block.id, 'caption', value)}
              placeholder="Branch name (optional, defaults to main/master)"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Paste a GitHub repository URL to automatically display its README.</p>
              <p className="text-primary">Examples:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>https://github.com/facebook/react</li>
                <li>https://github.com/microsoft/vscode</li>
                <li>https://github.com/vercel/next.js</li>
              </ul>
              <p className="mt-2">Images in the README will be automatically resolved and displayed.</p>
            </div>
            
            {block.url && (
              <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FiGithub className="h-4 w-4" />
                  <span>README will be fetched from GitHub when you save the project.</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Content auto-refreshes every 5 minutes on the public page.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative add-block-container">
          <button
            type="button"
            onClick={() => setShowAddBlockMenu(!showAddBlockMenu)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Block
          </button>
          {showAddBlockMenu && (
            <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-popover">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('heading')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('paragraph')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('image')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('video')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Embedded Video
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('list')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('document')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Document
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('powerpoint')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Presentation
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('tabs')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground border-t border-border"
                >
                  Tabs
                </button>
                <div className="border-t border-border my-1"></div>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('markdown')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                >
                  <FiFileText className="h-4 w-4" />
                  Markdown Content
                </button>
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('githubReadme')}
                  className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                >
                  <FiGithub className="h-4 w-4" />
                  GitHub README
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {blocks.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Content Blocks Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add content blocks to build your project page. You can add headings, paragraphs, images, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => handleAddContentBlock('heading')}
              className="inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm font-medium hover:bg-muted/80"
            >
              <FiPlus className="mr-1 h-3 w-3" />
              Heading
            </button>
            <button
              type="button"
              onClick={() => handleAddContentBlock('paragraph')}
              className="inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm font-medium hover:bg-muted/80"
            >
              <FiPlus className="mr-1 h-3 w-3" />
              Paragraph
            </button>
            <button
              type="button"
              onClick={() => handleAddContentBlock('image')}
              className="inline-flex items-center rounded-md bg-muted px-3 py-1 text-sm font-medium hover:bg-muted/80"
            >
              <FiPlus className="mr-1 h-3 w-3" />
              Image
            </button>
          </div>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="space-y-6">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="border rounded-md p-4 bg-background"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="font-medium capitalize text-sm">
                    {block.type} Block
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {index + 1} of {blocks.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleMoveBlockUp(index)}
                    disabled={index === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <FiChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveBlockDown(index)}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <FiChevronDown size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContentBlock(block.id)}
                    className="p-1 text-destructive hover:text-destructive/80"
                  >
                    <FiTrash size={18} />
                  </button>
                </div>
              </div>
              {renderContentBlock(block, index)}
            </div>
          ))}

          {/* Bottom Add Block Button */}
          <div className="flex justify-center pt-6">
            <div className="relative bottom-add-block-container">
              <button
                type="button"
                onClick={() => setShowBottomAddBlockMenu(!showBottomAddBlockMenu)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Block
              </button>
              {showBottomAddBlockMenu && (
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 rounded-md shadow-lg bg-popover z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('heading')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('paragraph')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('image')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('video')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Embedded Video
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('list')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('document')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Document
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('powerpoint')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Presentation
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('tabs')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground border-t border-border"
                    >
                      Tabs
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('markdown')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                    >
                      <FiFileText className="h-4 w-4" />
                      Markdown Content
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock('githubReadme')}
                      className="text-left w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                    >
                      <FiGithub className="h-4 w-4" />
                      GitHub README
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentBlockEditor; 