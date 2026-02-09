'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { BankAccount } from '@/lib/types/bankAccount';
import { bankAccountsApi } from '@/lib/api';
import { BankAccountCard } from '@/components/bank-accounts/BankAccountCard';
import { BankAccountFormModal } from '@/components/bank-accounts/BankAccountFormModal';
import { BankAccountDeleteDialog } from '@/components/bank-accounts/BankAccountDeleteDialog';
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

export default function AccountsSettingsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setPrimaryDialogOpen, setSetPrimaryDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bankAccountsApi.getUserBankAccounts(true);
      const accountsData = response.data?.data?.accounts || response.data?.accounts || [];
      setAccounts(accountsData);
    } catch (err: any) {
      console.error('Error fetching bank accounts:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setFormModalOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormModalOpen(true);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleSetPrimaryAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setSetPrimaryDialogOpen(true);
  };

  const confirmSetPrimary = async () => {
    if (!selectedAccount) return;

    try {
      setIsSettingPrimary(true);
      await bankAccountsApi.setPrimaryAccount(selectedAccount.id);
      await fetchAccounts();
      setSetPrimaryDialogOpen(false);
      setSelectedAccount(null);
    } catch (err: any) {
      console.error('Error setting primary account:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to set primary account');
    } finally {
      setIsSettingPrimary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bank accounts...</p>
        </div>
      </div>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Accounts</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchAccounts}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-foreground">Bank Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your bank accounts and set a primary account for transactions
          </p>
        </div>
        <button
          onClick={handleAddAccount}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Add Bank Account
        </button>
      </div>

      {error && accounts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-md p-3">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No bank accounts yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first bank account to get started with transaction tracking
          </p>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
              onSetPrimary={handleSetPrimaryAccount}
            />
          ))}
        </div>
      )}

      <BankAccountFormModal
        account={selectedAccount}
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSave={fetchAccounts}
      />

      <BankAccountDeleteDialog
        account={selectedAccount}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={fetchAccounts}
      />

      <AlertDialog open={setPrimaryDialogOpen} onOpenChange={setSetPrimaryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set Primary Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Set this account as your primary account?</p>
              {selectedAccount && (
                <div className="bg-muted p-3 rounded-md mt-4 space-y-1">
                  <p className="font-medium text-foreground">{selectedAccount.accountName}</p>
                  <p className="text-sm">{selectedAccount.bankName}</p>
                </div>
              )}
              <p className="text-muted-foreground text-sm mt-2">
                Your current primary account will be automatically changed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSettingPrimary}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmSetPrimary();
              }}
              disabled={isSettingPrimary}
            >
              {isSettingPrimary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting...
                </>
              ) : (
                'Set as Primary'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
