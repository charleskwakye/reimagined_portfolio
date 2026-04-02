import {
  FiMapPin, FiCalendar, FiBookOpen, FiHeart, FiMessageSquare,
  FiCode, FiLayout, FiEdit3, FiArrowRight
} from 'react-icons/fi';
import Link from 'next/link';
import { getUserProfile, getUserSpecialties, getUserAboutSections, getUserApproachItems, getUserLanguages } from '@/lib/actions/user';
import ProfileImage from '@/components/ProfileImage';
import { Specialty, AboutSection, ApproachItem } from '@/lib/types';

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

// Helper function to extract metadata from about text
function extractMetadataFromAbout(aboutText: string, key: string): string {
  const regex = new RegExp(`<!-- ${key}:(.*?)-->`, 'i');
  const match = aboutText.match(regex);
  return match ? match[1].trim() : '';
}

export default async function AboutPage() {
  const [user, specialties, aboutSections, approachItems, languages] = await Promise.all([
    getUserProfile(),
    getUserSpecialties(),
    getUserAboutSections(),
    getUserApproachItems(),
    getUserLanguages()
  ]);

  const sortedAboutSections = aboutSections?.sort((a: AboutSection, b: AboutSection) => a.order - b.order) || [];
  const sortedApproachItems = approachItems?.sort((a: ApproachItem, b: ApproachItem) => a.order - b.order) || [];

  const userAbout = user?.about || '';

  const formattedLanguages = languages && languages.length > 0
    ? languages.map(lang => `${lang.name} (${lang.proficiency})`).join(', ')
    : 'English, Spanish';

  const quickFacts = {
    location: extractMetadataFromAbout(userAbout, 'location') || 'San Francisco, CA',
    experience: extractMetadataFromAbout(userAbout, 'experience') || '5+ years',
    education: extractMetadataFromAbout(userAbout, 'education') || 'BSc Computer Science',
    interests: extractMetadataFromAbout(userAbout, 'interests') || 'Hiking, Reading, Photography',
    languages: formattedLanguages
  };

  const userName = user?.name || 'Charles Kwakye';
  const userTitle = user?.jobTitle || 'Full Stack Developer';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="card p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              <div className="w-full max-w-[250px] mx-auto md:mx-0 flex-shrink-0">
                {user?.profileImage ? (
                  <ProfileImage
                    src={user.profileImage}
                    alt={userName}
                    size="xl"
                    style="elegant"
                    responsive
                    className="rounded-2xl shadow-xl"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 aspect-square flex items-center justify-center rounded-2xl border-2 border-primary/20 shadow-xl">
                    <span className="text-5xl font-extrabold gradient-text">{initials}</span>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">{userName}</h1>
                <p className="mt-2 text-xl text-muted-foreground font-medium">{userTitle}</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  {specialties && specialties.length > 0 ? (
                    specialties.map((specialty: Specialty) => (
                      <span
                        key={specialty.id}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground"
                        style={{
                          backgroundColor: specialty.color ? `${specialty.color}15` : undefined,
                          color: specialty.color || undefined
                        }}
                      >
                        <FiMessageSquare className="h-3 w-3" />
                        {specialty.name}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium">
                        <FiCode className="h-3 w-3" /> Web Development
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium">
                        <FiLayout className="h-3 w-3" /> UX Design
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium">
                        <FiEdit3 className="h-3 w-3" /> Mobile Apps
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Sections */}
      {sortedAboutSections.length > 0 && (
        <section className="section">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-8">
              {sortedAboutSections.map((section: AboutSection, index: number) => (
                <div key={section.id} className="card p-8 md:p-12">
                  <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-border">{section.title}</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* My Approach Section */}
      {sortedApproachItems.length > 0 && (
        <section className="section bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="section-title">My Approach</h2>
                <p className="section-subtitle">The principles that guide my work</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {sortedApproachItems.map((item: ApproachItem) => (
                  <div key={item.id} className="card p-6">
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Facts */}
      <section className="section">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Quick Facts</h2>
              <p className="section-subtitle">A snapshot of who I am</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="card flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiMapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h3>
                  <p className="text-foreground mt-1">{quickFacts.location}</p>
                </div>
              </div>
              <div className="card flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiCalendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Experience</h3>
                  <p className="text-foreground mt-1">{quickFacts.experience}</p>
                </div>
              </div>
              <div className="card flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiBookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Education</h3>
                  <p className="text-foreground mt-1">{quickFacts.education}</p>
                </div>
              </div>
              <div className="card flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiHeart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Interests</h3>
                  <p className="text-foreground mt-1">{quickFacts.interests}</p>
                </div>
              </div>
              <div className="card flex items-start gap-4 md:col-span-2 lg:col-span-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiMessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Languages</h3>
                  <p className="text-foreground mt-1">{quickFacts.languages}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Interested in working together?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how I can help bring your ideas to life.
            </p>
            <Link href="/contact" className="btn-primary">
              Get in Touch
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
