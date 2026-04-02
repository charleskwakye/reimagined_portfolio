'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { FiMenu, FiX, FiDownload } from 'react-icons/fi';

const navItems = [
  { name: 'nav.home', path: '/' },
  { name: 'nav.about', path: '/about' },
  { name: 'nav.projects', path: '/projects' },
  { name: 'nav.internship', path: '/internship' },
  { name: 'nav.contact', path: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container px-6 md:px-8 flex h-12 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {t('footer.portfolio') || 'Charles Kwakye'}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'nav-pill',
                pathname === item.path ? 'nav-pill-active' : 'nav-pill-inactive'
              )}
            >
              {t(item.name)}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/cv"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary text-xs font-medium text-primary-foreground transition-opacity hover:opacity-85"
          >
            <FiDownload className="h-3 w-3" />
            {t('nav.cv')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cv"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
            title={t('nav.cv')}
          >
            <FiDownload className="h-3.5 w-3.5" />
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-8 w-8 items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container px-6 py-4 flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'nav-pill w-full justify-start',
                  pathname === item.path ? 'nav-pill-active' : 'nav-pill-inactive'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item.name)}
              </Link>
            ))}
            <Link
              href="/cv"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-primary text-xs font-medium text-primary-foreground mt-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiDownload className="h-3 w-3" />
              {t('nav.cv')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 