'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { GlobalSearchResults } from './GlobalSearchResults';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import type { TransactionDetail } from '@/lib/types/transaction';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { results, loading, error, totalCount, retry } = useGlobalSearch(query);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Open popover if query has 3+ characters, close if less
    setOpen(value.length >= 3);
  };

  const handleResultClick = (transaction: TransactionDetail) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
    // Keep popover open in background
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (query.length >= 3) {
                  setOpen(true);
                }
              }}
              className="h-9 w-64 rounded-full pl-9 bg-muted/50 border-input focus:bg-background transition-all"
              aria-label="Search transactions"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] p-0"
          align="end"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <GlobalSearchResults
            query={query}
            results={results}
            loading={loading}
            error={error}
            totalCount={totalCount}
            onResultClick={handleResultClick}
            onRetry={retry}
          />
        </PopoverContent>
      </Popover>

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={detailModalOpen}
        onOpenChange={handleCloseDetailModal}
        onEdit={(txn) => {
          // Close detail modal - could open edit modal in future
          setDetailModalOpen(false);
          console.log('Edit transaction:', txn.id);
        }}
        onDelete={(txn) => {
          // Close modal and refresh results by retriggering search
          setDetailModalOpen(false);
          console.log('Delete transaction:', txn.id);
          // Trigger retry to refresh the transaction list
          retry();
        }}
      />
    </>
  );
}
