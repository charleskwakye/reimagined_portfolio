import Image from 'next/image';
import {
  FiMapPin, FiCalendar, FiBookOpen, FiHeart, FiMessageSquare,
  FiCode, FiLayout, FiEdit3
} from 'react-icons/fi';
import { getUserProfile, getUserSpecialties, getUserAboutSections, getUserApproachItems, getUserLanguages } from '@/lib/actions/user';
import ProfileImage from '@/components/ProfileImage';
import BackgroundPattern from '@/components/BackgroundPattern';
import ContentCard from '@/components/ContentCard';
import { Specialty, AboutSection, ApproachItem } from '@/lib/types';

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

// Helper function to extract metadata from about text
function extractMetadataFromAbout(aboutText: string, key: string): string {
  // This is a simple extraction method - you can make it more sophisticated if needed
  const regex = new RegExp(`<!-- ${key}:(.*?)-->`, 'i');
  const match = aboutText.match(regex);
  return match ? match[1].trim() : '';
}

export default async function AboutPage() {
  // Fetch all data in parallel for better performance
  const [user, specialties, aboutSections, approachItems, languages] = await Promise.all([
    getUserProfile(),
    getUserSpecialties(),
    getUserAboutSections(),
    getUserApproachItems(),
    getUserLanguages()
  ]);

  // Sort about sections by order
  const sortedAboutSections = aboutSections?.sort((a: AboutSection, b: AboutSection) => a.order - b.order) || [];

  // Sort approach items by order
  const sortedApproachItems = approachItems?.sort((a: ApproachItem, b: ApproachItem) => a.order - b.order) || [];

  // Extract quick facts from user.about
  const userAbout = user?.about || '';

  // Format languages from database
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

  return (
    <BackgroundPattern>
      <div className="flex flex-col min-h-screen">
        <div className="container px-4 py-12 md:px-6 md:py-20 mx-auto">
          <div className="mb-12">
            <div className="max-w-4xl mx-auto">
              <ContentCard className="p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                <div className="w-full max-w-[250px] mx-auto md:mx-0">
                  {user?.profileImage ? (
                    <ProfileImage
                      src={user.profileImage}
                      alt={user?.name || "Profile picture"}
                      size="xl"
                      style="glow"
                      responsive
                    />
                  ) : (
                    <div className="aspect-square bg-muted rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-muted-foreground">
                        {user?.name?.charAt(0) || "J"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">{user?.name || "John Doe"}</h1>
                  <p className="mt-2 text-xl text-muted-foreground">{user?.jobTitle || "Full Stack Developer"}</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    {specialties && specialties.length > 0 ? (
                      specialties.map((specialty: Specialty) => {
                        // Use inline styles for color instead of Tailwind classes
                        const bgColorStyle = {
                          backgroundColor: specialty.color ? `${specialty.color}20` : 'rgba(59, 130, 246, 0.1)',
                          color: specialty.color || 'rgb(59, 130, 246)'
                        };
                        return (
                          <span
                            key={specialty.id}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
                            style={bgColorStyle}
                          >
                            <FiMessageSquare className="h-3 w-3" />
                            {specialty.name}
                          </span>
                        );
                      })
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <FiCode className="h-3 w-3" /> Web Development
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                          <FiLayout className="h-3 w-3" /> UX Design
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-500">
                          <FiEdit3 className="h-3 w-3" /> Mobile Apps
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </ContentCard>

              {/* About Sections - Enhanced with visual styling */}
              {sortedAboutSections && sortedAboutSections.length > 0 ? (
                <div className="mt-12 space-y-12">
                  {sortedAboutSections.map((section: AboutSection, index: number) => (
                    <ContentCard
                      key={section.id}
                      className={`p-8 md:p-12 border rounded-lg shadow-sm ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-center mb-6 pb-4 border-b">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                      </div>
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                      </div>
                    </ContentCard>
                  ))}
                </div>
              ) : (
                <></>
              )}

              {/* My Approach Section - Enhanced with visual styling */}
              <ContentCard className="mt-12 p-8 md:p-12 border rounded-lg shadow-sm bg-muted/30">
                <div className="flex items-center mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold">My Approach</h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  {sortedApproachItems && sortedApproachItems.length > 0 ? (
                    sortedApproachItems.map((item: ApproachItem) => (
                      <div key={item.id} className="bg-card p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-3">User-Centered Design</h3>
                        <p className="text-muted-foreground">
                          I prioritize user experience in everything I build. Understanding user needs and behaviors is essential to creating
                          intuitive and effective solutions.
                        </p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-3">Clean & Maintainable Code</h3>
                        <p className="text-muted-foreground">
                          Writing clean, well-documented, and maintainable code is a core principle in my development process. I believe
                          good code should be readable and scalable.
                        </p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-3">Continuous Learning</h3>
                        <p className="text-muted-foreground">
                          The tech landscape is always evolving, and I'm committed to staying current with the latest tools,
                          frameworks, and best practices in web development.
                        </p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-semibold mb-3">Collaborative Process</h3>
                        <p className="text-muted-foreground">
                          I value open communication and collaboration. Working closely with clients and team members ensures that
                          we create solutions that meet everyone's needs.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </ContentCard>

              {/* Keep Quick Facts as is */}
              <BackgroundPattern interactive={true}>
                <ContentCard className="mt-12 p-8 md:p-12 border rounded-lg shadow-sm">
                  <div className="flex items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold">Quick Facts</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-center space-x-3">
                      <FiMapPin className="flex-shrink-0 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-responsive-sm font-medium">Location</h3>
                        <p className="text-responsive-xs text-muted-foreground">{quickFacts.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiCalendar className="flex-shrink-0 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-responsive-sm font-medium">Experience</h3>
                        <p className="text-responsive-xs text-muted-foreground">{quickFacts.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiBookOpen className="flex-shrink-0 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-responsive-sm font-medium">Education</h3>
                        <p className="text-responsive-xs text-muted-foreground">{quickFacts.education}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiHeart className="flex-shrink-0 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-responsive-sm font-medium">Interests</h3>
                        <p className="text-responsive-xs text-muted-foreground">{quickFacts.interests}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiMessageSquare className="flex-shrink-0 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-responsive-sm font-medium">Languages</h3>
                        <p className="text-responsive-xs text-muted-foreground">{quickFacts.languages}</p>
                      </div>
                    </div>
                  </div>
                </ContentCard>
              </BackgroundPattern>
            </div>
          </div>
        </div>
      </div>
    </BackgroundPattern>
  );
} 