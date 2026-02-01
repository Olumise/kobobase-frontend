
'use client';

import { Bell, Search, User } from 'lucide-react';
import { sampleUser } from '@/lib/mockData';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/receipts')) return 'Receipts Management';
    if (path.startsWith('/transactions')) return 'Transaction Processing';
    if (path.startsWith('/analytics')) return 'Analytics & Reports';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-background/80 backdrop-blur-md border-b border-border px-6 flex items-center justify-between">
      {/* Page Title (Desktop) */}
      <div className="hidden lg:flex items-center">
        <h1 className="text-xl font-semibold text-foreground">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Spacer for mobile menu button alignment */}
      <div className="lg:hidden w-10"></div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-9 w-64 rounded-full border border-input bg-muted/50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">{sampleUser.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{sampleUser.email}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-primary/20">
            {sampleUser.name.charAt(0)}
            {sampleUser.name.split(' ')[1]?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
