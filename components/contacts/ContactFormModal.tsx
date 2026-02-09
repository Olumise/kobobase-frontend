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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Contact, ContactType } from '@/lib/types/contact';
import { Category } from '@/lib/types/category';
import { contactsApi } from '@/lib/api';
import { Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  contactType: z.enum([
    ContactType.PERSON,
    ContactType.MERCHANT,
    ContactType.BANK,
    ContactType.PLATFORM,
    ContactType.WALLET,
    ContactType.SYSTEM,
  ] as const),
  categoryId: z.string().optional(),
  bankName: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  contact: Contact | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function ContactFormModal({
  contact,
  categories,
  open,
  onOpenChange,
  onSave,
}: ContactFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!contact;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      contactType: ContactType.PERSON,
      categoryId: '',
      bankName: '',
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (contact && open) {
      form.reset({
        name: contact.name,
        contactType: contact.ContactType,
        categoryId: contact.categoryId || '',
        bankName: '',
        description: '',
        notes: contact.notes || '',
      });
    } else if (!contact && open) {
      form.reset({
        name: '',
        contactType: ContactType.PERSON,
        categoryId: '',
        bankName: '',
        description: '',
        notes: '',
      });
    }
  }, [contact, open, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (isEditMode && contact) {
        await contactsApi.updateContact(contact.id, {
          name: data.name,
          contactType: data.contactType,
          categoryId: data.categoryId || undefined,
          notes: data.notes || undefined,
        });
      } else {
        await contactsApi.createContact({
          name: data.name,
          contactType: data.contactType,
          categoryId: data.categoryId || undefined,
          bankName: data.bankName || undefined,
          description: data.description || undefined,
          notes: data.notes || undefined,
        });
      }

      onSave();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error saving contact:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update contact details below' : 'Enter contact details below'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
                <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ContactType.PERSON}>Person</SelectItem>
                        <SelectItem value={ContactType.MERCHANT}>Merchant</SelectItem>
                        <SelectItem value={ContactType.BANK}>Bank</SelectItem>
                        <SelectItem value={ContactType.PLATFORM}>Platform</SelectItem>
                        <SelectItem value={ContactType.WALLET}>Wallet</SelectItem>
                        <SelectItem value={ContactType.SYSTEM}>System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Category (optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon && <span className="mr-2">{cat.icon}</span>}
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEditMode && (
              <>
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="GTBank"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this contact..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Contact'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
