'use client';

import Link from 'next/link';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiGlobe, FiInstagram, FiFacebook } from 'react-icons/fi';
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

  const links = socialLinks.length > 0 ? socialLinks : [
    { id: '1', platform: 'github', url: 'https://github.com' },
    { id: '2', platform: 'linkedin', url: 'https://linkedin.com' },
    { id: '3', platform: 'twitter', url: 'https://twitter.com' },
    { id: '4', platform: 'email', url: 'mailto:hello@charleskwakye.dev' },
  ];

  return (
    <footer className="border-t border-border/50">
      <div className="container px-6 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold mb-3">{t('footer.portfolio') || 'Charles Kwakye'}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('footer.portfolio_desc')}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Navigation</h3>
              <ul className="space-y-2.5">
                {[
                  { label: t('nav.home'), href: '/' },
                  { label: t('nav.about'), href: '/about' },
                  { label: t('nav.projects'), href: '/projects' },
                  { label: t('nav.contact'), href: '/contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div className="col-span-2 md:col-span-2">
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {links.map((link) => {
                  const IconComponent = iconMap[link.platform.toLowerCase()] || FiGlobe;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
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
          <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Copyright &copy; {year || '2024'} {t('footer.portfolio') || 'Charles Kwakye'}. {t('footer.rights')}
            </p>
            <p className="text-xs text-muted-foreground">
              Designed & built with care
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 