'use client';

import Link from 'next/link';
import { TransactionDetail } from '@/lib/types/transaction';
import { TransactionResultItem } from './TransactionResultItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GlobalSearchResultsProps {
  query: string;
  results: TransactionDetail[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  onResultClick: (transaction: TransactionDetail) => void;
  onRetry: () => void;
}

export function GlobalSearchResults({
  query,
  results,
  loading,
  error,
  totalCount,
  onResultClick,
  onRetry,
}: GlobalSearchResultsProps) {
  // Loading state
  if (loading) {
    return (
      <div className="w-full space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && query.length >= 3) {
    return (
      <div className="w-full p-8 text-center">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">
          No transactions found
        </p>
        <p className="text-xs text-muted-foreground">
          No results for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  // Prompt to type more characters
  if (query.length < 3) {
    return (
      <div className="w-full p-8 text-center">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Type at least 3 characters to search
        </p>
      </div>
    );
  }

  // Group results by transaction type
  const income = results.filter(txn => txn.transactionType === 'INCOME');
  const expense = results.filter(txn => txn.transactionType === 'EXPENSE');
  const transfer = results.filter(txn => txn.transactionType === 'TRANSFER');

  return (
    <div className="w-full max-h-[400px] overflow-y-auto">
      <div className="p-2 space-y-1">
        {/* Income Section */}
        {income.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 py-2">
              Income
            </p>
            {income.map((txn) => (
              <TransactionResultItem
                key={txn.id}
                transaction={txn}
                onClick={() => onResultClick(txn)}
              />
            ))}
          </div>
        )}

        {/* Expense Section */}
        {expense.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 py-2">
              Expenses
            </p>
            {expense.map((txn) => (
              <TransactionResultItem
                key={txn.id}
                transaction={txn}
                onClick={() => onResultClick(txn)}
              />
            ))}
          </div>
        )}

        {/* Transfer Section */}
        {transfer.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 py-2">
              Transfers
            </p>
            {transfer.map((txn) => (
              <TransactionResultItem
                key={txn.id}
                transaction={txn}
                onClick={() => onResultClick(txn)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with View All link */}
      {totalCount > 0 && (
        <div className="border-t border-border p-3">
          <Link
            href={`/transactions?search=${encodeURIComponent(query)}`}
            className="flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <span>View All {totalCount} Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
