import Link from 'next/link';
import { FiArrowRight, FiCalendar, FiMapPin, FiCode, FiBriefcase } from 'react-icons/fi';
import { getInternships } from '@/lib/actions/user';
import BackgroundPattern from '@/components/BackgroundPattern';
import { Internship } from '@/lib/types';

// Format date for display
function formatDate(date: Date | string | null): string {
  if (!date) return 'Present';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

export default async function InternshipPage() {
  const internships = await getInternships();

  return (
    <BackgroundPattern>
      <div className="flex flex-col min-h-screen">
        <div className="container w-full px-3 sm:px-4 mt-16">
          <div className="text-center py-16">
            <div className="mb-6">
              <h1 className="text-responsive-3xl font-bold pb-4 border-b border-border inline-block">Internship Experience</h1>
            </div>
            <p className="text-responsive-lg text-muted-foreground max-w-3xl mx-auto">
              Explore my practical experience gained through various internship opportunities.
            </p>
          </div>

          <div className="w-full lg:max-w-5xl mx-auto py-8 md:py-12">
            <div className="space-y-6 md:space-y-8">
              {internships && internships.length > 0 ? (
                internships.map((internship: Internship) => (
                  <Link
                    key={internship.id}
                    href={`/internship/${internship.id}`}
                    className="block bg-card rounded-2xl shadow-md border border-border p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] group"
                  >
                    {/* Title Level */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 hidden sm:flex items-center justify-center flex-shrink-0">
                        <FiBriefcase className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-responsive-lg font-semibold text-card-foreground leading-none">{internship.title}</h2>
                    </div>

                    {/* Company, Location, Date Level */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 md:mb-6">
                      <div className="font-medium text-responsive-sm text-primary bg-primary/5 px-3 py-1.5 rounded-md border border-primary/15 shadow-sm w-fit">
                        {internship.company}
                      </div>

                      {internship.location && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <FiMapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-xs" title={internship.location || ''}>
                            {internship.location}
                          </span>
                        </div>
                      )}

                      <div className="text-muted-foreground bg-background/80 border border-border/50 rounded-md px-3 py-1 flex items-center shadow-sm">
                        <FiCalendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {formatDate(internship.startDate || new Date())} - {formatDate(internship.endDate || new Date())}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <p className="text-responsive-sm text-card-foreground/80 mb-4 sm:mb-5 leading-relaxed">
                        {internship.shortDesc}
                      </p>
                    </div>

                    {internship.technologies && internship.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                        {internship.technologies.slice(0, 5).map((tech: string, index: number) => (
                          <span
                            key={`${internship.id}_tech_${index}`}
                            className="px-3 py-1.5 rounded-lg bg-secondary/30 text-secondary-foreground text-responsive-xs font-medium shadow-sm flex items-center border border-secondary/40"
                          >
                            <FiCode className="mr-1.5" size={12} />
                            {tech}
                          </span>
                        ))}
                        {internship.technologies.length > 5 && (
                          <span className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-responsive-xs font-medium shadow-sm border border-border">
                            +{internship.technologies.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <span className="inline-flex items-center text-responsive-sm font-medium text-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                        View Details <FiArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-card rounded-xl shadow-md border border-border p-6 sm:p-8 text-center">
                  <h2 className="text-responsive-xl font-medium mb-3 text-card-foreground">No Internships Yet</h2>
                  <p className="text-muted-foreground">
                    Internship experiences will be added soon. Check back later!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BackgroundPattern>
  );
} 