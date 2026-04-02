'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiBriefcase, FiDownload } from 'react-icons/fi';

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled 
        ? 'border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm' 
        : 'border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm">CK</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-medium text-xs text-muted-foreground mr-1">Charles</span>
              <span className="font-bold text-lg">Kwakye</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'relative text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg',
                pathname === item.path
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {t(item.name)}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/cv"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <FiDownload className="h-4 w-4" />
            {t('nav.cv')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Tablet & Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/cv"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title={t('nav.cv')}
          >
            <FiDownload className="h-4 w-4" />
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FiX className="h-4 w-4" />
            ) : (
              <FiMenu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'text-sm font-medium transition-all duration-200 px-3 py-3 rounded-lg',
                  pathname === item.path
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item.name)}
              </Link>
            ))}
            <Link
              href="/cv"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-sm font-medium text-white shadow-md mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiDownload className="h-4 w-4" />
              {t('nav.cv')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 