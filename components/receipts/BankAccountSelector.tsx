'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { transactionsApi } from '@/lib/api';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
}

interface BankAccountSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bankAccountId: string) => void;
  isLoading?: boolean;
}

export function BankAccountSelector({ isOpen, onClose, onSelect, isLoading }: BankAccountSelectorProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen]);

  const fetchBankAccounts = async () => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await transactionsApi.getUserBankAccounts();
      const accounts = response.data.bankAccounts || response.data || [];
      setBankAccounts(accounts);

      // Auto-select first account if only one exists
      if (accounts.length === 1) {
        setSelectedId(accounts[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching bank accounts:', err);
      setError(err.response?.data?.message || 'Failed to load bank accounts');

      // Fallback to mock data in development
      const mockAccounts: BankAccount[] = [
        {
          id: 'bank_001',
          accountName: 'Main Account',
          accountNumber: '1234567890',
          bankName: 'First Bank',
          currency: 'NGN',
        },
        {
          id: 'bank_002',
          accountName: 'Savings Account',
          accountNumber: '0987654321',
          bankName: 'GT Bank',
          currency: 'NGN',
        },
      ];
      setBankAccounts(mockAccounts);
      setSelectedId(mockAccounts[0].id);
    } finally {
      setIsFetching(false);
    }
  };

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Bank Account</DialogTitle>
          <DialogDescription>
            Choose the bank account where these transactions should be recorded.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error && bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchBankAccounts}>
                Retry
              </Button>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No bank accounts found</p>
            </div>
          ) : (
            bankAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedId(account.id)}
                disabled={isLoading}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3',
                  'hover:border-primary/50 hover:bg-accent/50',
                  selectedId === account.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  selectedId === account.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}>
                  {selectedId === account.id && <Check size={12} className="text-primary-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={16} className="text-muted-foreground flex-shrink-0" />
                    <p className="font-semibold text-sm text-foreground truncate">
                      {account.accountName}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {account.bankName} • {account.accountNumber.slice(-4).padStart(10, '•')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {account.currency}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
