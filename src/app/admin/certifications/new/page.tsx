'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NewCertificationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'pdf'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    year: new Date().getFullYear().toString(),
    url: ''
  });

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

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
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
        } else if (uploadType === 'pdf' && selectedFile) {
          // Upload PDF first
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
        }

        // Upload icon if selected
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
        }

        const response = await fetch('/api/certifications/new', {
          method: 'POST',
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
        console.error('Error creating certification:', error);
        reject('Failed to create certification');
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Creating certification...',
      success: 'Certification created successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Certification</h1>
          <p className="text-muted-foreground">Add a new professional certification or credential</p>
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
                onChange={(e) => setUploadType(e.target.value as 'url' | 'pdf')}
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
                onChange={(e) => setUploadType(e.target.value as 'url' | 'pdf')}
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
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> PDF certificate
                  </p>
                  <p className="text-xs text-muted-foreground">PDF files only (MAX. 10MB)</p>
                </div>
                <input
                  id="pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required={uploadType === 'pdf'}
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
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiImage className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> icon
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
                {selectedIconFile.name} ({(selectedIconFile.size / 1024).toFixed(0)} KB)
              </p>
            </div>
          )}
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
              Save Certification
            </>
          )}
        </button>
      </form>
    </div>
  );
} 