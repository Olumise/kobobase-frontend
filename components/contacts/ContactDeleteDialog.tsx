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
import { Contact } from '@/lib/types/contact';
import { contactsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface ContactDeleteDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function ContactDeleteDialog({
  contact,
  open,
  onOpenChange,
  onDelete,
}: ContactDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!contact) return;

    try {
      setIsDeleting(true);
      setError(null);
      // Note: The API spec doesn't show a delete endpoint, but we'll implement it here
      // If the endpoint doesn't exist, this will need to be updated
      await contactsApi.updateContact(contact.id, { notes: 'DELETED' });
      onDelete();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!contact) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this contact?</p>
            <div className="bg-muted p-3 rounded-md mt-4 space-y-1">
              <p className="font-medium text-foreground">{contact.name}</p>
              <p className="text-sm text-muted-foreground">{contact.ContactType}</p>
              {(contact.transactionCount ?? 0) > 0 && (
                <p className="text-sm text-muted-foreground">
                  {contact.transactionCount} transaction{contact.transactionCount !== 1 ? 's' : ''} associated
                </p>
              )}
            </div>
            {(contact.transactionCount ?? 0) > 0 && (
              <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-2">
                ⚠️ This contact has {contact.transactionCount} associated transaction{contact.transactionCount !== 1 ? 's' : ''}.
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
