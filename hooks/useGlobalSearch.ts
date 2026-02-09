'use client';

import { useState, useEffect, useMemo } from 'react';
import { transactionsApi } from '@/lib/api';
import type { TransactionDetail } from '@/lib/types/transaction';

interface UseGlobalSearchResult {
  results: TransactionDetail[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  retry: () => void;
}

export function useGlobalSearch(query: string): UseGlobalSearchResult {
  const [allTransactions, setAllTransactions] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch transactions when component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await transactionsApi.getAllTransactions({ limit: 50 });
        const data = response.data?.data?.transactions || response.data?.transactions || [];

        setAllTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on debounced query
  const filteredResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      return [];
    }

    const q = debouncedQuery.toLowerCase();

    const filtered = allTransactions.filter(txn =>
      txn.description?.toLowerCase().includes(q) ||
      txn.summary?.toLowerCase().includes(q) ||
      txn.contact?.name?.toLowerCase().includes(q) ||
      txn.referenceNumber?.toLowerCase().includes(q)
    );

    // Return top 7 results for popover display
    return filtered.slice(0, 7);
  }, [allTransactions, debouncedQuery]);

  const retry = () => {
    // Trigger refetch by clearing and setting query again
    setError(null);
    setLoading(true);

    transactionsApi.getAllTransactions({ limit: 50 })
      .then(response => {
        const data = response.data?.data?.transactions || response.data?.transactions || [];
        setAllTransactions(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Calculate total count from all transactions (not just top 7)
  const totalCount = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      return 0;
    }

    const q = debouncedQuery.toLowerCase();

    return allTransactions.filter(txn =>
      txn.description?.toLowerCase().includes(q) ||
      txn.summary?.toLowerCase().includes(q) ||
      txn.contact?.name?.toLowerCase().includes(q) ||
      txn.referenceNumber?.toLowerCase().includes(q)
    ).length;
  }, [allTransactions, debouncedQuery]);

  return {
    results: filteredResults,
    loading,
    error,
    totalCount,
    retry,
  };
}
