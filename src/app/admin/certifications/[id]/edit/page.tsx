'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiUpload, FiExternalLink, FiFile, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface EditCertificationPageProps {
  params: {
    id: string;
  };
}

export default function EditCertificationPage({ params }: EditCertificationPageProps) {
  const router = useRouter();
  const { id } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'pdf'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentIconUrl, setCurrentIconUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    year: '',
    url: '',
    pdfUrl: ''
  });

  useEffect(() => {
    async function loadCertification() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/certifications/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch certification');
        }

        const data = await response.json();

        // Determine if this certification uses PDF or URL
        const hasPdf = data.pdfUrl && data.pdfUrl.trim() !== '';
        const hasUrl = data.url && data.url.trim() !== '';

        setUploadType(hasPdf ? 'pdf' : 'url');
        setCurrentPdfUrl(data.pdfUrl);
        setCurrentIconUrl(data.iconUrl);

        setFormData({
          title: data.title,
          organization: data.organization,
          year: data.year,
          url: data.url || '',
          pdfUrl: data.pdfUrl || ''
        });
      } catch (error) {
        console.error('Error loading certification:', error);
        toast.error('Failed to load certification data');
      } finally {
        setIsLoading(false);
      }
    }

    loadCertification();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleUploadTypeChange = (newType: 'url' | 'pdf') => {
    setUploadType(newType);
    setSelectedFile(null);
    // Clear the opposite field when switching
    if (newType === 'url') {
      setFormData(prev => ({ ...prev, pdfUrl: '' }));
    } else {
      setFormData(prev => ({ ...prev, url: '' }));
    }
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select an image file (SVG, PNG, JPG, JPEG, GIF, WEBP)');
        e.target.value = '';
        return;
      }
      setSelectedIconFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        let submitData: any = {
          title: formData.title,
          organization: formData.organization,
          year: formData.year,
        };

        if (uploadType === 'url') {
          submitData.url = formData.url;
          submitData.pdfUrl = null; // Clear PDF when using URL
        } else if (uploadType === 'pdf') {
          if (selectedFile) {
            // Upload new PDF
            const formDataObj = new FormData();
            formDataObj.append('file', selectedFile);

            const uploadResponse = await fetch('/api/upload/certification-pdf', {
              method: 'POST',
              body: formDataObj,
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload PDF');
            }

            const uploadResult = await uploadResponse.json();
            submitData.pdfUrl = uploadResult.url;
          } else {
            // Keep existing PDF
            submitData.pdfUrl = formData.pdfUrl;
          }
          submitData.url = null; // Clear URL when using PDF
        }

        // Upload new icon if selected
        if (selectedIconFile) {
          const iconFormData = new FormData();
          iconFormData.append('file', selectedIconFile);

          const iconUploadResponse = await fetch('/api/upload/certification-icon', {
            method: 'POST',
            body: iconFormData,
          });

          if (!iconUploadResponse.ok) {
            throw new Error('Failed to upload icon');
          }

          const iconUploadResult = await iconUploadResponse.json();
          submitData.iconUrl = iconUploadResult.url;
        } else {
          // Keep existing icon
          submitData.iconUrl = currentIconUrl;
        }

        const response = await fetch(`/api/certifications/${id}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (response.ok) {
          resolve();
          router.push('/admin/certifications');
          router.refresh();
        } else {
          const data = await response.json();
          reject(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error updating certification:', error);
        reject('Failed to update certification');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Updating certification...',
      success: 'Certification updated successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Loading certification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Certification</h1>
          <p className="text-muted-foreground">Update certification details</p>
        </div>
        <Link
          href="/admin/certifications"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Certification Title
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., AWS Certified Developer - Associate"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="organization" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Issuing Organization
          </label>
          <input
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Amazon Web Services"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="year" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Year Earned
          </label>
          <input
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., 2023"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium leading-none">
            Certificate Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="uploadType"
                value="url"
                checked={uploadType === 'url'}
                onChange={(e) => handleUploadTypeChange(e.target.value as 'url' | 'pdf')}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">Web Link</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="uploadType"
                value="pdf"
                checked={uploadType === 'pdf'}
                onChange={(e) => handleUploadTypeChange(e.target.value as 'url' | 'pdf')}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">PDF Upload</span>
            </label>
          </div>
        </div>

        {uploadType === 'url' ? (
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Certification URL
            </label>
            <input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g., https://www.credly.com/badges/..."
              required={uploadType === 'url'}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link to your digital badge or verification page
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="pdf" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Certificate PDF
            </label>

            {/* Show current PDF if exists */}
            {currentPdfUrl && !selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
                <FiFile className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Current PDF Certificate</p>
                  <p className="text-xs text-muted-foreground">Click "Choose new file" to replace</p>
                </div>
                <a
                  href={currentPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  <FiExternalLink className="h-4 w-4" />
                  View
                </a>
              </div>
            )}

            {/* File upload area */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">
                      {currentPdfUrl ? 'Choose new file' : 'Click to upload'}
                    </span> PDF certificate
                  </p>
                  <p className="text-xs text-muted-foreground">PDF files only (MAX. 10MB)</p>
                </div>
                <input
                  id="pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            Certification Icon (Optional)
          </label>
          
          {/* Show current icon if exists */}
          {currentIconUrl && !selectedIconFile && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src={currentIconUrl} 
                  alt="Current icon"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Current Icon</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentIconUrl(null)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          )}

          {/* File upload area */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiImage className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">
                    {currentIconUrl ? 'Choose new icon' : 'Click to upload'}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">SVG, PNG, JPG (MAX. 2MB)</p>
              </div>
              <input
                id="icon"
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.gif,.webp,image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleIconFileChange}
                className="hidden"
              />
            </label>
          </div>
          
          {selectedIconFile && (
            <div className="flex items-center gap-3 mt-2 p-2 bg-muted/30 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src={URL.createObjectURL(selectedIconFile)} 
                  alt="Preview"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <p className="text-sm text-green-600">
                New: {selectedIconFile.name} ({(selectedIconFile.size / 1024).toFixed(0)} KB)
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
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

          <Link
            href="/admin/certifications"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 