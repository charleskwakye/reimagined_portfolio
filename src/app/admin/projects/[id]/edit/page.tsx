'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { FiArrowLeft, FiPlus, FiTrash, FiUpload, FiX, FiChevronUp, FiChevronDown, FiGithub, FiLink, FiYoutube, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Project } from '@/lib/types';
import ContentBlockEditor, { PendingFileUpload } from '@/components/ContentBlockEditor';
import { ContentBlock, ContentBlockType } from '@/components/content-blocks';
import { deleteVercelBlobFile } from '@/lib/utils';

export default function EditProjectPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Use React.use() to properly unwrap the params Promise if it is one
  const resolvedParams = 'then' in params ? use(params) : params;
  const projectId = resolvedParams.id;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0); // Track last update time to prevent rapid re-renders

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    coverImage: '',
    githubLink: '',
    demoLink: '',
    videoUrl: '',
    technologies: [] as string[],
    featured: false,
    contentBlocks: [] as ContentBlock[],
  });

  // Add state to track file changes
  const [pendingUploads, setPendingUploads] = useState<PendingFileUpload[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const project: Project = await response.json();
        setFormData({
          title: project.title,
          shortDesc: project.shortDesc,
          coverImage: project.coverImage || '',
          githubLink: project.githubLink || '',
          demoLink: project.demoLink || '',
          videoUrl: project.videoUrl || '',
          technologies: project.technologies,
          featured: project.featured,
          contentBlocks: project.contentBlocks as ContentBlock[],
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        router.push('/admin/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router]);

  // Cleanup temporary URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any temporary URLs created for cover image
      if (coverImageFile && formData.coverImage && !formData.coverImage.startsWith('http')) {
        URL.revokeObjectURL(formData.coverImage);
      }

      // Clean up any temporary URLs created for content blocks
      pendingUploads.forEach(upload => {
        if (upload.tempUrl) {
          URL.revokeObjectURL(upload.tempUrl);
        }
      });
    };
  }, [coverImageFile, formData.coverImage, pendingUploads]);

  // Handle form submission with file operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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

          // Clean up the temporary URL
          if (formData.coverImage && !formData.coverImage.startsWith('http')) {
            URL.revokeObjectURL(formData.coverImage);
          }

          toast.dismiss();
          toast.success('Cover image uploaded');
        } catch (error) {
          console.error('Error uploading cover image:', error);
          toast.dismiss();
          toast.error('Failed to upload cover image');
          // Continue with project update
        }
      }

      // Step 2: Upload any pending content block files
      const updatedContentBlocks = [...formData.contentBlocks];

      if (pendingUploads.length > 0) {
        toast.loading(`Uploading ${pendingUploads.length} files...`);

        // Process uploads one by one to prevent UI freezing
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

            // Small delay to prevent UI freezing
            await new Promise(resolve => setTimeout(resolve, 10));
          } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(`Failed to upload ${upload.file.name}`);
            // Continue with other uploads
          }
        }

        toast.dismiss();
        toast.success('Files uploaded successfully');
      }

      // Step 3: Delete any pending files
      if (pendingDeletions.length > 0) {
        toast.loading(`Deleting ${pendingDeletions.length} files...`);

        // Process deletions in batches to prevent UI freezing
        const batchSize = 3;
        for (let i = 0; i < pendingDeletions.length; i += batchSize) {
          const batch = pendingDeletions.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (url) => {
              try {
                return await deleteVercelBlobFile(url);
              } catch (error) {
                console.error('Error deleting file:', error);
                return false;
              }
            })
          );
          // Small delay to prevent UI freezing
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        toast.dismiss();
        toast.success(`Files deleted successfully`);
      }

      // Step 4: Ensure content block types are correctly formatted
      const processedContentBlocks = updatedContentBlocks.map(block => {
        // Create a clean copy of the block to ensure all properties are preserved
        const cleanBlock = { ...block };

        // Ensure boolean fields are properly typed
        if (block.type === 'powerpoint' || block.type === 'document') {
          cleanBlock.showEmbed = Boolean(block.showEmbed);
        }

        // Make sure all content fields are properly preserved as strings
        if (block.content !== undefined) {
          cleanBlock.content = String(block.content);
        }

        // Ensure lists have their items preserved
        if (block.items) {
          cleanBlock.items = [...block.items];
        }

        return cleanBlock;
      });

      // Step 5: Update the project with the real URLs - use the direct route, not the update route
      const projectData = {
        id: resolvedParams.id,
        title: formData.title,
        shortDesc: formData.shortDesc,
        coverImage: coverImageUrl,
        githubLink: formData.githubLink,
        demoLink: formData.demoLink,
        videoUrl: formData.videoUrl,
        technologies: formData.technologies,
        featured: formData.featured,
        contentBlocks: processedContentBlocks,
      };

      console.log('Saving project data:', projectData);

      const response = await fetch(`/api/project/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Failed to update project: ${errorData.error || response.statusText}`);
      }

      toast.success('Project updated successfully');

      // Reset pending changes
      setPendingUploads([]);
      setPendingDeletions([]);
      setCoverImageFile(null);

      router.push('/admin/projects');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle technologies input - improved tag-based approach
  const handleTechnologies = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If the last character is a comma, add the tech
    if (inputValue.endsWith(',')) {
      const newTech = inputValue.slice(0, -1).trim();
      if (newTech && !formData.technologies.includes(newTech)) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, newTech]
        }));
      }
      e.target.value = '';
    }
  };

  // Add a technology when Enter is pressed
  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const newTech = target.value.trim();

      if (newTech && !formData.technologies.includes(newTech)) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, newTech]
        }));
      }
      target.value = '';
    }
  };

  // Remove a technology
  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  // Move a technology up in the list
  const moveTechUp = (index: number) => {
    if (index > 0) {
      setFormData(prev => {
        const updatedTechs = [...prev.technologies];
        [updatedTechs[index - 1], updatedTechs[index]] = [updatedTechs[index], updatedTechs[index - 1]];
        return {
          ...prev,
          technologies: updatedTechs
        };
      });
    }
  };

  // Move a technology down in the list
  const moveTechDown = (index: number) => {
    setFormData(prev => {
      if (index < prev.technologies.length - 1) {
        const updatedTechs = [...prev.technologies];
        [updatedTechs[index], updatedTechs[index + 1]] = [updatedTechs[index + 1], updatedTechs[index]];
        return {
          ...prev,
          technologies: updatedTechs
        };
      }
      return prev;
    });
  };

  // Update the file upload handler for cover image
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file for later upload
    setCoverImageFile(file);

    // If there's an existing cover image from Vercel Blob, mark it for deletion
    if (formData.coverImage && formData.coverImage.includes('blob.vercel-storage.com')) {
      setPendingDeletions(prev => [...prev, formData.coverImage]);
    }

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, coverImage: tempUrl }));

    toast.success(`Cover image "${file.name}" selected. It will be uploaded when you save the project.`);
  };

  // Handle content blocks update with file tracking - simplify for responsiveness
  const handleContentBlocksUpdate = (blocks: ContentBlock[], changes?: any) => {
    // Directly update form data with the blocks received from the ContentBlockEditor
    setFormData(prevData => ({
      ...prevData,
      contentBlocks: blocks
    }));

    // Update pending uploads and deletions if provided
    if (changes) {
      if (changes.pendingUploads) {
        setPendingUploads(changes.pendingUploads);
      }

      if (changes.pendingDeletions) {
        setPendingDeletions(changes.pendingDeletions);
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary/50 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <button
            onClick={() => router.push('/admin/projects')}
            className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-accent"
          >
            <FiX className="mr-2" />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Description</label>
              <input
                type="text"
                name="shortDesc"
                value={formData.shortDesc}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <input
                    type="file"
                    id="cover-image"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-image"
                    className="flex items-center justify-center cursor-pointer border border-dashed border-input rounded-md px-3 py-2 bg-muted text-muted-foreground"
                  >
                    <FiUpload className="mr-2" />
                    Upload Cover Image
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="Or paste image URL"
                    className="flex-1 ml-2 rounded-md border border-input bg-background px-3 py-1"
                  />
                </div>
                {formData.coverImage && (
                  <div className="relative">
                    <div className="mt-2 relative max-w-md rounded-md overflow-hidden border border-input">
                      <img src={formData.coverImage} alt="Cover preview" className="w-full h-auto" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // If there's an existing cover image from Vercel Blob, mark it for deletion
                        if (formData.coverImage && formData.coverImage.includes('blob.vercel-storage.com')) {
                          setPendingDeletions(prev => [...prev, formData.coverImage]);
                        }
                        // Clear the cover image and file
                        setFormData({ ...formData, coverImage: '' });
                        setCoverImageFile(null);
                      }}
                      className="absolute top-4 right-4 p-1 bg-background/80 rounded-full text-destructive hover:bg-background"
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GitHub Link</label>
              <input
                type="url"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Demo Link</label>
              <input
                type="url"
                name="demoLink"
                value={formData.demoLink}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Technologies</label>
              <div className="space-y-3">
                <div className="flex flex-col gap-2 mb-2">
                  {formData.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >
                      <div className="bg-secondary/30 text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-sm flex-grow flex items-center">
                        {tech}
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => moveTechUp(index)}
                          disabled={index === 0}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                          title="Move up"
                        >
                          <FiChevronUp size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTechDown(index)}
                          disabled={index === formData.technologies.length - 1}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                          title="Move down"
                        >
                          <FiChevronDown size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="p-1 text-destructive hover:text-destructive/80"
                          title="Remove"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type a technology and press Enter or comma"
                    onChange={handleTechnologies}
                    onKeyDown={handleTechKeyDown}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="rounded border-input"
                />
                <span className="text-sm font-medium">Featured Project</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Content Blocks</h2>
            <ContentBlockEditor
              contentBlocks={formData.contentBlocks}
              onChange={handleContentBlocksUpdate}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/projects')}
              className="px-4 py-2 border rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/50 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 