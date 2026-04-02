import Link from 'next/link';
import { FiPlus, FiEdit } from 'react-icons/fi';
import { getUserEducation } from '@/lib/actions/user';
import { Education } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';

// Helper function to format date
function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export default async function AdminEducationPage() {
  const education = await getUserEducation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Education</h1>
          <p className="text-muted-foreground">Manage your education history</p>
        </div>
        <Link
          href="/admin/education/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Education
        </Link>
      </div>

      {education && education.length > 0 ? (
        <div className="space-y-4">
          {education.map((edu: Education) => (
            <div key={edu.id} className="flex flex-col space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-sm text-muted-foreground">
                    {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    {edu.current && ' (Current)'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/education/${edu.id}/edit`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <FiEdit className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <DeleteButton 
                    endpoint={`/api/education/${edu.id}/delete`} 
                    itemName="education entry" 
                  />
                </div>
              </div>
              {edu.description && (
                <div className="prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: edu.description }} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No education entries found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first education entry to display on your resume
          </p>
          <Link
            href="/admin/education/new"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Education
          </Link>
        </div>
      )}
    </div>
  );
} 