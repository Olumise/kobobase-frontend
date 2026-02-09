'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TransactionDetail, UpdateTransactionPayload } from "@/lib/types/transaction";
import { transactionsApi } from "@/lib/api";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  transactionDate: z.string(),
  transactionType: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().optional(),
  contactId: z.string().optional(),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELLED']),
  paymentMethod: z.string().optional(),
  summary: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionEditModalProps {
  transaction: TransactionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  categories: any[];
  contacts: any[];
}

export function TransactionEditModal({
  transaction,
  open,
  onOpenChange,
  onSave,
  categories,
  contacts,
}: TransactionEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'EXPENSE',
      categoryId: '',
      contactId: '',
      status: 'PENDING',
      paymentMethod: '',
      summary: '',
    },
  });

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction && open) {
      form.reset({
        amount: transaction.amount,
        description: transaction.description || '',
        transactionDate: transaction.transactionDate.split('T')[0],
        transactionType: transaction.transactionType,
        categoryId: transaction.categoryId || '',
        contactId: transaction.contactId || '',
        status: transaction.status,
        paymentMethod: transaction.paymentMethod || '',
        summary: transaction.summary || '',
      });
    }
  }, [transaction, open, form]);

  const onSubmit = async (data: TransactionFormData) => {
    if (!transaction) return;

    try {
      setIsSaving(true);
      setError(null);

      const payload: UpdateTransactionPayload = {
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
        transactionType: data.transactionType,
        categoryId: data.categoryId || undefined,
        contactId: data.contactId || undefined,
        status: data.status,
        paymentMethod: data.paymentMethod || undefined,
        summary: data.summary || undefined,
      };

      await transactionsApi.updateTransaction(transaction.id, payload);
      onSave(); // Refresh parent data
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      setError(err.response?.data?.error || 'Failed to update transaction');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details below
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
                <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-11"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[120px] w-full resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString().split('T')[0] : '');
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
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
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {contacts?.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
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
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
