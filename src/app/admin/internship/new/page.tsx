'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiX, FiArrowUp, FiArrowDown, FiTrash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ContentBlockEditor, { PendingFileUpload } from '@/components/ContentBlockEditor';
import { ContentBlock } from '@/components/content-blocks';

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(date?: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export default function NewInternshipPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJob, setCurrentJob] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTechnology, setNewTechnology] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    shortDesc: '',
    outcome: '',
  });

  // Add state to track file changes
  const [pendingUploads, setPendingUploads] = useState<PendingFileUpload[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setCurrentJob(checked);

    // Clear end date if current job is checked
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        endDate: '',
      }));
    }
  };

  // Add a technology
  const handleAddTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      setTechnologies([...technologies, newTechnology.trim()]);
      setNewTechnology('');
    }
  };

  // Remove a technology
  const handleRemoveTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  // Generate a unique ID for content blocks
  const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle content blocks update with file tracking
  const handleContentBlocksUpdate = (blocks: ContentBlock[], changes?: any) => {
    setContentBlocks(blocks);

    // Update pending changes if provided
    if (changes) {
      setPendingUploads(changes.pendingUploads || []);
      setPendingDeletions(changes.pendingDeletions || []);
    }
  };

  // Handle form submission with deferred file operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Upload any pending content block files
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

      // Filter out any invalid blocks
      const validBlocks = updatedContentBlocks.filter(block => {
        if (block.type === 'paragraph' || block.type === 'heading') {
          return block.content && block.content.trim() !== '';
        } else if (block.type === 'list') {
          return block.items && block.items.some(item => item.trim() !== '');
        } else if ((block.type === 'image' || block.type === 'document' || block.type === 'powerpoint') && block.url) {
          return block.url.trim() !== '';
        }
        return false;
      });

      const payload = {
        ...formData,
        currentJob,
        technologies,
        // Process content blocks for submission, ensuring boolean fields are correctly typed
        contentBlocks: validBlocks.map(block => {
          if (block.type === 'list' && block.items) {
            return {
              ...block,
              items: block.items.filter(item => item.trim() !== '') // Remove empty items
            };
          }
          // Ensure boolean fields are properly typed
          if (block.type === 'powerpoint' || block.type === 'document') {
            return { ...block, showEmbed: Boolean(block.showEmbed) };
          }
          return block;
        }),
      };

      const response = await fetch('/api/internship/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : { error: `HTTP ${response.status}: ${response.statusText}` };
        throw new Error(data.error || 'Failed to create internship');
      }

      toast.success('Internship created successfully!');
      router.push('/admin/internship');
      router.refresh();
    } catch (error) {
      console.error('Error creating internship:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to create internship'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-32">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Internship</h1>
          <p className="text-muted-foreground">Create a new internship experience with rich content</p>
        </div>
        <Link
          href="/admin/internship"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium leading-none">
              Job Title
            </label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g., Software Engineering Intern"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium leading-none">
              Company
            </label>
            <input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g., Google"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium leading-none">
            Location (Optional)
          </label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Mountain View, CA"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium leading-none">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="endDate" className="text-sm font-medium leading-none">
                End Date
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="currentJob"
                  type="checkbox"
                  checked={currentJob}
                  onChange={handleCheckbox}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="currentJob" className="text-sm text-muted-foreground">
                  Current internship
                </label>
              </div>
            </div>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={currentJob}
              required={!currentJob}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="shortDesc" className="text-sm font-medium leading-none">
            Short Description
          </label>
          <textarea
            id="shortDesc"
            name="shortDesc"
            rows={3}
            value={formData.shortDesc}
            onChange={handleChange}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Provide a brief summary of your internship (will be shown in listings)"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Technologies Used
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {technologies.map((tech) => (
              <div
                key={tech}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(tech)}
                  className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newTechnology}
              onChange={(e) => setNewTechnology(e.target.value)}
              placeholder="Add a technology (e.g., React, Python, AWS)"
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={handleAddTechnology}
              className="h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-4">Content Blocks</label>
            <ContentBlockEditor
              contentBlocks={contentBlocks}
              onChange={handleContentBlocksUpdate}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="outcome" className="text-sm font-medium leading-none">
            Outcome / Achievements (Optional)
          </label>
          <textarea
            id="outcome"
            name="outcome"
            rows={4}
            value={formData.outcome}
            onChange={handleChange}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Describe the key achievements, outcomes or skills gained during this internship"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              <FiSave className="mr-2 h-4 w-4" />
              Save Internship
            </>
          )}
        </button>
      </form>
    </div>
  );
} 