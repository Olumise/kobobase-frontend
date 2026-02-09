'use client';

import { useState } from 'react';
import { BankAccount, AccountType } from '@/lib/types/bankAccount';
import { MoreVertical, Pencil, Trash2, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface BankAccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onSetPrimary: (account: BankAccount) => void;
}

const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return `****${lastFour}`;
};

export function BankAccountCard({ account, onEdit, onDelete, onSetPrimary }: BankAccountCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const accountTypeLabels = {
    [AccountType.SAVINGS]: 'Savings',
    [AccountType.CURRENT]: 'Current',
    [AccountType.WALLET]: 'Wallet',
    [AccountType.CARD]: 'Card',
    [AccountType.OTHER]: 'Other',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-lg">
              {account.accountName}
            </h3>
            {account.isPrimary && (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                <Star size={12} className="mr-1" fill="currentColor" />
                Primary
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{account.bankName}</p>
        </div>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Pencil size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            {!account.isPrimary && (
              <DropdownMenuItem onClick={() => onSetPrimary(account)}>
                <Star size={16} className="mr-2" />
                Set as Primary
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(account)}
              className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Account Number</span>
          <span className="text-sm font-mono font-medium text-foreground">
            {maskAccountNumber(account.accountNumber)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Type</span>
          <Badge variant="outline" className="text-xs">
            {accountTypeLabels[account.accountType] || account.accountType}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Currency</span>
          <span className="text-sm font-medium text-foreground">{account.currency}</span>
        </div>
        {account.nickname && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Nickname</span>
            <span className="text-sm text-foreground">{account.nickname}</span>
          </div>
        )}
      </div>
    </div>
  );
}
