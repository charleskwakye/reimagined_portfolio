'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Helper function to format date for input
function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export default function NewExperiencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false
  });
  
  // State for bullet points
  const [bulletPoints, setBulletPoints] = useState<string[]>(['']);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleBulletPointChange = (index: number, value: string) => {
    const newBulletPoints = [...bulletPoints];
    newBulletPoints[index] = value;
    setBulletPoints(newBulletPoints);
  };

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, '']);
  };

  const removeBulletPoint = (index: number) => {
    // Don't remove the last bullet point
    if (bulletPoints.length === 1) {
      setBulletPoints(['']);
      return;
    }
    
    const newBulletPoints = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(newBulletPoints);
  };

  const moveBulletPointUp = (index: number) => {
    if (index === 0) return; // Already at the top
    const newBulletPoints = [...bulletPoints];
    [newBulletPoints[index - 1], newBulletPoints[index]] = [newBulletPoints[index], newBulletPoints[index - 1]];
    setBulletPoints(newBulletPoints);
  };

  const moveBulletPointDown = (index: number) => {
    if (index === bulletPoints.length - 1) return; // Already at the bottom
    const newBulletPoints = [...bulletPoints];
    [newBulletPoints[index], newBulletPoints[index + 1]] = [newBulletPoints[index + 1], newBulletPoints[index]];
    setBulletPoints(newBulletPoints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter out empty bullet points
    const filteredBulletPoints = bulletPoints.filter(bp => bp.trim() !== '');
    
    if (filteredBulletPoints.length === 0) {
      toast.error('Please add at least one bullet point about your experience');
      setIsSubmitting(false);
      return;
    }

    // Handle the current job scenario (no end date)
    const dataToSend = {
      ...formData,
      endDate: formData.current ? undefined : formData.endDate || undefined,
      description: JSON.stringify(filteredBulletPoints) // Store as JSON array
    };

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/experience/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          resolve();
          router.push('/admin/experience');
          router.refresh();
        } else {
          const data = await response.json();
          reject(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error creating experience:', error);
        reject('Failed to create experience');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Creating experience entry...',
      success: 'Experience created successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Experience</h1>
          <p className="text-muted-foreground">Add new work experience to your profile</p>
        </div>
        <Link
          href="/admin/experience"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Job Title
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Senior Frontend Developer"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Company
          </label>
          <input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Acme Inc."
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
            placeholder="e.g., New York, NY or Remote"
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
              End Date {formData.current && '(Not required for current job)'}
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={formData.current}
              required={!formData.current}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="current"
            name="current"
            type="checkbox"
            checked={formData.current}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="current" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            This is my current job
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Responsibilities & Achievements
            </label>
            <button
              type="button"
              onClick={addBulletPoint}
              className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/20"
            >
              <FiPlus className="mr-1 h-3 w-3" />
              Add Bullet Point
            </button>
          </div>
          
          <div className="space-y-3">
            {bulletPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <textarea
                  value={point}
                  onChange={(e) => handleBulletPointChange(index, e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-[60px]"
                  placeholder="Describe an achievement or responsibility..."
                  rows={2}
                />
                
                <div className="flex flex-col gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveBulletPointUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded-md hover:bg-accent disabled:opacity-30"
                    title="Move up"
                  >
                    <FiArrowUp className="h-4 w-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => moveBulletPointDown(index)}
                    disabled={index === bulletPoints.length - 1}
                    className="p-1 rounded-md hover:bg-accent disabled:opacity-30"
                    title="Move down"
                  >
                    <FiArrowDown className="h-4 w-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeBulletPoint(index)}
                    className="p-1 rounded-md hover:bg-destructive hover:text-destructive-foreground"
                    title="Remove"
                  >
                    <FiTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            Each bullet point should highlight one achievement or responsibility. Arrange them in order of importance.
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
              Save Experience
            </>
          )}
        </button>
      </form>
    </div>
  );
} 