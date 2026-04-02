"use client";

import Link from 'next/link';
import { FiEdit, FiUser, FiMessageSquare, FiTool, FiGlobe, FiBriefcase, FiBook, FiFolder, FiAward, FiClock, FiList, FiFileText } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check authentication on client side as an additional protection
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Show loading state if authentication status is loading
  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not authenticated (should be handled by middleware, but just in case)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your portfolio content</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/profile"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
              <FiUser className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/about"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20">
              <FiMessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">About</h3>
              <p className="text-sm text-muted-foreground">Manage your about page content and specialties</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/quick-facts"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20">
              <FiUser className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Quick Facts</h3>
              <p className="text-sm text-muted-foreground">Manage quick facts displayed on your About page</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/tools"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20">
              <FiTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Tools</h3>
              <p className="text-sm text-muted-foreground">Manage your tools and technologies</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/experience"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500/20">
              <FiBriefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Experience</h3>
              <p className="text-sm text-muted-foreground">Manage your work experience</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/education"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500/20">
              <FiBook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Education</h3>
              <p className="text-sm text-muted-foreground">Manage your education details</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/cv"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20">
              <FiFileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">CV Management</h3>
              <p className="text-sm text-muted-foreground">Upload and manage your CV/Resume</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/certifications"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20">
              <FiAward className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Certifications</h3>
              <p className="text-sm text-muted-foreground">Manage your professional certifications</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/projects"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500/20">
              <FiFolder className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Projects</h3>
              <p className="text-sm text-muted-foreground">Manage your projects</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/internship"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20">
              <FiClock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Internships</h3>
              <p className="text-sm text-muted-foreground">Manage your internship experiences</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/logs"
          className="group flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500/10 text-gray-500 group-hover:bg-gray-500/20">
              <FiList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">System Logs</h3>
              <p className="text-sm text-muted-foreground">View system activities and errors</p>
            </div>
          </div>
          <FiEdit className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
} 