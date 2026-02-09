
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Profile', href: '/settings/profile' },
  { name: 'Categories', href: '/settings/categories' },
  { name: 'Contacts', href: '/settings/contacts' },
  { name: 'Bank Accounts', href: '/settings/accounts' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application preferences and data</p>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "py-4 px-1 border-b-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="py-2">
        {children}
      </div>
    </div>
  );
}
