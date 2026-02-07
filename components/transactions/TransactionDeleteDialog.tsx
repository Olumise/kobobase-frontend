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
import { TransactionDetail } from "@/lib/types/transaction";
import { transactionsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TransactionDeleteDialogProps {
  transaction: TransactionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function TransactionDeleteDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
}: TransactionDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setIsDeleting(true);
      setError(null);
      await transactionsApi.deleteTransaction(transaction.id);
      onConfirm(); // Refresh parent data
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      setError(err.response?.data?.error || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {transaction && (
          <div className="my-4 p-4 bg-muted rounded-md">
            <p className="font-medium text-foreground">{transaction.description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(transaction.amount, transaction.currency)} • {formatDate(transaction.transactionDate)}
            </p>
            {transaction.category && (
              <p className="text-xs text-muted-foreground mt-1">
                Category: {transaction.category.name}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
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
