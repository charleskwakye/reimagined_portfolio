'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiExternalLink, FiFileText, FiAward } from 'react-icons/fi';
import DeleteButton from '@/components/DeleteButton';
import { useRouter } from 'next/navigation';

interface Certification {
  id: string;
  title: string;
  organization: string;
  year: string;
  url?: string;
  pdfUrl?: string;
  iconUrl?: string;
}

export default function CertificationsPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch('/api/certifications');
        if (response.ok) {
          const data = await response.json();
          // Handle the correct response format
          setCertifications(data.certifications || data);
        } else {
          console.error('Failed to fetch certifications');
        }
      } catch (error) {
        console.error('Error loading certifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCertifications();
  }, []);

  const handleDeleteSuccess = (deletedId: string) => {
    setCertifications(certifications.filter(cert => cert.id !== deletedId));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading certifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground">
            Manage your certifications and professional credentials
          </p>
        </div>
        <Link
          href="/admin/certifications/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Certification
        </Link>
      </div>

      {certifications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-medium">No certifications found</h2>
          <p className="text-muted-foreground mt-1">
            Get started by adding your first certification.
          </p>
          <Link
            href="/admin/certifications/new"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Certification
          </Link>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-sm">
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Certificate</th>
                <th className="px-4 py-3 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((certification) => (
                <tr key={certification.id} className="border-b">
                  <td className="px-4 py-3">
                    {certification.iconUrl ? (
                      <div className="w-10 h-10 flex items-center justify-center">
                        <img 
                          src={certification.iconUrl} 
                          alt={certification.title}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <FiAward className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{certification.title}</td>
                  <td className="px-4 py-3">{certification.organization}</td>
                  <td className="px-4 py-3">{certification.year}</td>
                  <td className="px-4 py-3">
                    {certification.pdfUrl ? (
                      <Link
                        href={`/certifications/${certification.id}/view`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiFileText className="h-4 w-4 mr-1" />
                        View PDF
                      </Link>
                    ) : certification.url ? (
                      <a
                        href={certification.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiExternalLink className="h-4 w-4 mr-1" />
                        View Certificate
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">No certificate</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Link
                      href={`/admin/certifications/${certification.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm shadow-sm hover:bg-accent"
                    >
                      <span className="sr-only">Edit</span>
                      <FiEdit className="h-4 w-4" />
                    </Link>
                    <DeleteButton
                      endpoint={`/api/certifications/${certification.id}/delete`}
                      itemName="certification"
                      onSuccess={() => handleDeleteSuccess(certification.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 