'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  AlertCircle,
  Loader2,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionsApi, categoriesApi, contactsApi } from '@/lib/api';
import type {
  TransactionDetail,
  GetAllTransactionsResponse,
  TransactionFilters
} from '@/lib/types/transaction';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { TransactionEditModal } from '@/components/transactions/TransactionEditModal';
import { TransactionDeleteDialog } from '@/components/transactions/TransactionDeleteDialog';

export default function TransactionsPage() {
  const searchParams = useSearchParams();

  // Data state
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

  // Filter state
  const [filters, setFilters] = useState<TransactionFilters>({
    transactionType: 'ALL',
    categoryId: undefined,
    contactId: undefined,
    status: 'ALL',
    dateRange: undefined,
    searchQuery: '',
  });

  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setFilters(prev => ({ ...prev, searchQuery: urlSearch }));
    }
  }, [searchParams]);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchTransactions(true);
    }
  }, [filters.transactionType, filters.categoryId, filters.contactId, filters.status, filters.dateRange]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [txnRes, catRes, contactRes] = await Promise.all([
        transactionsApi.getAllTransactions({ limit: ITEMS_PER_PAGE, offset: 0 }),
        categoriesApi.getAllCategories(),
        contactsApi.getAllContacts(100),
      ]);

      const txnData: GetAllTransactionsResponse = txnRes.data;
      setTransactions(txnData.data.transactions);
      setHasMore(txnData.data.total > ITEMS_PER_PAGE);
      setCurrentOffset(ITEMS_PER_PAGE);

      // Extract categories from response - based on sequential transaction pattern
      setCategories(catRes.data.data.categories || []);

      // Extract contacts from response - based on sequential transaction pattern
      setContacts(contactRes.data.data || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentOffset(0);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : currentOffset;
      const params = buildApiParams(filters, ITEMS_PER_PAGE, offset);

      const response = await transactionsApi.getAllTransactions(params);
      const data: GetAllTransactionsResponse = response.data;

      if (reset) {
        setTransactions(data.data.transactions);
      } else {
        setTransactions(prev => [...prev, ...data.data.transactions]);
      }

      setHasMore(data.data.total > offset + ITEMS_PER_PAGE);
      setCurrentOffset(offset + ITEMS_PER_PAGE);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const buildApiParams = (filters: TransactionFilters, limit: number, offset: number) => {
    const params: any = { limit, offset };

    if (filters.transactionType !== 'ALL') {
      params.transactionType = filters.transactionType;
    }
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.contactId) params.contactId = filters.contactId;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.dateRange) {
      params.startDate = filters.dateRange.startDate;
      params.endDate = filters.dateRange.endDate;
    }

    return params;
  };

  // Filter transactions by search query (client-side)
  const filteredTransactions = useMemo(() => {
    if (!filters.searchQuery) return transactions;

    const query = filters.searchQuery.toLowerCase();
    return transactions.filter(txn =>
      txn.description?.toLowerCase().includes(query) ||
      txn.summary?.toLowerCase().includes(query) ||
      txn.contact?.name?.toLowerCase().includes(query)
    );
  }, [transactions, filters.searchQuery]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    return filteredTransactions.reduce((acc, txn) => {
      const amount = Number(txn.amount);
      if (txn.transactionType === 'INCOME') {
        acc.totalIncome += amount;
      } else if (txn.transactionType === 'EXPENSE') {
        acc.totalExpense += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [filteredTransactions]);

  const { totalIncome, totalExpense } = summaryStats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">View and manage your financial records</p>
        </div>
        <Button variant="outline" className="shadow-sm">
          <Download size={18} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
           <div>
             <p className="text-xs text-muted-foreground uppercase font-semibold">Total Income</p>
             <p className="text-xl font-semibold text-primary mt-1">{formatCurrency(totalIncome)}</p>
           </div>
           <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
             <ArrowUpRight size={20} />
           </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
           <div>
             <p className="text-xs text-muted-foreground uppercase font-semibold">Total Expenses</p>
             <p className="text-xl font-semibold text-rose-600 mt-1">{formatCurrency(totalExpense)}</p>
           </div>
           <div className="w-10 h-10 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center">
             <ArrowDownRight size={20} />
           </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
           <div>
             <p className="text-xs text-muted-foreground uppercase font-semibold">Net Balance</p>
             <p className="text-xl font-semibold text-foreground mt-1">{formatCurrency(totalIncome - totalExpense)}</p>
           </div>
           <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
             =
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Search descriptions, merchants..."
            className="pl-9 bg-background/50 border-border"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0">
          <Button
            variant={filters.transactionType === 'ALL' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, transactionType: 'ALL' }))}
          >
            All
          </Button>
          <Button
            variant={filters.transactionType === 'INCOME' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, transactionType: 'INCOME' }))}
            className={cn(filters.transactionType === 'INCOME' && "bg-emerald-600 hover:bg-emerald-700")}
          >
            Income
          </Button>
          <Button
            variant={filters.transactionType === 'EXPENSE' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, transactionType: 'EXPENSE' }))}
            className={cn(filters.transactionType === 'EXPENSE' && "bg-rose-600 hover:bg-rose-700")}
          >
            Expense
          </Button>

          {/* Status Filter */}
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              status: value as TransactionFilters['status']
            }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(value) => setFilters(prev => ({
              ...prev,
              categoryId: value === 'all' ? undefined : value
            }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 bg-card border border-border rounded-xl">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-2 text-rose-500" size={32} />
          <p className="text-rose-700 dark:text-rose-400 mb-4">{error}</p>
          <Button onClick={() => fetchTransactions(true)}>Try Again</Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-lg font-semibold text-foreground mb-2">No transactions found</p>
            <p className="text-muted-foreground mb-6">
              {filters.searchQuery || filters.transactionType !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'Upload a receipt to start tracking your transactions.'}
            </p>
            {(filters.searchQuery || filters.transactionType !== 'ALL') && (
              <Button onClick={() => setFilters({
                transactionType: 'ALL',
                categoryId: undefined,
                contactId: undefined,
                status: 'ALL',
                dateRange: undefined,
                searchQuery: '',
              })}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-4 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((txn, index) => {
                  const Icon = ArrowDownRight;

                  return (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {new Date(txn.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{txn.description || 'No description'}</p>
                            <p className="text-xs text-muted-foreground">{txn.contact?.name || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {txn.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {txn.category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {txn.paymentMethod ? txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                          txn.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          txn.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        )}>
                          {txn.status}
                        </span>
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right font-semibold whitespace-nowrap",
                        txn.transactionType === 'INCOME' ? "text-emerald-600" : "text-foreground"
                      )}>
                        {txn.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedTransaction(txn);
                              setDetailModalOpen(true);
                            }}>
                              <Eye size={14} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTransaction(txn);
                              setEditModalOpen(true);
                            }}>
                              <Edit size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-muted/5 flex justify-center">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading more transactions...
              </div>
            ) : hasMore ? (
              <Button variant="ghost" onClick={() => fetchTransactions(false)}>
                Load More Transactions
              </Button>
            ) : filteredTransactions.length > 0 ? (
              <p className="text-sm text-muted-foreground">No more transactions to load</p>
            ) : null}
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEdit={(txn) => {
          setDetailModalOpen(false);
          setSelectedTransaction(txn);
          setEditModalOpen(true);
        }}
        onDelete={(txn) => {
          setDetailModalOpen(false);
          setSelectedTransaction(txn);
          setDeleteModalOpen(true);
        }}
      />

      <TransactionEditModal
        transaction={selectedTransaction}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={() => fetchTransactions(true)}
        categories={categories}
        contacts={contacts}
      />

      <TransactionDeleteDialog
        transaction={selectedTransaction}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={() => fetchTransactions(true)}
      />
    </div>
  );
}
