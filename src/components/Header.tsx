'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
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
        ? 'border-b border-border bg-background/90 backdrop-blur-md' 
        : 'border-b border-border'
    )}>
      <div className="container px-6 md:px-12 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
            <span className="text-primary-foreground font-serif text-sm font-bold">CK</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-lg">Charles Kwakye</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'text-sm tracking-wide transition-colors duration-200 relative py-1',
                pathname === item.path
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(item.name)}
              {pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-px bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/cv"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-sm bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary"
            title={t('nav.cv')}
          >
            <FiDownload className="h-4 w-4" />
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container px-6 py-6 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'text-sm tracking-wide py-3 border-b border-border/50',
                  pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item.name)}
              </Link>
            ))}
            <Link
              href="/cv"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-sm bg-primary text-sm font-medium text-primary-foreground mt-2"
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