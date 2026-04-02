'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { notFound } from 'next/navigation';
import toast from 'react-hot-toast';

// Proficiency options with display names
const proficiencyOptions = [
  { value: 'Native', label: 'Native' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Basic', label: 'Basic' },
  { value: 'Beginner', label: 'Beginner' }
];

type LanguageParams = {
  params: {
    id: string;
  };
};

export default function EditLanguagePage({ params }: LanguageParams) {
  const router = useRouter();
  const { id } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    proficiency: ''
  });

  useEffect(() => {
    async function loadLanguage() {
      try {
        const response = await fetch(`/api/languages/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return notFound();
          }
          throw new Error('Failed to load language');
        }
        
        const data = await response.json();
        setFormData({
          name: data.name,
          proficiency: data.proficiency
        });
      } catch (error) {
        console.error('Error loading language:', error);
        toast.error('Failed to load language');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLanguage();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/languages/${id}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          resolve();
          router.push('/admin/languages');
          router.refresh();
        } else {
          const data = await response.json();
          reject(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error updating language:', error);
        reject('Failed to update language');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Updating language...',
      success: 'Language updated successfully!',
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Language</h1>
          <p className="text-muted-foreground">Update language details</p>
        </div>
        <Link
          href="/admin/languages"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Language Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., English, Spanish, French, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="proficiency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Proficiency Level
          </label>
          <select
            id="proficiency"
            name="proficiency"
            value={formData.proficiency}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            {proficiencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Select the level of proficiency for this language
          </p>
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