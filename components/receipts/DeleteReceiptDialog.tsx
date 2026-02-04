'use client';

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
import { AlertTriangle } from "lucide-react";

interface DeleteReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transactionCount: number;
  isDeleting: boolean;
}

export function DeleteReceiptDialog({
  isOpen,
  onClose,
  onConfirm,
  transactionCount,
  isDeleting,
}: DeleteReceiptDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Receipt</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Are you sure you want to delete this receipt? This action cannot be undone.
            </p>
            {transactionCount > 0 && (
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="font-medium text-destructive">
                  Warning: This will also delete {transactionCount} associated transaction{transactionCount !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Receipt'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
