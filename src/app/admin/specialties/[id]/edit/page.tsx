'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiCode, FiLayout, FiEdit3, FiMessageSquare, FiBookOpen, FiHeart, FiDatabase, FiServer, FiGlobe, FiMonitor, FiSmartphone, FiTool, FiGrid, FiLayers, FiActivity, FiAward, FiBriefcase, FiCoffee, FiCpu, FiFileText, FiGitBranch, FiGithub, FiLinkedin, FiSettings } from 'react-icons/fi';
import { notFound } from 'next/navigation';
import toast from 'react-hot-toast';

// Example icons to display
const exampleIcons = [
  { name: 'code', icon: <FiCode /> },
  { name: 'layout', icon: <FiLayout /> },
  { name: 'edit-3', icon: <FiEdit3 /> },
  { name: 'message-square', icon: <FiMessageSquare /> },
  { name: 'book-open', icon: <FiBookOpen /> },
  { name: 'heart', icon: <FiHeart /> },
  { name: 'database', icon: <FiDatabase /> },
  { name: 'server', icon: <FiServer /> },
  { name: 'globe', icon: <FiGlobe /> },
  { name: 'monitor', icon: <FiMonitor /> },
  { name: 'smartphone', icon: <FiSmartphone /> },
  { name: 'tool', icon: <FiTool /> },
  { name: 'grid', icon: <FiGrid /> },
  { name: 'layers', icon: <FiLayers /> },
  { name: 'activity', icon: <FiActivity /> },
  { name: 'award', icon: <FiAward /> },
  { name: 'briefcase', icon: <FiBriefcase /> },
  { name: 'coffee', icon: <FiCoffee /> },
  { name: 'cpu', icon: <FiCpu /> },
  { name: 'file-text', icon: <FiFileText /> },
  { name: 'git-branch', icon: <FiGitBranch /> },
  { name: 'github', icon: <FiGithub /> },
  { name: 'linkedin', icon: <FiLinkedin /> },
  { name: 'settings', icon: <FiSettings /> },
];



type SpecialtyParams = {
  params: {
    id: string;
  };
};

export default function EditSpecialty({ params }: SpecialtyParams) {
  const router = useRouter();
  const { id } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    async function loadSpecialty() {
      try {
        const response = await fetch(`/api/specialties/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return notFound();
          }
          throw new Error('Failed to load specialty');
        }
        
        const data = await response.json();
        setFormData({
          name: data.name,
          icon: data.icon,
          color: data.color || '#3b82f6'
        });
      } catch (error) {
        console.error('Error loading specialty:', error);
        toast.error('Failed to load specialty');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSpecialty();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconName
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/specialties/${id}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          resolve();
          router.push('/admin/specialties');
          router.refresh();
        } else {
          const data = await response.json();
          reject(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error updating specialty:', error);
        reject('Failed to update specialty');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Updating specialty...',
      success: 'Specialty updated successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Specialty</h1>
          <p className="text-muted-foreground">Update details for this specialty</p>
        </div>
        <Link
          href="/admin/specialties"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Specialty Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Frontend Development, UI/UX Design, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="icon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Icon Name
          </label>
          <input
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., code, layout, edit-3, etc."
            required
          />
          
          <p className="text-sm text-muted-foreground mt-4 mb-2">
            Select from the examples below or enter a Feather icon name from <a href="https://feathericons.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Feather Icons</a>
          </p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
            {exampleIcons.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleIconSelect(item.name)}
                className={`flex flex-col items-center justify-center p-2 rounded-md border ${
                  formData.icon === item.name ? 'border-primary bg-primary/10' : 'border-input'
                } hover:bg-accent hover:text-accent-foreground`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="color" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Color
          </label>
          <div className="flex items-center gap-4">
            <input
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              className="h-10 w-20 cursor-pointer rounded-md border border-input bg-background"
            />
            <span className="text-sm">{formData.color}</span>
          </div>
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
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
} 