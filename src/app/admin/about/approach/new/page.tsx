'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NewApproachItem() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? (value === '' ? 1 : parseInt(value) || 1) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Use the value as is - backend will handle ordering
    const dataToSend = {
      ...formData,
      order: formData.order === '' ? 1 : parseInt(formData.order as string)
    };

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/approach/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          resolve();
          router.push('/admin/about');
          router.refresh();
        } else {
          const data = await response.json();
          reject(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error creating approach item:', error);
        reject('Failed to create approach item');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Creating approach item...',
      success: 'Approach item created successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Approach Item</h1>
          <p className="text-muted-foreground">Create a new item for your Approach section</p>
        </div>
        <Link
          href="/admin/about"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Item Title
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., User-Centered Design, Agile Development, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="order" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Display Order (Optional)
          </label>
          <input
            id="order"
            name="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={handleChange}
            className="flex h-10 w-full max-w-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-sm text-muted-foreground">
            Lower numbers appear first. Items with the same order will be shifted automatically.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Describe this aspect of your approach..."
            required
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
              Save Item
            </>
          )}
        </button>
      </form>
    </div>
  );
} 