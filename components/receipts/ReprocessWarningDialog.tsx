'use client';

import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReprocessWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionCount: number;
  isProcessing?: boolean;
}

export function ReprocessWarningDialog({
  isOpen,
  onClose,
  onConfirm,
  transactionCount,
  isProcessing = false,
}: ReprocessWarningDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive" size={20} />
            Delete Existing Transactions?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>
              This receipt has already been processed with{' '}
              <strong className="text-foreground">
                {transactionCount} approved transaction{transactionCount !== 1 ? 's' : ''}
              </strong>
              .
            </p>
            <p>
              Re-processing will{' '}
              <strong className="text-destructive">permanently delete all existing transactions</strong>{' '}
              and start fresh with new AI extraction.
            </p>
            <p className="text-xs">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Continue & Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
