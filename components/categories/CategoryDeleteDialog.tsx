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
import { Category } from '@/lib/types/category';
import { categoriesApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface CategoryDeleteDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function CategoryDeleteDialog({
  category,
  open,
  onOpenChange,
  onDelete,
}: CategoryDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!category) return;

    if (category.isSystemCategory) {
      setError('Cannot delete system categories');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await categoriesApi.deleteCategory(category.id);
      onDelete();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!category) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {category.isSystemCategory ? (
              <p className="text-rose-600 dark:text-rose-400 font-medium">
                System categories cannot be deleted.
              </p>
            ) : (
              <>
                <p>Are you sure you want to delete this category?</p>
                <div className="bg-muted p-3 rounded-md mt-4 flex items-center gap-3">
                  {category.icon && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: category.color || '#6b7280' }}
                    >
                      {category.icon}
                    </div>
                  )}
                  <p className="font-medium text-foreground">{category.name}</p>
                </div>
                <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-2">
                  ⚠️ Warning: Transactions using this category may be affected.
                </p>
                {error && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-2 mt-2">
                    <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                  </div>
                )}
                <p className="text-muted-foreground text-sm mt-2">
                  This action cannot be undone.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {category.isSystemCategory ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {!category.isSystemCategory && (
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
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
