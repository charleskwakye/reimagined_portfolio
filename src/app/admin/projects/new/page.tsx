'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { FiArrowLeft, FiPlus, FiTrash, FiUpload, FiX, FiChevronUp, FiChevronDown, FiGithub, FiLink, FiYoutube } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PendingFileUpload } from '@/components/ContentBlockEditor';
import ContentBlockEditor from '@/components/ContentBlockEditor';
import { ContentBlock, ContentBlockType } from '@/components/content-blocks';

export default function NewProjectPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    coverImage: '',
    githubLink: '',
    demoLink: '',
    videoUrl: '',
    featured: false,
  });

  // Technologies state
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');

  // Content blocks state with proper initialization to ensure valid JSON
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [showBottomAddBlockMenu, setShowBottomAddBlockMenu] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state to track file changes
  const [pendingUploads, setPendingUploads] = useState<PendingFileUpload[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Handle technology addition
  const handleAddTech = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  // Handle technology removal
  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  // Function to toggle the "Add Block" dropdown menu
  const toggleAddBlockMenu = () => {
    setShowAddBlockMenu(!showAddBlockMenu);
  };

  // Function to toggle the bottom "Add Block" dropdown menu
  const toggleBottomAddBlockMenu = () => {
    setShowBottomAddBlockMenu(!showBottomAddBlockMenu);
  };

  // Close dropdown when clicking outside
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

  // Add a new content block
  const handleAddContentBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      // Initialize with default values based on type
      ...(type === 'heading' && { level: 2, content: '' }),
      ...(type === 'paragraph' && { content: '' }),
      ...(type === 'list' && { items: [''] }),
    };

    setContentBlocks([...contentBlocks, newBlock]);
    setShowAddBlockMenu(false); // Close the menu after selection
  };

  // Handle content block updates
  const handleContentBlockChange = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(
      contentBlocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  // Handle content block deletion
  const handleDeleteContentBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  // Handle list item changes
  const handleListItemChange = (blockId: string, index: number, value: string) => {
    setContentBlocks(
      contentBlocks.map(block => {
        if (block.id === blockId && block.items) {
          const newItems = [...block.items];
          newItems[index] = value;
          return { ...block, items: newItems };
        }
        return block;
      })
    );
  };

  // Handle adding a list item
  const handleAddListItem = (blockId: string) => {
    setContentBlocks(
      contentBlocks.map(block => {
        if (block.id === blockId && block.items) {
          return { ...block, items: [...block.items, ''] };
        }
        return block;
      })
    );
  };

  // Handle removing a list item
  const handleRemoveListItem = (blockId: string, index: number) => {
    setContentBlocks(
      contentBlocks.map(block => {
        if (block.id === blockId && block.items && block.items.length > 1) {
          const newItems = [...block.items];
          newItems.splice(index, 1);
          return { ...block, items: newItems };
        }
        return block;
      })
    );
  };

  // Handle moving a block up
  const handleMoveBlockUp = (index: number) => {
    if (index > 0) {
      const updatedBlocks = [...contentBlocks];
      [updatedBlocks[index - 1], updatedBlocks[index]] = [updatedBlocks[index], updatedBlocks[index - 1]];
      setContentBlocks(updatedBlocks);
    }
  };

  // Handle moving a block down
  const handleMoveBlockDown = (index: number) => {
    if (index < contentBlocks.length - 1) {
      const updatedBlocks = [...contentBlocks];
      [updatedBlocks[index], updatedBlocks[index + 1]] = [updatedBlocks[index + 1], updatedBlocks[index]];
      setContentBlocks(updatedBlocks);
    }
  };

  // Handle file uploads (for images, documents, etc.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading file...');

      // Create a URL with the filename parameter
      const uploadUrl = `/api/upload?filename=${encodeURIComponent(file.name)}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      const fileUrl = data.url;

      toast.dismiss();
      toast.success('File uploaded successfully');

      // Update either cover image or content block
      if (blockId) {
        handleContentBlockChange(blockId, { url: fileUrl });
      } else {
        setFormData({
          ...formData,
          coverImage: fileUrl,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.dismiss();
      toast.error('Failed to upload file');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Upload cover image if available
      let coverImageUrl = formData.coverImage;

      if (coverImageFile) {
        toast.loading('Uploading cover image...');

        try {
          // Create a URL with the filename parameter
          const uploadUrl = `/api/upload?filename=${encodeURIComponent(coverImageFile.name)}`;

          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: coverImageFile,
            headers: {
              'Content-Type': coverImageFile.type,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to upload cover image');
          }

          const data = await response.json();
          coverImageUrl = data.url;

          toast.dismiss();
          toast.success('Cover image uploaded');
        } catch (error) {
          console.error('Error uploading cover image:', error);
          toast.dismiss();
          toast.error('Failed to upload cover image');
          // Continue with project creation
        }
      }

      // Step 2: Upload any pending content block files
      const updatedContentBlocks = [...contentBlocks];

      if (pendingUploads.length > 0) {
        toast.loading(`Uploading ${pendingUploads.length} files...`);

        // Process uploads one by one
        for (const upload of pendingUploads) {
          try {
            // Create a URL with the filename parameter
            const uploadUrl = `/api/upload?filename=${encodeURIComponent(upload.file.name)}`;

            const response = await fetch(uploadUrl, {
              method: 'POST',
              body: upload.file,
              headers: {
                'Content-Type': upload.fileType,
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to upload file: ${upload.file.name}`);
            }

            const data = await response.json();
            const fileUrl = data.url;

            // Update the corresponding block with the real URL
            const blockIndex = updatedContentBlocks.findIndex(block => block.id === upload.blockId);
            if (blockIndex !== -1) {
              updatedContentBlocks[blockIndex] = {
                ...updatedContentBlocks[blockIndex],
                url: fileUrl,
              };
            }
          } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(`Failed to upload ${upload.file.name}`);
            // Continue with other uploads
          }
        }

        toast.dismiss();
        toast.success('Files uploaded successfully');
      }

      // Step 3: Create the project with real URLs
      const projectData = {
        title: formData.title,
        shortDesc: formData.shortDesc,
        coverImage: coverImageUrl,
        githubLink: formData.githubLink,
        demoLink: formData.demoLink,
        videoUrl: formData.videoUrl,
        technologies: formData.technologies,
        featured: formData.featured,
        contentBlocks: updatedContentBlocks.map(block => {
          // Ensure boolean fields are properly typed
          if (block.type === 'powerpoint' || block.type === 'document') {
            return { ...block, showEmbed: Boolean(block.showEmbed) };
          }
          return block;
        }),
      };

      const response = await fetch('/api/project/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      toast.success('Project created successfully');
      router.push('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the file upload handler for cover image
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file for later upload
    setCoverImageFile(file);

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    setFormData({ ...formData, coverImage: tempUrl });

    toast.success('Cover image selected. It will be uploaded when you save the project.');
  };

  // Handle content blocks update with file tracking
  const handleContentBlocksChange = (blocks: ContentBlock[], changes?: any) => {
    setContentBlocks(blocks);

    // Update pending changes if provided
    if (changes) {
      setPendingUploads(changes.pendingUploads || []);
      setPendingDeletions(changes.pendingDeletions || []);
    }
  };

  // Render content block based on type
  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <select
                value={block.level || 2}
                onChange={(e) => handleContentBlockChange(block.id, { level: parseInt(e.target.value) })}
                className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
              </select>
              <input
                type="text"
                value={block.content || ''}
                onChange={(e) => handleContentBlockChange(block.id, { content: e.target.value })}
                placeholder="Heading text"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-2">
            <textarea
              value={block.content || ''}
              onChange={(e) => handleContentBlockChange(block.id, { content: e.target.value })}
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
                onChange={(e) => handleFileUpload(e, block.id)}
                className="hidden"
              />
              <label
                htmlFor={`image-${block.id}`}
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Image
              </label>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => handleContentBlockChange(block.id, { url: e.target.value })}
                placeholder="Or paste image URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => handleContentBlockChange(block.id, { caption: e.target.value })}
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
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleContentBlockChange(block.id, { url: e.target.value })}
              placeholder="YouTube or Vimeo embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => handleContentBlockChange(block.id, { caption: e.target.value })}
              placeholder="Video caption (optional)"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            {block.url && (
              <div className="mt-2 relative rounded-md overflow-hidden border border-input aspect-video">
                <iframe
                  src={block.url}
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
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListItemChange(block.id, itemIndex, e.target.value)}
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
                onChange={(e) => handleFileUpload(e, block.id)}
                className="hidden"
              />
              <label
                htmlFor={`document-${block.id}`}
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Document
              </label>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => handleContentBlockChange(block.id, { url: e.target.value })}
                placeholder="Or paste document URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => handleContentBlockChange(block.id, { caption: e.target.value })}
              placeholder="Document title/caption"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id={`showEmbed_${block.id}`}
                checked={block.showEmbed || false}
                onChange={(e) => handleContentBlockChange(block.id, { showEmbed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={`showEmbed_${block.id}`} className="ml-2 text-sm text-muted-foreground">
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
                onChange={(e) => handleFileUpload(e, block.id)}
                className="hidden"
              />
              <label
                htmlFor={`presentation-${block.id}`}
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Presentation
              </label>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => handleContentBlockChange(block.id, { url: e.target.value })}
                placeholder="Or paste presentation URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => handleContentBlockChange(block.id, { caption: e.target.value })}
              placeholder="Presentation title/caption"
              className="w-full rounded-md border border-input bg-background px-3 py-1"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id={`showEmbed_${block.id}`}
                checked={block.showEmbed || false}
                onChange={(e) => handleContentBlockChange(block.id, { showEmbed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={`showEmbed_${block.id}`} className="ml-2 text-sm text-muted-foreground">
                Show presentation on page (embed viewer)
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pb-32">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground">Create a new project to showcase</p>
        </div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="e.g., E-commerce Platform"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="shortDesc" className="text-sm font-medium">
              Short Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="shortDesc"
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Brief overview of the project (1-2 sentences)"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="githubLink" className="text-sm font-medium">
                GitHub Repository URL
              </label>
              <div className="flex items-center rounded-md border border-input bg-background">
                <div className="flex items-center justify-center px-3 text-muted-foreground">
                  <FiGithub size={16} />
                </div>
                <input
                  type="url"
                  id="githubLink"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent px-3 py-2 border-0 outline-none"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="demoLink" className="text-sm font-medium">
                Live Demo URL
              </label>
              <div className="flex items-center rounded-md border border-input bg-background">
                <div className="flex items-center justify-center px-3 text-muted-foreground">
                  <FiLink size={16} />
                </div>
                <input
                  type="url"
                  id="demoLink"
                  name="demoLink"
                  value={formData.demoLink}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent px-3 py-2 border-0 outline-none"
                  placeholder="https://yourproject.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="videoUrl" className="text-sm font-medium">
              Video URL (YouTube, Vimeo, etc.)
            </label>
            <div className="flex items-center rounded-md border border-input bg-background">
              <div className="flex items-center justify-center px-3 text-muted-foreground">
                <FiYoutube size={16} />
              </div>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="flex-1 bg-transparent px-3 py-2 border-0 outline-none"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-sm font-medium">
              Cover Image
            </label>
            <div className="flex items-center">
              <input
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="sr-only"
              />
              <label
                htmlFor="coverImage"
                className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
              >
                <FiUpload className="mr-2" />
                Upload Image
              </label>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                placeholder="Or paste image URL"
                className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
              />
            </div>
            {formData.coverImage && (
              <div className="mt-2 relative max-w-md rounded-md overflow-hidden border border-input">
                <img src={formData.coverImage} alt="Cover preview" className="w-full h-auto" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-medium">
                Feature this project on homepage
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Featured projects will be prominently displayed in the featured section on your homepage.
            </p>
          </div>
        </div>

        {/* Technologies */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Technologies Used</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="Add a technology (e.g., React, Node.js, PostgreSQL)"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="ml-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add
            </button>
          </div>

          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-1 rounded-full p-1 hover:bg-primary/20"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Blocks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Content</h2>
            <div className="flex space-x-2">
              <div className="relative add-block-container">
                <button
                  type="button"
                  onClick={toggleAddBlockMenu}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Block
                </button>
                {showAddBlockMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover z-10">
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {contentBlocks.length === 0 && (
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

          {contentBlocks.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Content Blocks</h2>
              <ContentBlockEditor
                contentBlocks={contentBlocks}
                onChange={handleContentBlocksChange}
              />

              {/* Bottom Add Block Button */}
              <div className="flex justify-center pt-4">
                <div className="relative bottom-add-block-container">
                  <button
                    type="button"
                    onClick={toggleBottomAddBlockMenu}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link
            href="/admin/projects"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
} 