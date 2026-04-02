import Link from 'next/link';
import { FiPlus, FiEdit } from 'react-icons/fi';
import { getUserExperience } from '@/lib/actions/user';
import { Experience } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';

// Helper function to format dates
function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export default async function AdminExperiencePage() {
  const experiences = await getUserExperience();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground">Manage your work experience</p>
        </div>
        <Link
          href="/admin/experience/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Experience
        </Link>
      </div>

      {experiences && experiences.length > 0 ? (
        <div className="space-y-6">
          {experiences.map((experience: Experience) => (
            <div key={experience.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{experience.title}</h3>
                    <p className="text-muted-foreground">{experience.company}</p>
                    {experience.location && (
                      <p className="text-sm text-muted-foreground">{experience.location}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate)}
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: experience.description }} />
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Link
                    href={`/admin/experience/${experience.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <FiEdit className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <DeleteButton 
                    endpoint={`/api/experience/${experience.id}/delete`}
                    itemName="experience"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Experience Entries Found</h2>
          <p className="text-muted-foreground mb-6">
            You haven't added any work experience yet. Add your professional experience to showcase your career journey.
          </p>
          <Link
            href="/admin/experience/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Experience
          </Link>
        </div>
      )}
    </div>
  );
} 