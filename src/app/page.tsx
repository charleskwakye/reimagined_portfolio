import Link from 'next/link';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiExternalLink, FiAward, FiInstagram, FiYoutube, FiMail, FiGlobe, FiMessageSquare, FiCode, FiDownload, FiArrowDown } from 'react-icons/fi';
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
      {/* Hero Section - Editorial style */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 data-grid opacity-30" />
        
        {/* Accent line */}
        <div className="absolute top-0 left-0 w-full h-px bg-primary/20" />
        
        <div className="container px-6 md:px-12 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end py-20">
              {/* Left - Main content */}
              <div className="lg:col-span-8 space-y-8 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-primary" />
                  <span className="section-label mb-0">Data Engineer & Developer</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
                  {userName.split(' ').map((word, i) => (
                    <span key={i} className="block">
                      {i === userName.split(' ').length - 1 ? (
                        <span className="text-primary">{word}</span>
                      ) : (
                        word
                      )}
                    </span>
                  ))}
                </h1>
                
                <p className="max-w-xl text-muted-foreground text-lg leading-relaxed">
                  {userIntro}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/projects" className="btn-primary">
                    View Projects
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    Get in Touch
                  </Link>
                </div>
              </div>
              
              {/* Right - Profile image */}
              <div className="lg:col-span-4 flex justify-end animate-fade-in">
                <div className="relative">
                  <div className="absolute -inset-2 border border-primary/20 rounded-sm" />
                  <div className="relative w-48 h-48 md:w-56 md:h-56 overflow-hidden rounded-sm">
                    {user?.profileImage ? (
                      <ProfileImage
                        src={user.profileImage}
                        alt={userName}
                        size="xl"
                        style="elegant"
                        objectFit="cover"
                        className="w-full h-full"
                        responsive
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <span className="text-4xl font-serif text-primary">{initials}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social links - bottom */}
            <div className="flex items-center gap-6 pt-8 border-t border-border/50">
              {user?.SocialLink?.map((link) => {
                const getIcon = (platform: string, customIcon?: string) => {
                  if (customIcon) return <span className="text-lg">{customIcon}</span>;
                  switch (platform.toLowerCase()) {
                    case 'github': return <FiGithub className="h-4 w-4" />;
                    case 'linkedin': return <FiLinkedin className="h-4 w-4" />;
                    case 'twitter': case 'x': return <FiTwitter className="h-4 w-4" />;
                    case 'instagram': return <FiInstagram className="h-4 w-4" />;
                    case 'youtube': return <FiYoutube className="h-4 w-4" />;
                    case 'email': case 'mail': return <FiMail className="h-4 w-4" />;
                    case 'website': case 'portfolio': return <FiGlobe className="h-4 w-4" />;
                    default: return <FiExternalLink className="h-4 w-4" />;
                  }
                };
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={link.platform}>
                    {getIcon(link.platform, link.icon || undefined)}
                    <span className="sr-only">{link.platform}</span>
                  </a>
                );
              })}
              {(!user?.SocialLink || user.SocialLink.length === 0) && (
                <>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FiGithub className="h-4 w-4" /><span className="sr-only">GitHub</span></a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FiLinkedin className="h-4 w-4" /><span className="sr-only">LinkedIn</span></a>
                </>
              )}
              <div className="flex-1" />
              <span className="text-xs text-muted-foreground tracking-wider uppercase">Scroll to explore</span>
              <FiArrowDown className="h-4 w-4 text-muted-foreground animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { value: `${featuredProjects?.length || 0}+`, label: 'Projects' },
              { value: `${certifications?.length || 0}+`, label: 'Certifications' },
              { value: `${languages?.length || 0}+`, label: 'Languages' },
              { value: '100%', label: 'Commitment' },
            ].map((stat, i) => (
              <div key={i} className="py-8 px-6 text-center">
                <div className="text-3xl md:text-4xl font-serif text-primary">{stat.value}</div>
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section">
        <div className="container px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <span className="section-label">Selected Work</span>
                <h2 className="section-title">Featured Projects</h2>
              </div>
              <Link href="/projects" className="btn-secondary self-start md:self-auto">
                View All
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project, index) => (
                  <article key={project.id} className="group card p-0 overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden bg-secondary">
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
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-serif group-hover:text-primary transition-colors leading-tight">
                          {project.title}
                        </h3>
                        {project.featured && <FiAward className="h-5 w-5 text-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {project.shortDesc || project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies?.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="px-2 py-1 text-[10px] tracking-wider uppercase font-medium rounded-sm bg-secondary text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <span className="px-2 py-1 text-[10px] tracking-wider uppercase font-medium rounded-sm bg-muted text-muted-foreground">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 pt-2 border-t border-border/50">
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <FiGithub className="h-3 w-3" /> Code
                          </a>
                        )}
                        {project.demoLink && (
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <FiExternalLink className="h-3 w-3" /> Demo
                          </a>
                        )}
                        <Link href={`/projects/${project.id}`} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ml-auto">
                          Details <FiArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <article key={i} className="card p-0 overflow-hidden">
                    <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                      <FiCode className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-serif">Project {i + 1}</h3>
                      <p className="text-muted-foreground text-sm">Add your projects through the admin panel.</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section className="section bg-secondary/30 border-y border-border">
          <div className="container px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
              <span className="section-label">Communication</span>
              <h2 className="section-title mb-12">Languages</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                {languages.map((language) => (
                  <div key={language.id} className="bg-background p-8 text-center group hover:bg-primary/5 transition-colors">
                    <div className="text-3xl font-serif text-primary mb-3">{language.name.charAt(0)}</div>
                    <h3 className="font-medium">{language.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">{language.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="section">
          <div className="container px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
              <span className="section-label">Credentials</span>
              <h2 className="section-title mb-12">Certifications</h2>
              <div className="grid gap-px bg-border border border-border">
                {certifications.slice(0, 6).map((cert) => (
                  <div key={cert.id} className="bg-background p-6 md:p-8 flex items-start gap-6 group hover:bg-primary/5 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-secondary flex items-center justify-center">
                      <FiAward className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg group-hover:text-primary transition-colors">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cert.organization}</p>
                    </div>
                    <span className="text-xs text-muted-foreground tracking-wider flex-shrink-0">{cert.year}</span>
                  </div>
                ))}
              </div>
              {certifications.length > 6 && (
                <div className="text-center mt-12">
                  <Link href="/certifications" className="btn-secondary">
                    View All
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-secondary/30 border-t border-border">
        <div className="container px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="section-label">Let&apos;s Connect</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
              Ready to build something <span className="text-primary">remarkable</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
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
