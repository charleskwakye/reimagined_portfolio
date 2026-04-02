import Link from 'next/link';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiExternalLink, FiAward, FiInstagram, FiYoutube, FiMail, FiGlobe, FiMessageSquare, FiCode, FiDownload, FiCpu, FiDatabase, FiLayers, FiZap, FiTerminal } from 'react-icons/fi';
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
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 data-grid pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="container px-6 md:px-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left - Main content */}
              <div className="lg:col-span-7 space-y-8">
                {/* Status badge */}
                <div className="animate-slide-up">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono tracking-wider uppercase text-primary">Available for opportunities</span>
                  </div>
                </div>
                
                {/* Main heading */}
                <div className="space-y-2 animate-slide-up stagger-1">
                  <p className="text-lg md:text-xl text-muted-foreground font-light">Hello, I&apos;m</p>
                  <h1 className="leading-[0.9]">
                    {userName.split(' ').map((word, i) => (
                      <span key={i} className="block">
                        {i === userName.split(' ').length - 1 ? (
                          <span className="gradient-text">{word}</span>
                        ) : (
                          word
                        )}
                      </span>
                    ))}
                  </h1>
                </div>
                
                {/* Role */}
                <div className="animate-slide-up stagger-2">
                  <div className="flex items-center gap-3">
                    <FiTerminal className="h-5 w-5 text-primary" />
                    <p className="text-xl md:text-2xl font-mono text-primary">{userTitle}</p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="max-w-xl text-muted-foreground text-lg leading-relaxed animate-slide-up stagger-3">
                  {userIntro}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up stagger-4">
                  <Link href="/projects" className="btn-primary">
                    <FiLayers className="h-4 w-4" />
                    View Projects
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    Get in Touch
                  </Link>
                </div>
                
                {/* Social links */}
                <div className="flex items-center gap-5 pt-6 animate-slide-up stagger-5">
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
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110" title={link.platform}>
                        {getIcon(link.platform, link.icon || undefined)}
                        <span className="sr-only">{link.platform}</span>
                      </a>
                    );
                  })}
                  {(!user?.SocialLink || user.SocialLink.length === 0) && (
                    <>
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"><FiGithub className="h-5 w-5" /><span className="sr-only">GitHub</span></a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"><FiLinkedin className="h-5 w-5" /><span className="sr-only">LinkedIn</span></a>
                    </>
                  )}
                </div>
              </div>
              
              {/* Right - Profile image with tech frame */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-in">
                <div className="relative">
                  {/* Rotating border effect */}
                  <div className="absolute -inset-4 rounded-2xl border border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="absolute -inset-2 rounded-xl border border-primary/10" />
                  
                  {/* Glow behind image */}
                  <div className="absolute -inset-8 bg-primary/10 rounded-3xl blur-2xl" />
                  
                  <div className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-xl border border-border/50">
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
                      <div className="w-full h-full bg-card flex items-center justify-center">
                        <span className="text-6xl font-display font-bold gradient-text">{initials}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Floating tech badges */}
                  <div className="absolute -top-4 -right-4 px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg animate-float">
                    <FiDatabase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                    <FiCpu className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
            {[
              { value: `${featuredProjects?.length || 0}+`, label: 'Projects', icon: FiLayers },
              { value: `${certifications?.length || 0}+`, label: 'Certifications', icon: FiAward },
              { value: `${languages?.length || 0}+`, label: 'Languages', icon: FiMessageSquare },
              { value: '100%', label: 'Commitment', icon: FiZap },
            ].map((stat, i) => (
              <div key={i} className="py-10 px-6 text-center group hover:bg-primary/5 transition-colors">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="text-4xl md:text-5xl font-display font-bold gradient-text">{stat.value}</div>
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mt-2">{stat.label}</p>
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
                <h2 className="section-title">Featured <span className="gradient-text">Projects</span></h2>
                <p className="section-subtitle">A selection of my recent work and personal projects</p>
              </div>
              <Link href="/projects" className="btn-secondary self-start md:self-auto">
                View All
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project, index) => (
                  <article key={project.id} className="card group">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden rounded-lg mb-6 relative">
                      {project.coverImage ? (
                        <OptimizedImage
                          src={project.coverImage}
                          alt={project.title}
                          width={600}
                          height={450}
                          className="h-full w-full transition-transform duration-700 group-hover:scale-110"
                          priority={project.featured}
                          objectFit="cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-secondary/50 flex items-center justify-center">
                          <FiCode className="h-16 w-16 text-muted-foreground/20" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {project.featured && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-mono tracking-wider uppercase">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {project.shortDesc || project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies?.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="px-3 py-1 text-[10px] font-mono tracking-wider uppercase font-medium rounded-full border border-primary/20 bg-primary/5 text-primary">
                            {tech}
                          </span>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <span className="px-3 py-1 text-[10px] font-mono tracking-wider uppercase font-medium rounded-full border border-border text-muted-foreground">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-border/50">
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <FiGithub className="h-3 w-3" /> Code
                          </a>
                        )}
                        {project.demoLink && (
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <FiExternalLink className="h-3 w-3" /> Demo
                          </a>
                        )}
                        <Link href={`/projects/${project.id}`} className="text-xs font-mono text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ml-auto">
                          Details <FiArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <article key={i} className="card">
                    <div className="aspect-[4/3] bg-secondary/50 rounded-lg mb-6 flex items-center justify-center">
                      <FiCode className="h-16 w-16 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-display font-bold">Project {i + 1}</h3>
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
        <section className="section border-y border-border/50 bg-card/30">
          <div className="container px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
              <span className="section-label">Communication</span>
              <h2 className="section-title mb-4">Languages <span className="gradient-text">Spoken</span></h2>
              <p className="section-subtitle mb-12">Communication is key to collaboration</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/50 rounded-xl overflow-hidden">
                {languages.map((language) => (
                  <div key={language.id} className="bg-background p-8 text-center group hover:bg-primary/5 transition-all duration-300">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <span className="text-2xl font-display font-bold gradient-text">{language.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg">{language.name}</h3>
                    <p className="text-xs font-mono tracking-wider uppercase text-primary mt-2">{language.proficiency}</p>
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
              <h2 className="section-title mb-4">Certifications <span className="gradient-text">& Awards</span></h2>
              <p className="section-subtitle mb-12">Professional development and continuous learning</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certifications.slice(0, 6).map((cert) => (
                  <div key={cert.id} className="card group flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <FiAward className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cert.organization}</p>
                      <span className="inline-block mt-2 text-xs font-mono tracking-wider text-primary">{cert.year}</span>
                    </div>
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
      <section className="section border-t border-border/50 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        
        <div className="container px-6 md:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="section-label justify-center">Let&apos;s Connect</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Ready to build something <span className="gradient-text">remarkable</span>?
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
