'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiTrash } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ContactInfo {
  email: string;
  location: string;
  connectText: string;
}

export default function CVAdminPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'example@example.com',
    location: 'New York, NY',
    connectText: 'Interested in working together? Feel free to reach out to discuss potential opportunities.'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user data for CV URL
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        
        if (userData.user && userData.user.resumeUrl) {
          setResumeUrl(userData.user.resumeUrl);
        }
        
        // Fetch contact info
        const contactResponse = await fetch('/api/cv/contact');
        const contactData = await contactResponse.json();
        
        if (contactData.contact) {
          setContactInfo(contactData.contact);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResumeUrl(data.url);
        setFile(null);
        toast.success('CV uploaded successfully!');
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to upload CV');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload CV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!resumeUrl) return;
    
    if (!confirm('Are you sure you want to delete the current CV?')) {
      return;
    }

    try {
      const response = await fetch('/api/cv/delete', {
        method: 'POST',
      });

      if (response.ok) {
        setResumeUrl(null);
        toast.success('CV deleted successfully!');
        router.refresh();
      } else {
        throw new Error('Failed to delete CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Failed to delete CV');
    }
  };

  const handleContactInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/cv/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfo),
      });

      if (response.ok) {
        toast.success('Contact information updated!');
      } else {
        throw new Error('Failed to update contact information');
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    }
  };

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">CV Management</h1>
          <p className="text-muted-foreground">
            Upload and manage your CV, and update contact information displayed on the CV page.
          </p>
        </div>
        
        {/* CV Upload Section */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">CV Upload</h2>
          
          {resumeUrl && (
            <div className="mb-6">
              <p className="font-medium mb-2">Current CV</p>
              <div className="flex items-center gap-2">
                <a 
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {resumeUrl}
                </a>
                <button
                  onClick={handleDelete}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  title="Delete CV"
                >
                  <FiTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label htmlFor="cv-file" className="block text-sm font-medium mb-1">
                Upload New CV (PDF)
              </label>
              <div className="flex gap-3">
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
                />
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <FiUpload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a PDF file of your CV. This will replace any existing CV.
              </p>
            </div>
          </form>
        </div>
        
        {/* Contact Information Section */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <form onSubmit={handleContactInfoUpdate} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={contactInfo.location}
                onChange={(e) => setContactInfo({...contactInfo, location: e.target.value})}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            
            <div>
              <label htmlFor="connect-text" className="block text-sm font-medium mb-1">
                "Let's Connect" Text
              </label>
              <textarea
                id="connect-text"
                rows={4}
                value={contactInfo.connectText}
                onChange={(e) => setContactInfo({...contactInfo, connectText: e.target.value})}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Update Contact Info
              </button>
            </div>
          </form>
        </div>
        
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">CV Preview</h2>
          <p className="mb-4 text-muted-foreground">
            Preview how your CV will look on the CV page.
          </p>
          
          <div className="h-[400px] w-full rounded-md border border-border overflow-hidden">
            {resumeUrl ? (
              <iframe
                src={resumeUrl}
                className="w-full h-full"
                title="CV Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/30">
                <p className="text-muted-foreground">No CV uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 