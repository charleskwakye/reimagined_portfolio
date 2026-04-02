import Link from 'next/link';
import { FiPlus, FiEdit } from 'react-icons/fi';
import { getInternships } from '@/lib/actions/user';
import { Internship } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';

// Format date for display
function formatDate(date: Date | string | null): string {
  if (!date) return 'Present';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function AdminInternshipPage() {
  const internships = await getInternships();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internships</h1>
          <p className="text-muted-foreground">Manage your internship experiences</p>
        </div>
        <Link
          href="/admin/internship/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Internship
        </Link>
      </div>

      {internships && internships.length > 0 ? (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duration</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {internships.map((internship: Internship) => (
                  <tr key={internship.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{internship.title}</td>
                    <td className="p-4 align-middle">{internship.company}</td>
                    <td className="p-4 align-middle">
                      {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="line-clamp-2 max-w-md text-muted-foreground">
                        {internship.shortDesc}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/internship/${internship.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <FiEdit className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteButton 
                          endpoint={`/api/internship/${internship.id}/delete`} 
                          itemName="internship" 
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
          <h3 className="text-lg font-medium mb-2">No Internships Found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't added any internships yet. Add your internship experiences to showcase your 
            practical training and skills development.
          </p>
          <Link
            href="/admin/internship/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Internship
          </Link>
        </div>
      )}
    </div>
  );
} 