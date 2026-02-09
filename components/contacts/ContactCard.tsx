'use client';

import { useState } from 'react';
import { Contact, ContactType } from '@/lib/types/contact';
import { MoreVertical, Pencil, Trash2, User, Building2, Landmark, Zap, Store, Wallet, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

const contactTypeIcons = {
  [ContactType.PERSON]: User,
  [ContactType.MERCHANT]: Store,
  [ContactType.BANK]: Building2,
  [ContactType.PLATFORM]: Landmark,
  [ContactType.WALLET]: Wallet,
  [ContactType.SYSTEM]: Settings,
};

const contactTypeColors = {
  [ContactType.PERSON]: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  [ContactType.MERCHANT]: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  [ContactType.BANK]: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  [ContactType.PLATFORM]: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  [ContactType.WALLET]: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  [ContactType.SYSTEM]: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400',
};

const contactTypeLabels = {
  [ContactType.PERSON]: 'Person',
  [ContactType.MERCHANT]: 'Merchant',
  [ContactType.BANK]: 'Bank',
  [ContactType.PLATFORM]: 'Platform',
  [ContactType.WALLET]: 'Wallet',
  [ContactType.SYSTEM]: 'System',
};

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const Icon = contact.ContactType ? (contactTypeIcons[contact.ContactType] || User) : User;
  const colorClass = contact.ContactType ? (contactTypeColors[contact.ContactType] || 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400') : 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base truncate mb-1">
              {contact.name}
            </h3>
            {contact.ContactType && (
              <Badge variant="outline" className="text-xs">
                {contactTypeLabels[contact.ContactType] || contact.ContactType}
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted flex-shrink-0">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(contact)}>
              <Pencil size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(contact)}
              className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        {contact.defaultCategory && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: contact.defaultCategory.color ? `${contact.defaultCategory.color}15` : undefined,
                borderColor: contact.defaultCategory.color ? `${contact.defaultCategory.color}40` : undefined,
                color: contact.defaultCategory.color || undefined,
              }}
            >
              {contact.defaultCategory.icon && <span className="mr-1">{contact.defaultCategory.icon}</span>}
              {contact.defaultCategory.name}
            </Badge>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Transactions</span>
          <span className="font-medium text-foreground">{contact.transactionCount || 0}</span>
        </div>
        {contact.lastTransactionDate && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last transaction</span>
            <span className="text-foreground">
              {format(new Date(contact.lastTransactionDate), 'MMM d, yyyy')}
            </span>
          </div>
        )}
        {contact.notes && (
          <div className="pt-2 mt-2 border-t border-border">
            <p className="text-xs text-muted-foreground line-clamp-2">{contact.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
