'use client';

import Link from 'next/link';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiGlobe, FiInstagram, FiFacebook, FiArrowUp } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  github: FiGithub,
  linkedin: FiLinkedin,
  twitter: FiTwitter,
  email: FiMail,
  website: FiGlobe,
  instagram: FiInstagram,
  facebook: FiFacebook,
};

export function Footer() {
  const [year, setYear] = useState<number>();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    setYear(new Date().getFullYear());

    const fetchSocialLinks = async () => {
      try {
        const response = await fetch('/api/social-links');
        if (response.ok) {
          const data = await response.json();
          setSocialLinks(data.socialLinks || []);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };

    fetchSocialLinks();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const links = socialLinks.length > 0 ? socialLinks : [
    { id: '1', platform: 'github', url: 'https://github.com' },
    { id: '2', platform: 'linkedin', url: 'https://linkedin.com' },
    { id: '3', platform: 'twitter', url: 'https://twitter.com' },
    { id: '4', platform: 'email', url: 'mailto:hello@charleskwakye.dev' },
  ];

  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CK</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium text-xs text-muted-foreground mr-1">Charles</span>
                <span className="font-bold text-lg">Kwakye</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.portfolio_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('nav.home'), href: '/' },
                { label: t('nav.about'), href: '/about' },
                { label: t('nav.projects'), href: '/projects' },
                { label: t('nav.internship'), href: '/internship' },
                { label: t('nav.contact'), href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Connect */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t('footer.connect')}
            </h3>
            <div className="flex flex-wrap gap-3">
              {links.map((link) => {
                const IconComponent = iconMap[link.platform.toLowerCase()] || FiGlobe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-accent transition-all duration-200"
                    aria-label={link.platform}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {year || '2024'} Charles Kwakye. {t('footer.rights')}
          </p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
            aria-label="Scroll to top"
          >
            <FiArrowUp className="h-4 w-4" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
} 