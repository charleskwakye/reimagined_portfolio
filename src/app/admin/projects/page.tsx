'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiGithub, FiYoutube, FiStar, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllProjects } from '@/lib/actions/user';
import { Project } from '@/lib/types';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch projects on page load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects();
        // Sort projects by featured first, then by createdAt
        const sortedData = sortProjects(data);
        setProjects(sortedData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Sort projects function
  const sortProjects = (projectsToSort: Project[]) => {
    return [...projectsToSort].sort((a, b) => {
      // First sort by order field
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      
      // Then sort by featured status
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Finally sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Move project up in the list
  const moveProjectUp = async (index: number) => {
    if (index <= 0) return;
    const newProjects = [...projects];
    [newProjects[index], newProjects[index - 1]] = [newProjects[index - 1], newProjects[index]];
    
    // Ensure order property is updated to match new positions
    newProjects.forEach((project, idx) => {
      project.order = idx;
    });
    
    setProjects(newProjects);
    await updateProjectOrder(newProjects);
  };

  // Move project down in the list
  const moveProjectDown = async (index: number) => {
    if (index >= projects.length - 1) return;
    const newProjects = [...projects];
    [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
    
    // Ensure order property is updated to match new positions
    newProjects.forEach((project, idx) => {
      project.order = idx;
    });
    
    setProjects(newProjects);
    await updateProjectOrder(newProjects);
  };

  // Update project order in the database
  const updateProjectOrder = async (orderedProjects: Project[]) => {
    try {
      // Create payload with project IDs and their order values
      const projectOrders = orderedProjects.map((p, index) => ({
        id: p.id,
        order: index
      }));
      
      const response = await fetch('/api/projects/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projects: projectOrders }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project order');
      }

      toast.success('Project order updated');
    } catch (error) {
      console.error('Error updating project order:', error);
      toast.error('Failed to update project order');
    }
  };

  // Handle project deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);

    try {
      const response = await fetch(`/api/project/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(null);
    }
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary/50 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <FiPlus className="mr-2" />
          Add Project
        </Link>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((project, index) => (
                <tr key={project.id} className="bg-card hover:bg-accent/10 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {project.coverImage ? (
                        <div className="h-10 w-16 overflow-hidden rounded border">
                          <img 
                            src={project.coverImage} 
                            alt={project.title}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                          <FiExternalLink className="text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{project.shortDesc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {project.featured ? (
                      <FiStar className="mx-auto text-amber-500" />
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs">
                      {project.order}
                    </span>
                    <div className="flex justify-center gap-2 mt-1">
                      <button
                        onClick={() => moveProjectUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <FiArrowUp />
                      </button>
                      <button
                        onClick={() => moveProjectDown(index)}
                        disabled={index === projects.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <FiArrowDown />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 hover:bg-muted rounded"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={isDeleting === project.id}
                        className="p-2 hover:bg-red-100 text-red-600 rounded disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 