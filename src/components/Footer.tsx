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
    <footer className="border-t border-border">
      <div className="container px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
                  <span className="text-primary-foreground font-serif text-sm font-bold">CK</span>
                </div>
                <span className="font-serif text-lg">Charles Kwakye</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t('footer.portfolio_desc')}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">Navigation</h3>
              <ul className="space-y-3">
                {[
                  { label: t('nav.home'), href: '/' },
                  { label: t('nav.about'), href: '/about' },
                  { label: t('nav.projects'), href: '/projects' },
                  { label: t('nav.internship'), href: '/internship' },
                  { label: t('nav.contact'), href: '/contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {links.map((link) => {
                  const IconComponent = iconMap[link.platform.toLowerCase()] || FiGlobe;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      aria-label={link.platform}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground tracking-wide">
              &copy; {year || '2024'} Charles Kwakye. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors tracking-wide uppercase"
              aria-label="Scroll to top"
            >
              Back to top
              <FiArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
} 