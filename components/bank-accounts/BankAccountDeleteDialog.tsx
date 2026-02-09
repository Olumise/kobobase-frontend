'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BankAccount } from '@/lib/types/bankAccount';
import { bankAccountsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface BankAccountDeleteDialogProps {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function BankAccountDeleteDialog({
  account,
  open,
  onOpenChange,
  onDelete,
}: BankAccountDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!account) return;

    try {
      setIsDeleting(true);
      setError(null);
      await bankAccountsApi.deleteBankAccount(account.id);
      onDelete();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error deleting bank account:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete bank account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!account) return null;

  const maskAccountNumber = (accountNumber: string): string => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `****${lastFour}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this bank account?</p>
            <div className="bg-muted p-3 rounded-md mt-4 space-y-1">
              <p className="font-medium text-foreground">{account.accountName}</p>
              <p className="text-sm">{account.bankName}</p>
              <p className="text-sm font-mono">{maskAccountNumber(account.accountNumber)}</p>
            </div>
            {account.isPrimary && (
              <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-2">
                ⚠️ This is your primary account. You may want to set another account as primary first.
              </p>
            )}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-2 mt-2">
                <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            )}
            <p className="text-muted-foreground text-sm mt-2">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
