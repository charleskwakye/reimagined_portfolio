'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Profile', path: '/admin/profile' },
  { name: 'About', path: '/admin/about' },
  { name: 'Tools', path: '/admin/tools' },
  { name: 'Experience', path: '/admin/experience' },
  { name: 'Education', path: '/admin/education' },
  { name: 'Certifications', path: '/admin/certifications' },
  { name: 'Projects', path: '/admin/projects' },
  { name: 'Internship', path: '/admin/internship' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if the current page is the login page
  const isLoginPage = pathname === '/admin/login';

  // If it's the login page, only render the children without admin layout
  if (isLoginPage) {
    return children;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/admin" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Admin Dashboard</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogout} size="sm" className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to Site
            </Link>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="flex flex-col space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    pathname === item.path ? 'bg-accent text-accent-foreground' : 'transparent'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 