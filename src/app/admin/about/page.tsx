'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit, FiArrowUp, FiArrowDown, FiMessageSquare } from 'react-icons/fi';
import { AboutSection, ApproachItem, Specialty } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';
import toast from 'react-hot-toast';



export default function AdminAboutPage() {
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [approachItems, setApproachItems] = useState<ApproachItem[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [aboutResponse, approachResponse, specialtiesResponse] = await Promise.all([
          fetch('/api/about'),
          fetch('/api/approach'),
          fetch('/api/specialties')
        ]);

        if (aboutResponse.ok) {
          const aboutData = await aboutResponse.json();
          setAboutSections(aboutData?.aboutSections || []);
        }

        if (approachResponse.ok) {
          const approachData = await approachResponse.json();
          setApproachItems(approachData?.approachItems || []);
        }

        if (specialtiesResponse.ok) {
          const specialtiesData = await specialtiesResponse.json();
          setSpecialties(specialtiesData?.specialties || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Sort data
  const sortedAboutSections = aboutSections?.sort((a: AboutSection, b: AboutSection) => a.order - b.order) || [];
  const sortedApproachItems = approachItems?.sort((a: ApproachItem, b: ApproachItem) => a.order - b.order) || [];

  // Function to move specialty up or down
  const moveSpecialty = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = specialties.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < specialties.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return; // Can't move further up or down
    }
    
    // Create a new array with swapped positions
    const updatedSpecialties = [...specialties];
    const temp = updatedSpecialties[currentIndex];
    updatedSpecialties[currentIndex] = updatedSpecialties[newIndex];
    updatedSpecialties[newIndex] = temp;
    
    // Update the local state immediately
    setSpecialties(updatedSpecialties);
    
    setUpdatingOrder(true);
    try {
      // Save the new order to the server
      const orderedIds = updatedSpecialties.map(item => item.id);
      const response = await fetch('/api/specialties/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: orderedIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save order');
      }
      
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Error saving specialty order:', error);
      toast.error('Failed to save order');
      // Revert the change on error by fetching fresh data
      window.location.reload();
    } finally {
      setUpdatingOrder(false);
    }
  };

  return (
    <div>
      {/* Specialties Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Specialties</h1>
          <p className="text-muted-foreground">Manage your professional specialties shown in your About page</p>
        </div>
        <Link
          href="/admin/about/specialties/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Specialty
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center mb-12">Loading specialties...</div>
      ) : specialties && specialties.length > 0 ? (
        <div className="rounded-md border mb-12">
          <div className="p-4 border-b bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Use the up/down arrows to reorder how they appear on your About page. Changes are saved automatically.
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-sm">
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialties.map((specialty: Specialty, index: number) => {
                return (
                  <tr key={specialty.id} className="border-b">
                    <td className="px-4 py-3">
                      <span className="text-xl"><FiMessageSquare /></span>
                    </td>
                    <td className="px-4 py-3 font-medium">{specialty.name}</td>
                    <td className="px-4 py-3">
                      {specialty.color ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: specialty.color }}
                          ></div>
                          <span className="text-sm text-muted-foreground">{specialty.color}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No color</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <div className="flex items-center justify-end gap-1">
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
                        <Link
                          href={`/admin/about/specialties/${specialty.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <FiEdit className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteButton 
                          endpoint={`/api/specialties/${specialty.id}/delete`} 
                          itemName="specialty"
                          onDeleteSuccess={() => {
                            setSpecialties(prev => prev.filter(s => s.id !== specialty.id));
                            toast.success('Specialty deleted successfully');
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center mb-12">
          <h3 className="text-lg font-medium mb-2">No Specialties Found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't added any specialties yet. Add specialties to showcase your professional focus areas.
          </p>
          <Link
            href="/admin/about/specialties/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Specialty
          </Link>
        </div>
      )}

      {/* About Sections */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Sections</h1>
          <p className="text-muted-foreground">Manage the content sections on your About page</p>
        </div>
        <Link
          href="/admin/about/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Section
        </Link>
      </div>

      {sortedAboutSections.length > 0 ? (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Content Preview</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {sortedAboutSections.map((section) => (
                  <tr key={section.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">{section.order}</td>
                    <td className="p-4 align-middle font-medium">{section.title}</td>
                    <td className="p-4 align-middle">
                      <div className="line-clamp-2 max-w-md text-muted-foreground">
                        {section.content.replace(/<[^>]*>/g, '')}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/about/${section.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <FiEdit className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteButton 
                          endpoint={`/api/about/${section.id}/delete`} 
                          itemName="section" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No About Sections Found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't created any about sections yet. Add sections to display on your About page.
          </p>
          <Link
            href="/admin/about/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Section
          </Link>
        </div>
      )}

      {/* Approach Items */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Approach</h1>
            <p className="text-muted-foreground">Manage your approach to work and problem-solving</p>
          </div>
          <Link 
            href="/admin/about/approach/new" 
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Approach Item
          </Link>
        </div>

        {sortedApproachItems.length > 0 ? (
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {sortedApproachItems.map((item) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">{item.order}</td>
                      <td className="p-4 align-middle font-medium">{item.title}</td>
                      <td className="p-4 align-middle">
                        <div className="line-clamp-2 max-w-md text-muted-foreground">
                          {item.description.length > 100
                            ? `${item.description.substring(0, 100)}...`
                            : item.description}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/about/approach/${item.id}/edit`}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <FiEdit className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <DeleteButton 
                            endpoint={`/api/approach/${item.id}/delete`}
                            itemName="approach item"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Approach Items Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any approach items yet. Add items to showcase your work philosophy and methodology.
            </p>
            <Link
              href="/admin/about/approach/new"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add Your First Approach Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 