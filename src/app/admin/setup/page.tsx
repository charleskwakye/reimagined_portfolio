'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/lib/actions/admin';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    intro: '',
    about: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createUserProfile(formData);
      
      if (result.success) {
        router.push('/admin');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create Your Profile</h1>
      
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-card p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium mb-1">
                Job Title
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Full Stack Developer"
              />
            </div>
            
            <div>
              <label htmlFor="intro" className="block text-sm font-medium mb-1">
                Short Introduction
              </label>
              <textarea
                id="intro"
                name="intro"
                required
                value={formData.intro}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="A brief introduction that will appear on your home page"
              />
            </div>
            
            <div>
              <label htmlFor="about" className="block text-sm font-medium mb-1">
                About Me
              </label>
              <textarea
                id="about"
                name="about"
                required
                value={formData.about}
                onChange={handleChange}
                rows={6}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="A longer description about yourself, your background, and your approach to work"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            This is just the initial setup. After creating your profile, you'll be able to add:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Profile picture</li>
            <li>Social media links</li>
            <li>Skills and expertise</li>
            <li>Work experience</li>
            <li>Education history</li>
            <li>Portfolio projects</li>
            <li>And more...</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 