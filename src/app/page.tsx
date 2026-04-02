import Link from 'next/link';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiExternalLink, FiAward, FiInstagram, FiYoutube, FiMail, FiGlobe, FiMessageSquare, FiCode, FiDownload } from 'react-icons/fi';
import { getUserProfile, getUserLanguages, getFeaturedProjects, getUserCertifications } from '@/lib/actions/user';
import ProfileImage from '@/components/ProfileImage';
import { OptimizedImage } from '@/components/OptimizedImage';

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

export default async function Home() {
  // Fetch data in parallel for better performance
  const [user, languages, featuredProjects, certifications] = await Promise.all([
    getUserProfile(),
    getUserLanguages(),
    getFeaturedProjects(),
    getUserCertifications()
  ]);

  // Fallback data if the database is empty
  const fallbackUser = {
    name: "Charles Kwakye",
    jobTitle: "Full Stack Developer",
    intro: "I build accessible, responsive, and performant web applications with modern technologies. Passionate about creating intuitive user experiences and clean, maintainable code."
  };

  const userName = user?.name || fallbackUser.name;
  const userTitle = user?.jobTitle || fallbackUser.jobTitle;
  const userIntro = user?.intro || fallbackUser.intro;
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="flex flex-col justify-center space-y-6 animate-slide-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                    <FiAward className="h-4 w-4" />
                    <span>Available for opportunities</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight">
                    Hi, I&apos;m{' '}
                    <span className="gradient-text">{userName}</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                    {userTitle}
                  </p>
                </div>
                <p className="max-w-[550px] text-muted-foreground text-lg leading-relaxed">
                  {userIntro}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/projects"
                    className="btn-primary"
                  >
                    View Projects
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="btn-secondary"
                  >
                    Get in Touch
                  </Link>
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-4 pt-4">
                  {user?.SocialLink?.map((link) => {
                    const getIcon = (platform: string, customIcon?: string) => {
                      if (customIcon) {
                        return <span className="text-lg">{customIcon}</span>;
                      }
                      switch (platform.toLowerCase()) {
                        case 'github': return <FiGithub className="h-5 w-5" />;
                        case 'linkedin': return <FiLinkedin className="h-5 w-5" />;
                        case 'twitter':
                        case 'x': return <FiTwitter className="h-5 w-5" />;
                        case 'instagram': return <FiInstagram className="h-5 w-5" />;
                        case 'youtube': return <FiYoutube className="h-5 w-5" />;
                        case 'email':
                        case 'mail': return <FiMail className="h-5 w-5" />;
                        case 'website':
                        case 'portfolio': return <FiGlobe className="h-5 w-5" />;
                        case 'discord':
                        case 'slack': return <FiMessageSquare className="h-5 w-5" />;
                        default: return <FiExternalLink className="h-5 w-5" />;
                      }
                    };

                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                        title={link.platform}
                      >
                        {getIcon(link.platform, link.icon || undefined)}
                        <span className="sr-only">{link.platform}</span>
                      </a>
                    );
                  })}

                  {(!user?.SocialLink || user.SocialLink.length === 0) && (
                    <>
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <FiGithub className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <FiLinkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <FiTwitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Right Content - Profile Image */}
              <div className="flex items-center justify-center lg:justify-end animate-fade-in">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-60" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl" />
                  
                  <div className="relative w-full max-w-[380px]">
                    {user?.profileImage ? (
                      <div className="transform transition duration-500 hover:scale-[1.02]">
                        <ProfileImage
                          src={user.profileImage}
                          alt={userName}
                          size="xl"
                          style="elegant"
                          objectFit="cover"
                          className="w-full shadow-2xl rounded-2xl"
                          responsive
                        />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 aspect-square flex items-center justify-center rounded-2xl border-2 border-primary/20 shadow-xl">
                        <span className="text-6xl font-extrabold gradient-text">{initials}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Quick Info Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                  {featuredProjects?.length || 0}+
                </div>
                <p className="text-muted-foreground text-sm mt-1">Projects Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                  {certifications?.length || 0}+
                </div>
                <p className="text-muted-foreground text-sm mt-1">Certifications</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                  {languages?.length || 0}+
                </div>
                <p className="text-muted-foreground text-sm mt-1">Languages Spoken</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                  100%
                </div>
                <p className="text-muted-foreground text-sm mt-1">Commitment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="section">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Featured Projects</h2>
              <p className="section-subtitle">A selection of my recent work and personal projects</p>
            </div>
            
            <div className="flex justify-end mb-8">
              <Link href="/projects" className="btn-secondary">
                View All Projects
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project, index) => (
                  <article 
                    key={project.id} 
                    className="card group"
                  >
                    {/* Cover Image */}
                    <div className="aspect-video overflow-hidden rounded-lg mb-4">
                      {project.coverImage ? (
                        <OptimizedImage
                          src={project.coverImage}
                          alt={project.title}
                          width={400}
                          height={225}
                          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                          priority={project.featured}
                          objectFit="cover"
                        />
                      ) : (
                        <div className="bg-muted h-full w-full flex items-center justify-center">
                          <FiCode className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <FiAward className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {project.shortDesc || project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.technologies?.slice(0, 3).map((tech: string) => (
                          <span 
                            key={tech} 
                            className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <FiGithub className="h-4 w-4" />
                            Code
                          </a>
                        )}
                        {project.demoLink && (
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <FiExternalLink className="h-4 w-4" />
                            Live Demo
                          </a>
                        )}
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ml-auto"
                        >
                          View Details
                          <FiArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <article key={i} className="card">
                    <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-muted flex items-center justify-center">
                      <FiCode className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">Project {i + 1}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        A sample project description. Add your projects through the admin panel.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">React</span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">TypeScript</span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      {languages && languages.length > 0 && (
        <section className="section bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="section-title">Languages</h2>
                <p className="section-subtitle">Communication is key to collaboration</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {languages.map((language) => (
                  <div key={language.id} className="card text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                      <span className="text-2xl font-bold gradient-text">
                        {language.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{language.name}</h3>
                    <p className="text-muted-foreground text-sm">{language.proficiency}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <section className="section">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="section-title">Certifications</h2>
                <p className="section-subtitle">Professional development and continuous learning</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certifications.slice(0, 6).map((cert) => (
                  <div key={cert.id} className="card flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                      <FiAward className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.organization}</p>
                      <p className="text-xs text-muted-foreground">{cert.year}</p>
                    </div>
                  </div>
                ))}
              </div>
              {certifications.length > 6 && (
                <div className="text-center mt-8">
                  <Link href="/certifications" className="btn-secondary">
                    View All Certifications
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let&apos;s Work Together
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                <FiMail className="h-5 w-5" />
                Get in Touch
              </Link>
              <Link href="/cv" className="btn-secondary">
                <FiDownload className="h-5 w-5" />
                Download CV
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
