'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiCheck } from 'react-icons/fi';
import { notFound } from 'next/navigation';
import toast from 'react-hot-toast';

// Helper function to format date for input
function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

interface EducationParams {
  params: {
    id: string;
  };
}

export default function EditEducationPage({ params }: EducationParams) {
  const { id } = params;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  useEffect(() => {
    async function loadEducation() {
      try {
        const response = await fetch(`/api/education/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to load education data');
        }
        
        const data = await response.json();
        console.log('Education data loaded:', data);
        console.log('Current status:', data.current);
        
        setFormData({
          degree: data.degree || '',
          institution: data.institution || '',
          location: data.location || '',
          startDate: formatDateForInput(data.startDate) || '',
          endDate: formatDateForInput(data.endDate) || '',
          current: data.current || false,
          description: data.description || ''
        });
        
        console.log('Form data set with current:', data.current || false);
      } catch (error) {
        console.error('Error loading education:', error);
        toast.error('Failed to load education data');
      } finally {
        setIsLoading(false);
      }
    }

    loadEducation();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // If toggling the "current" checkbox
      if (name === 'current') {
        setFormData((prev) => ({
          ...prev,
          current: checked,
          // Clear end date if checking "current"
          endDate: checked ? '' : prev.endDate
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Handle the current education scenario (no end date)
    const dataToSend = {
      ...formData,
      endDate: formData.current ? null : formData.endDate || null
    };

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/education/${id}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          resolve();
          router.push('/admin/education');
          router.refresh();
        } else {
          const data = await response.json();
          reject(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error updating education entry:', error);
        reject('Failed to update education entry');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Updating education entry...',
      success: 'Education entry updated successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  // Custom checkbox component that visually shows checked state
  const CustomCheckbox = ({ 
    id, 
    checked, 
    onChange, 
    label 
  }: { 
    id: string; 
    checked: boolean; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    label: string 
  }) => {
    // Create a handler for clicking on the visual checkbox
    const handleCheckboxClick = () => {
      // Create a synthetic change event
      const syntheticEvent = {
        target: {
          name: id,
          type: 'checkbox',
          checked: !checked
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      // Call the onChange handler with the synthetic event
      onChange(syntheticEvent);
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className="relative flex items-center">
          <input
            id={id}
            name={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only" // Hide the actual input
          />
          <div 
            onClick={handleCheckboxClick}
            className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
              checked 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-input'
            }`}
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleCheckboxClick();
              }
            }}
          >
            {checked && <FiCheck size={12} className="text-primary-foreground" />}
          </div>
        </div>
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none cursor-pointer"
        >
          {label}
        </label>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading education data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Education</h1>
          <p className="text-muted-foreground">Update your education details</p>
        </div>
        <Link
          href="/admin/education"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="degree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Degree / Certificate
          </label>
          <input
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Bachelor of Science in Computer Science"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="institution" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Institution
          </label>
          <input
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., University of XYZ"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Location (Optional)
          </label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Cambridge, MA"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              End Date {formData.current && '(Not required for current education)'}
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${formData.current ? 'opacity-50' : ''}`}
              disabled={formData.current}
              required={!formData.current}
            />
          </div>
        </div>

        {/* Replace standard checkbox with custom checkbox */}
        <CustomCheckbox
          id="current"
          checked={formData.current}
          onChange={handleChange}
          label="Currently studying here"
        />

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Describe your studies, achievements, and relevant activities."
          />
          <p className="text-xs text-muted-foreground mt-1">
            You can use HTML tags for formatting. For example, &lt;ul&gt; and &lt;li&gt; for bullets, &lt;strong&gt; for bold text.
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