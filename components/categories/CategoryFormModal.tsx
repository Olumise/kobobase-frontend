'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category } from '@/lib/types/category';
import { categoriesApi } from '@/lib/api';
import { Loader2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format (use #RRGGBB)").optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function CategoryFormModal({
  category,
  open,
  onOpenChange,
  onSave,
}: CategoryFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '#6b7280',
    },
  });

  useEffect(() => {
    if (category && open) {
      form.reset({
        name: category.name,
        icon: category.icon || '',
        color: category.color || '#6b7280',
      });
    } else if (!category && open) {
      form.reset({
        name: '',
        icon: '',
        color: '#6b7280',
      });
    }
  }, [category, open, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (isEditMode && category) {
        if (category.isSystemCategory) {
          setError('Cannot edit system categories');
          return;
        }
        await categoriesApi.updateCategory(category.id, {
          name: data.name,
          icon: data.icon || undefined,
          color: data.color || undefined,
        });
      } else {
        await categoriesApi.createCategory({
          name: data.name,
          icon: data.icon || undefined,
          color: data.color || undefined,
        });
      }

      onSave();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update category details below' : 'Create a new custom category'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
                <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            )}

            {category?.isSystemCategory && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  System categories cannot be edited
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Groceries, Entertainment"
                      className="h-11"
                      disabled={category?.isSystemCategory}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 🍔, 🎬, 🏠"
                      className="h-11"
                      disabled={category?.isSystemCategory}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use an emoji or leave empty
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-3 items-center">
                    <FormControl>
                      <input
                        type="color"
                        className="h-11 w-20 rounded-md border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={category?.isSystemCategory}
                        {...field}
                      />
                    </FormControl>
                    <Input
                      placeholder="#6b7280"
                      className="h-11 flex-1 font-mono text-sm"
                      disabled={category?.isSystemCategory}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (value.startsWith('#') || value === '') {
                          field.onChange(value);
                        } else {
                          field.onChange('#' + value);
                        }
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || category?.isSystemCategory}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
