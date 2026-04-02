import Link from 'next/link';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiExternalLink, FiAward, FiInstagram, FiYoutube, FiMail, FiGlobe, FiMessageSquare, FiCode, FiDownload } from 'react-icons/fi';
import { getUserProfile, getUserLanguages, getFeaturedProjects, getUserCertifications } from '@/lib/actions/user';
import ProfileImage from '@/components/ProfileImage';
import { OptimizedImage } from '@/components/OptimizedImage';

export const dynamic = 'force-static';

export default async function Home() {
  const [user, languages, featuredProjects, certifications] = await Promise.all([
    getUserProfile(),
    getUserLanguages(),
    getFeaturedProjects(),
    getUserCertifications()
  ]);

  const fallbackUser = {
    name: "Charles Nana Kwakye",
    jobTitle: "Data Engineer",
    intro: "Driven by a passion for data, I design and implement efficient data solutions, from conducting feasibility studies with LLMs to creating detailed Entity Relationship Diagrams. I am dedicated to transforming complex data into clear, valuable insights."
  };

  const userName = user?.name || fallbackUser.name;
  const userTitle = user?.jobTitle || fallbackUser.jobTitle;
  const userIntro = user?.intro || fallbackUser.intro;
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Apple style: centered, clean, spacious */}
      <section className="relative pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="container px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow */}
            <p className="text-sm font-medium text-muted-foreground mb-4 animate-fade-in">
              Data Engineer & Developer
            </p>
            
            {/* Main heading */}
            <h1 className="animate-slide-up tracking-tight">
              {userName}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground font-normal max-w-xl mx-auto mb-8 animate-slide-up stagger-2 leading-relaxed">
              {userIntro}
            </p>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up stagger-3">
              <Link href="/projects" className="btn-primary">
                View Projects
                <FiArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact Me
              </Link>
            </div>
            
            {/* Social links */}
            <div className="flex items-center justify-center gap-5 mt-10 animate-slide-up stagger-4">
              {user?.SocialLink?.map((link) => {
                const getIcon = (platform: string, customIcon?: string) => {
                  if (customIcon) return <span className="text-lg">{customIcon}</span>;
                  switch (platform.toLowerCase()) {
                    case 'github': return <FiGithub className="h-5 w-5" />;
                    case 'linkedin': return <FiLinkedin className="h-5 w-5" />;
                    case 'twitter': case 'x': return <FiTwitter className="h-5 w-5" />;
                    case 'instagram': return <FiInstagram className="h-5 w-5" />;
                    case 'youtube': return <FiYoutube className="h-5 w-5" />;
                    case 'email': case 'mail': return <FiMail className="h-5 w-5" />;
                    case 'website': case 'portfolio': return <FiGlobe className="h-5 w-5" />;
                    default: return <FiExternalLink className="h-5 w-5" />;
                  }
                };
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title={link.platform}>
                    {getIcon(link.platform, link.icon || undefined)}
                    <span className="sr-only">{link.platform}</span>
                  </a>
                );
              })}
              {(!user?.SocialLink || user.SocialLink.length === 0) && (
                <>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><FiGithub className="h-5 w-5" /><span className="sr-only">GitHub</span></a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><FiLinkedin className="h-5 w-5" /><span className="sr-only">LinkedIn</span></a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Image - Apple style: large, centered, clean */}
      {user?.profileImage && (
        <section className="pb-20 md:pb-28">
          <div className="container px-6 md:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden bg-secondary aspect-[4/3]">
                <ProfileImage
                  src={user.profileImage}
                  alt={userName}
                  size="xl"
                  style="elegant"
                  objectFit="cover"
                  className="w-full h-full"
                  responsive
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats - Apple style: clean grid, minimal */}
      <section className="py-16 border-y border-border/50">
        <div className="container px-6 md:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: `${featuredProjects?.length || 0}+`, label: 'Projects' },
              { value: `${certifications?.length || 0}+`, label: 'Certifications' },
              { value: `${languages?.length || 0}+`, label: 'Languages' },
              { value: '100%', label: 'Commitment' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-semibold tracking-tight">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects - Apple style: clean cards, generous spacing */}
      <section className="section">
        <div className="container px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="section-eyebrow">Selected Work</p>
              <h2 className="section-title">Featured Projects</h2>
              <p className="section-subtitle mx-auto">A selection of my recent work and personal projects</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <article key={project.id} className="card group">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden rounded-xl mb-6 bg-secondary">
                      {project.coverImage ? (
                        <OptimizedImage
                          src={project.coverImage}
                          alt={project.title}
                          width={600}
                          height={450}
                          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                          priority={project.featured}
                          objectFit="cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <FiCode className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold leading-tight group-hover:text-[hsl(var(--accent-blue))] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {project.shortDesc || project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.technologies?.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 pt-3">
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <FiGithub className="h-3.5 w-3.5" /> Code
                          </a>
                        )}
                        {project.demoLink && (
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <FiExternalLink className="h-3.5 w-3.5" /> Demo
                          </a>
                        )}
                        <Link href={`/projects/${project.id}`} className="btn-link ml-auto">
                          Details <FiArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <article key={i} className="card">
                    <div className="aspect-[4/3] bg-secondary rounded-xl mb-6 flex items-center justify-center">
                      <FiCode className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Project {i + 1}</h3>
                      <p className="text-muted-foreground text-sm">Add your projects through the admin panel.</p>
                    </div>
                  </article>
                ))
              )}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/projects" className="btn-link text-base">
                View all projects <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Languages - Apple style: clean grid */}
      {languages && languages.length > 0 && (
        <section className="section bg-secondary/50">
          <div className="container px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="section-eyebrow">Communication</p>
                <h2 className="section-title">Languages</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {languages.map((language) => (
                  <div key={language.id} className="text-center p-6 rounded-2xl bg-card border border-border/50">
                    <div className="text-2xl font-semibold mb-1">{language.name.charAt(0)}</div>
                    <h3 className="font-medium">{language.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{language.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certifications - Apple style: clean list */}
      {certifications && certifications.length > 0 && (
        <section className="section">
          <div className="container px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="section-eyebrow">Credentials</p>
                <h2 className="section-title">Certifications</h2>
              </div>
              <div className="space-y-4">
                {certifications.slice(0, 6).map((cert) => (
                  <div key={cert.id} className="flex items-center gap-5 p-5 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                      <FiAward className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.organization}</p>
                    </div>
                    <span className="text-sm text-muted-foreground flex-shrink-0">{cert.year}</span>
                  </div>
                ))}
              </div>
              {certifications.length > 6 && (
                <div className="text-center mt-10">
                  <Link href="/certifications" className="btn-link text-base">
                    View all certifications <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Apple style: clean, centered */}
      <section className="section border-t border-border/50">
        <div className="container px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Let&apos;s work together
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              I&apos;m always open to discussing new projects and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                <FiMail className="h-4 w-4" />
                Get in Touch
              </Link>
              <Link href="/cv" className="btn-secondary">
                <FiDownload className="h-4 w-4" />
                Download CV
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
