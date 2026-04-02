'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface DeleteButtonProps {
  endpoint: string;
  itemName?: string;
  onSuccess?: () => void;
}

export default function DeleteButton({ 
  endpoint, 
  itemName = 'item',
  onSuccess
}: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!confirm(`Are you sure you want to delete this ${itemName}?`)) {
      return;
    }

    setIsDeleting(true);

    const deletePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(endpoint, {
          method: 'DELETE',
        });

        if (response.ok) {
          resolve();
          if (onSuccess) {
            onSuccess();
          } else {
            // Refresh the current page
            router.refresh();
          }
        } else {
          let errorMessage = 'Something went wrong';
          try {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
          } catch {
            // Response might not have a JSON body (e.g., 204 No Content with error)
            errorMessage = `Request failed with status ${response.status}`;
          }
          reject(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        reject('Failed to delete item');
      } finally {
        setIsDeleting(false);
      }
    });

    toast.promise(deletePromise, {
      loading: `Deleting ${itemName}...`,
      success: `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} deleted successfully!`,
      error: (err) => `Error: ${err}`
    });
  };

  return (
    <button
      type="button"
      className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <FiTrash2 className="mr-1 h-3.5 w-3.5" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
} 