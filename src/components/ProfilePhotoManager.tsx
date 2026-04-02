import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiUpload, FiTrash2, FiPlus, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Define type for a profile photo
interface ProfilePhoto {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
  isSelected?: boolean;
}

interface ProfilePhotoManagerProps {
  maxPhotos?: number;
  currentProfileImage?: string;
  onPhotoSelect: (imageUrl: string) => void;
}

export default function ProfilePhotoManager({
  maxPhotos = 5,
  currentProfileImage = '',
  onPhotoSelect
}: ProfilePhotoManagerProps) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectInProgress, setSelectInProgress] = useState<string | null>(null);
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);

  // Verify that a photo URL still exists on the server
  const verifyPhotoExists = async (url: string): Promise<boolean> => {
    try {
      // Skip verification for blob URLs or relative URLs
      if (url.startsWith('blob:') || url.startsWith('/')) {
        return true;
      }
      
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error(`Failed to verify photo URL: ${url}`, error);
      return false;
    }
  };

  // Synchronize localStorage photos with server
  const syncPhotosWithServer = async (photosToSync: ProfilePhoto[]) => {
    setIsSyncingPhotos(true);
    
    try {
      const validatedPhotos = [];
      
      for (const photo of photosToSync) {
        const exists = await verifyPhotoExists(photo.url);
        if (exists) {
          validatedPhotos.push(photo);
        } else {
          console.warn(`Photo no longer exists on server, removing from localStorage: ${photo.url}`);
        }
      }
      
      // Update state with only valid photos
      setPhotos(validatedPhotos);
      
      // Update localStorage
      if (validatedPhotos.length > 0) {
        localStorage.setItem('profilePhotos', JSON.stringify(validatedPhotos));
      } else {
        localStorage.removeItem('profilePhotos');
      }
      
      return validatedPhotos;
    } catch (error) {
      console.error('Error syncing photos with server:', error);
      return photosToSync; // Return original list on error
    } finally {
      setIsSyncingPhotos(false);
    }
  };

  // Load existing profile photos on mount
  useEffect(() => {
    // On real implementation, this would fetch the photos from localStorage or an API
    const savedPhotos = localStorage.getItem('profilePhotos');
    if (savedPhotos) {
      try {
        let parsedPhotos = JSON.parse(savedPhotos);
        
        // Filter out any photos that might have been deleted from the server but still exist in localStorage
        // If currentProfileImage is set but not found in the photos, those photos might be stale
        if (currentProfileImage && parsedPhotos.length > 0) {
          const photoExists = parsedPhotos.some((photo: ProfilePhoto) => photo.url === currentProfileImage);
          
          if (!photoExists && currentProfileImage !== '') {
            // The current profile image doesn't exist in our saved photos
            // This could mean our localStorage is out of sync with the server
            console.warn('Current profile image not found in saved photos, localStorage might be out of sync');
          }
          
          // Mark the currently selected photo
          parsedPhotos = parsedPhotos.map((photo: ProfilePhoto) => ({
            ...photo,
            isSelected: photo.url === currentProfileImage
          }));
        }
        
        // Set photos initially from localStorage
        setPhotos(parsedPhotos);
        
        // Then verify all photos still exist on the server
        syncPhotosWithServer(parsedPhotos);
      } catch (error) {
        console.error('Error parsing saved profile photos:', error);
      }
    }
  }, [currentProfileImage]);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    // Only update localStorage if we're not in the middle of syncing
    // This prevents unnecessary writes during the sync process
    if (!isSyncingPhotos) {
      if (photos.length > 0) {
        localStorage.setItem('profilePhotos', JSON.stringify(photos));
      } else if (photos.length === 0 && localStorage.getItem('profilePhotos')) {
        // Clean up localStorage if we removed all photos
        localStorage.removeItem('profilePhotos');
      }
    }
  }, [photos, isSyncingPhotos]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous error messages
    setErrorMessage(null);

    // Check if we reached the max number of photos
    if (photos.length >= maxPhotos) {
      toast.error(`Maximum ${maxPhotos} profile photos allowed. Please delete some first.`);
      return;
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed for profile photos.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should not exceed 5MB.');
      return;
    }

    uploadProfilePhoto(file);
  };

  const uploadProfilePhoto = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);

    try {
      // Format filename to include a profile photo prefix
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `profile_photo_${Date.now()}_${safeName}`;
      
      // Upload to the special profile photos endpoint
      const uploadUrl = `/api/upload?filename=${encodeURIComponent(filename)}&isProfilePhoto=true`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to upload profile photo';
        
        // Check for Vercel Blob token errors
        if (errorMessage.includes('Access denied') || errorMessage.includes('token')) {
          setErrorMessage('Vercel Blob configuration error. Please check your environment variables and Vercel Blob setup.');
          throw new Error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Add the new photo to the list
      const newPhoto: ProfilePhoto = {
        id: data.id || Date.now().toString(),
        url: data.url,
        filename: data.filename || filename,
        uploadedAt: data.uploadedAt || new Date().toISOString(),
        isSelected: false
      };
      
      setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      setUploadProgress(100);
      toast.success('Profile photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      
      // Use the stored error message or the error from the catch block
      const displayError = errorMessage || 
        (error instanceof Error ? error.message : 'Failed to upload profile photo');
      
      toast.error(displayError);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.getElementById('profile-photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handlePhotoSelect = async (photo: ProfilePhoto) => {
    // If already selected, do nothing
    if (photo.isSelected) return;
    
    try {
      // Set selection in progress for this photo
      setSelectInProgress(photo.id);
      
      // Update selection state in UI immediately for better UX
      setPhotos(prevPhotos => 
        prevPhotos.map(p => ({
          ...p,
          isSelected: p.id === photo.id
        }))
      );
      
      // Notify parent component (which will save to database)
      await onPhotoSelect(photo.url);
      
    } catch (error) {
      console.error('Error selecting profile photo:', error);
      
      // Revert selection if there was an error
      setPhotos(prevPhotos => 
        prevPhotos.map(p => ({
          ...p,
          isSelected: p.url === currentProfileImage
        }))
      );
      
      toast.error('Failed to select profile photo');
    } finally {
      setSelectInProgress(null);
    }
  };

  const handlePhotoDelete = async (photoToDelete: ProfilePhoto) => {
    try {
      setDeleteInProgress(photoToDelete.id);
      
      // Delete from server
      const response = await fetch('/api/file/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: photoToDelete.url }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete profile photo');
      }
      
      // If the deleted photo was selected, clear the selection
      const wasSelected = photoToDelete.isSelected;
      if (wasSelected) {
        // Notify parent component to clear the profile image
        await onPhotoSelect('');
      }
      
      // Remove from local state
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoToDelete.id));
      
      // Update localStorage to remove the deleted photo
      const savedPhotos = localStorage.getItem('profilePhotos');
      if (savedPhotos) {
        try {
          const parsedPhotos = JSON.parse(savedPhotos);
          const updatedPhotos = parsedPhotos.filter((photo: ProfilePhoto) => photo.id !== photoToDelete.id);
          
          if (updatedPhotos.length > 0) {
            localStorage.setItem('profilePhotos', JSON.stringify(updatedPhotos));
          } else {
            localStorage.removeItem('profilePhotos');
          }
        } catch (error) {
          console.error('Error updating localStorage after photo deletion:', error);
        }
      }
      
      toast.success('Profile photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      toast.error('Failed to delete profile photo');
    } finally {
      setDeleteInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Profile Photos ({photos.length}/{maxPhotos})</h3>
        
        <label 
          htmlFor="profile-photo-upload"
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium shadow-sm
            ${photos.length >= maxPhotos ? 
              'bg-gray-300 text-gray-500 cursor-not-allowed' : 
              'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'}`}
        >
          <FiPlus className="mr-2" />
          Add Photo
          <input 
            id="profile-photo-upload" 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading || photos.length >= maxPhotos}
          />
        </label>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md">
          <h4 className="font-medium">Configuration Error</h4>
          <p className="text-sm mt-1">{errorMessage}</p>
          <p className="text-sm mt-2">
            Please check your Vercel Blob configuration and make sure BLOB_READ_WRITE_TOKEN is set correctly.
          </p>
        </div>
      )}
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiLoader className="animate-spin" />
            <span>Uploading profile photo... {Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }} 
            />
          </div>
        </div>
      )}
      
      {/* Syncing indicator */}
      {isSyncingPhotos && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FiLoader className="animate-spin" />
          <span>Verifying photos...</span>
        </div>
      )}
      
      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id}
            className={`relative group border rounded-lg overflow-hidden aspect-square ${
              photo.isSelected ? 'ring-2 ring-primary' : ''
            }`}
          >
            <Image
              src={photo.url}
              alt={`Profile photo ${photo.id}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            
            {/* Selected indicator */}
            {photo.isSelected && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <FiCheck size={16} />
              </div>
            )}
            
            {/* Delete in progress */}
            {deleteInProgress === photo.id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <FiLoader className="text-white animate-spin" size={24} />
              </div>
            )}
            
            {/* Select in progress */}
            {selectInProgress === photo.id && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <FiLoader className="text-white animate-spin" size={24} />
              </div>
            )}
            
            {/* Actions */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                {!photo.isSelected && (
                  <button 
                    onClick={() => handlePhotoSelect(photo)}
                    className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90"
                    title="Select as profile photo"
                    disabled={deleteInProgress === photo.id || selectInProgress !== null}
                  >
                    <FiCheck />
                  </button>
                )}
                <button 
                  onClick={() => handlePhotoDelete(photo)}
                  className="p-2 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90"
                  title="Delete photo"
                  disabled={deleteInProgress === photo.id || selectInProgress !== null}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty state placeholders */}
        {photos.length === 0 && (
          <div className="col-span-2 sm:col-span-3 md:col-span-5 text-center py-10 border rounded-lg bg-muted/20">
            <FiUpload className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No profile photos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload up to {maxPhotos} profile photos to choose from
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-muted/30 p-4 rounded text-sm">
        <h4 className="font-medium">Tip:</h4>
        <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
          <li>Upload up to {maxPhotos} profile photos</li>
          <li>Click a photo and select the checkmark icon to use it as your profile picture</li>
          <li>Use the trash icon to delete unwanted photos</li>
          <li>Only one photo can be selected as your profile picture at a time</li>
          <li>Your selection is saved automatically</li>
        </ul>
      </div>
    </div>
  );
} 