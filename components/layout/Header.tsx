
'use client';

import { Bell, Search, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { sampleUser } from '@/lib/mockData';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions..."
            className="h-9 w-64 rounded-full pl-9 bg-muted/50 border-input focus:bg-background transition-all"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-destructive border-2 border-background rounded-full" />
        </Button>

        {/* User Profile Dropdown */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-none">{sampleUser.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{sampleUser.email}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {sampleUser.name.charAt(0)}
                    {sampleUser.name.split(' ')[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{sampleUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {sampleUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
