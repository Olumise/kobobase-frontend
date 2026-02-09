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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BankAccount, AccountType } from "@/lib/types/bankAccount";
import { bankAccountsApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

const bankAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(4, "Account number must be at least 4 characters"),
  accountType: z.enum([
    AccountType.SAVINGS,
    AccountType.CURRENT,
    AccountType.WALLET,
    AccountType.CARD,
    AccountType.OTHER,
  ] as const),
  currency: z.string().length(3, "Currency code must be 3 letters"),
  nickname: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormModalProps {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function BankAccountFormModal({
  account,
  open,
  onOpenChange,
  onSave,
}: BankAccountFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!account;

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: AccountType.SAVINGS,
      currency: 'NGN',
      nickname: '',
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (account && open) {
      form.reset({
        accountName: account.accountName,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        nickname: account.nickname || '',
        isPrimary: account.isPrimary,
      });
    } else if (!account && open) {
      form.reset({
        accountName: '',
        bankName: '',
        accountNumber: '',
        accountType: AccountType.SAVINGS,
        currency: 'NGN',
        nickname: '',
        isPrimary: false,
      });
    }
  }, [account, open, form]);

  const onSubmit = async (data: BankAccountFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (isEditMode && account) {
        await bankAccountsApi.updateBankAccount(account.id, {
          accountName: data.accountName,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
          currency: data.currency,
          nickname: data.nickname || undefined,
        });
      } else {
        await bankAccountsApi.createBankAccount({
          accountName: data.accountName,
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
          currency: data.currency,
          nickname: data.nickname || undefined,
          isPrimary: data.isPrimary,
        });
      }

      onSave();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error saving bank account:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save bank account');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update bank account details below' : 'Enter bank account details below'}
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
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name *</FormLabel>
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

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
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
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AccountType.SAVINGS}>Savings</SelectItem>
                        <SelectItem value={AccountType.CURRENT}>Current</SelectItem>
                        <SelectItem value={AccountType.WALLET}>Wallet</SelectItem>
                        <SelectItem value={AccountType.CARD}>Card</SelectItem>
                        <SelectItem value={AccountType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="NGN"
                        className="h-11"
                        maxLength={3}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Savings Account"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Set as primary account
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This will be your default account for transactions
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

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
                  isEditMode ? 'Save Changes' : 'Add Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
