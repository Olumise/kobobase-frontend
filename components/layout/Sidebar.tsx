
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Receipts', href: '/receipts', icon: Receipt },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Settings', href: '/settings/categories', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  // Mobile toggle
  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  // Close on mobile navigation
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/details' && pathname.includes('/details')) return true;
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button 
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background shadow-md border-border"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <div className="bg-primary/20 p-2 rounded-lg mr-3">
               <Receipt className="text-primary w-6 h-6" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              KoboBase
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "relative flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-colors group",
                    active 
                      ? "text-primary-foreground bg-primary" 
                      : "text-muted-foreground hover:text-primary-foreground hover:bg-primary"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 mr-3", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-primary-foreground hover:bg-primary"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
