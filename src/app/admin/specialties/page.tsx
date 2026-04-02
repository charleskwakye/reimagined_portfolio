'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit, FiArrowUp, FiArrowDown, FiMessageSquare } from 'react-icons/fi';
import { Specialty } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';
import toast from 'react-hot-toast';



export default function AdminSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  useEffect(() => {
    async function fetchSpecialties() {
      try {
        const response = await fetch('/api/specialties');
        if (response.ok) {
          const data = await response.json();
          setSpecialties(data.specialties || []);
        }
      } catch (error) {
        console.error('Error fetching specialties:', error);
        toast.error('Failed to load specialties');
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialties();
  }, []);

  const handleDeleteSuccess = (specialtyId: string) => {
    setSpecialties(prev => prev.filter(specialty => specialty.id !== specialtyId));
    toast.success('Specialty deleted successfully');
  };

  const moveSpecialty = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = specialties.findIndex(specialty => specialty.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === specialties.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedSpecialties = [...specialties];
    
    // Swap the items
    [updatedSpecialties[currentIndex], updatedSpecialties[newIndex]] = 
    [updatedSpecialties[newIndex], updatedSpecialties[currentIndex]];
    
    // Update local state immediately for better UX
    setSpecialties(updatedSpecialties);

    // Save the new order to the server
    setUpdatingOrder(true);
    
    try {
      const orderedItems = updatedSpecialties.map((specialty, index) => ({
        id: specialty.id,
        order: index
      }));
      
      const response = await fetch('/api/specialties/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: orderedItems }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      toast.success('Specialty order updated!');
    } catch (error) {
      toast.error('Failed to update specialty order');
      console.error('Error updating specialty order:', error);
      
      // Revert to original order if there was an error
      setSpecialties(specialties);
    } finally {
      setUpdatingOrder(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading specialties...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Specialties</h1>
          <p className="text-muted-foreground">Manage your professional specialties and their display order</p>
        </div>
        <Link
          href="/admin/specialties/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Specialty
        </Link>
      </div>

      {specialties && specialties.length > 0 ? (
        <div className="space-y-4">
          {specialties.map((specialty: Specialty, index) => {
            return (
              <div key={specialty.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" style={{ color: specialty.color }}>
                        <FiMessageSquare />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold">{specialty.name}</h3>
                        {specialty.color && (
                          <p className="text-sm text-muted-foreground">Color: {specialty.color}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Order Controls */}
                    <button
                      onClick={() => moveSpecialty(specialty.id, 'up')}
                      disabled={index === 0 || updatingOrder}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm shadow-sm hover:bg-accent disabled:opacity-50"
                      title="Move up"
                    >
                      <FiArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveSpecialty(specialty.id, 'down')}
                      disabled={index === specialties.length - 1 || updatingOrder}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm shadow-sm hover:bg-accent disabled:opacity-50"
                      title="Move down"
                    >
                      <FiArrowDown className="h-4 w-4" />
                    </button>
                    
                    {/* Edit and Delete */}
                    <Link
                      href={`/admin/specialties/${specialty.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm shadow-sm hover:bg-accent"
                    >
                      <span className="sr-only">Edit</span>
                      <FiEdit className="h-4 w-4" />
                    </Link>
                    <DeleteButton
                      id={specialty.id}
                      endpoint={`/api/specialties/${specialty.id}/delete`}
                      onSuccess={() => handleDeleteSuccess(specialty.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No specialties found</h3>
          <p className="text-muted-foreground mt-1">
            Get started by adding your first specialty.
          </p>
        </div>
      )}
    </div>
  );
} 