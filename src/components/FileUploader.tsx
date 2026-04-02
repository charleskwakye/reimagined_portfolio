'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiImage, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  label?: string;
  buttonText?: string;
  className?: string;
}

export default function FileUploader({
  onFileUploaded,
  acceptedFileTypes = 'image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint',
  maxSizeMB = 10,
  label = 'Upload a file',
  buttonText = 'Select File',
  className = '',
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FiImage className="w-5 h-5" />;
    }
    return <FiFile className="w-5 h-5" />;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Create a simulated progress effect
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);

    try {
      // Create form data to upload
      const uploadUrl = `/api/upload?filename=${encodeURIComponent(file.name)}`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      // Notify parent component about the successful upload
      onFileUploaded(data.url, file.name, file.type);
      
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div className="flex flex-col items-center justify-center w-full">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 w-full text-center cursor-pointer hover:bg-accent/10 transition-colors
            ${isUploading ? 'border-primary' : 'border-border'}`}
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <FiLoader className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
            </div>
          ) : (
            <>
              <FiUpload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop a file here, or click to select
              </p>
              <button 
                type="button" 
                className="mt-2 py-1 px-3 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {buttonText}
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Max file size: {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
} 