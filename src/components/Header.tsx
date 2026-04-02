'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiDownload, FiTerminal } from 'react-icons/fi';

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
      'sticky top-0 z-50 w-full transition-all duration-500',
      scrolled 
        ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl' 
        : 'border-b border-border/30 bg-background/50 backdrop-blur-md'
    )}>
      <div className="container px-6 md:px-12 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FiTerminal className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-bold text-lg tracking-tight">Charles<span className="text-primary">.</span></span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg relative',
                pathname === item.path
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {t(item.name)}
              {pathname === item.path && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/cv"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/20 hover:border-primary/30"
          >
            <FiDownload className="h-3.5 w-3.5" />
            {t('nav.cv')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/cv"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary"
            title={t('nav.cv')}
          >
            <FiDownload className="h-4 w-4" />
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container px-6 py-6 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'text-sm font-medium py-3 px-4 rounded-lg transition-colors',
                  pathname === item.path ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item.name)}
              </Link>
            ))}
            <Link
              href="/cv"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-primary mt-4"
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