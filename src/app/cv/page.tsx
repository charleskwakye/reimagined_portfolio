import Link from 'next/link';
import { FiDownload, FiMail, FiMaximize, FiMinimize, FiAward } from 'react-icons/fi';
import { getUserProfile, getUserCertifications } from '@/lib/actions/user';
import { getContactInfo } from '@/lib/userPreferences';
import { notFound } from 'next/navigation';
import CVClientWrapper from './CVClientWrapper';

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

interface ContactInfo {
  email: string;
  location: string;
  connectText: string;
}

export default async function CVPage() {
  // Fetch data in parallel for better performance
  const [user, contactInfo, certifications] = await Promise.all([
    getUserProfile(),
    getContactInfoWrapper(),
    getUserCertifications()
  ]);

  if (!user) {
    notFound();
  }

  const resumeUrl = user.resumeUrl || null;
  const contact: ContactInfo = contactInfo || {
    email: user.SocialLink?.find(link => link.platform.toLowerCase() === 'email')?.url || 'contact@example.com',
    location: 'Location',
    connectText: 'Interested in working together? Feel free to reach out to discuss potential opportunities.'
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4 mb-8">
          <h1 className="text-responsive-4xl font-bold tracking-tight">Curriculum Vitae</h1>
          <p className="text-xl text-muted-foreground">
            My professional experience, education, and skills.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* CV Viewer with client-side interactivity */}
          <CVClientWrapper resumeUrl={resumeUrl} />

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <FiMail className="mr-2 h-4 w-4" />
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                    {contact.email}
                  </a>
                </p>
                <p>
                  <span className="font-medium">Location:</span> {contact.location}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Let's Connect</h2>
              <p className="text-muted-foreground mb-4">
                {contact.connectText}
              </p>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Contact Me
              </Link>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div id="certifications" className="mt-16">
          <h2 className="text-2xl font-bold tracking-tighter md:text-3xl mb-8">Certifications</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certifications && certifications.length > 0 ? (
              certifications.map((cert) => (
                (cert.url || cert.pdfUrl) ? (
                  cert.pdfUrl ? (
                    <Link
                      key={cert.id}
                      href={`/certifications/${cert.id}/view`}
                      className="block group"
                    >
                      <div className="p-4 border-l-4 border-l-primary bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:border-white/20 hover:bg-slate-900/50 transition-all duration-300 rounded-lg h-full">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {cert.iconUrl ? (
                              <div className="w-10 h-10 flex items-center justify-center">
                                <img 
                                  src={cert.iconUrl} 
                                  alt={cert.title}
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center border border-primary/30 shadow-sm">
                                <FiAward className="w-5 h-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-tight mb-1 text-foreground">
                              {cert.title}
                            </h3>
                            <p className="text-muted-foreground text-xs font-medium">
                              {cert.organization}
                            </p>
                            <div className="mt-2 flex items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25 shadow-sm">
                                {cert.year}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <a
                      key={cert.id}
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="p-4 border-l-4 border-l-primary bg-slate-900/30 backdrop-blur-lg border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/10 hover:bg-slate-900/40 transition-all duration-300 rounded-lg h-full">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {cert.iconUrl ? (
                              <div className="w-10 h-10 flex items-center justify-center">
                                <img 
                                  src={cert.iconUrl} 
                                  alt={cert.title}
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                                <FiAward className="w-5 h-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-tight mb-1 text-foreground group-hover:text-primary transition-colors">
                              {cert.title}
                            </h3>
                            <p className="text-muted-foreground text-xs font-medium">
                              {cert.organization}
                            </p>
                            <div className="mt-2 flex items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                {cert.year}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  )
                ) : (
                  <div key={cert.id} className="p-4 border-l-4 border-l-primary bg-gradient-to-br from-background to-muted/20 relative group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full rounded-lg border border-border">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {cert.iconUrl ? (
                          <div className="w-10 h-10 flex items-center justify-center">
                            <img 
                              src={cert.iconUrl} 
                              alt={cert.title}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                            <FiAward className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight mb-1 text-foreground">{cert.title}</h3>
                        <p className="text-muted-foreground text-xs font-medium">{cert.organization}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {cert.year}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))
            ) : (
              <p className="text-muted-foreground">No certifications found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to safely get contact info
async function getContactInfoWrapper(): Promise<ContactInfo | null> {
  try {
    const user = await getUserProfile();
    if (!user) return null;
    return await getContactInfo(user.id);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
}
