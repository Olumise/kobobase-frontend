
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Upload,
  ReceiptIcon
} from 'lucide-react';
import { receiptsApi } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  transactionDate: string;
  transactionType: string;
  receiptId: string;
  category: {
    id: string;
    name: string;
  } | null;
  contact: {
    id: string;
    name: string;
  } | null;
  userBankAccount: {
    id: string;
    accountName: string;
  } | null;
  toBankAccount: null;
}

interface BatchSession {
  id: string;
  receiptId: string;
  userId: string;
  totalExpected: number;
  totalProcessed: number;
  processingMode: string;
  status: string;
  extractedData: {
    detection: {
      document_type: string;
      transaction_count: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Receipt {
  id: string;
  userId: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  rawOcrText: string;
  uploadedAt: string;
  processedAt: string | null;
  processingStatus: string;
  documentType: string;
  expectedTransactions: number;
  detectionCompleted: boolean;
  extractionMetadata: {
    isPDF: boolean;
    pageCount?: number;
  };
  transactions: Transaction[];
  batchSessions: BatchSession[];
}

interface ReceiptsResponse {
  success: boolean;
  count: number;
  receipts: Receipt[];
}

export default function ReceiptsPage() {
  const [filter, setFilter] = useState('All');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptsApi.getAllReceipts();
      const data: ReceiptsResponse = response.data;
      setReceipts(data.receipts);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromProcessing = (status: string): 'PROCESSED' | 'PENDING' | 'FAILED' => {
    if (status === 'processed') return 'PROCESSED';
    if (status === 'failed') return 'FAILED';
    return 'PENDING';
  };

  const filteredReceipts = receipts.filter(r => {
    if (filter === 'All') return true;
    return getStatusFromProcessing(r.processingStatus) === filter.toUpperCase();
  });

  const getTotalAmount = (receipt: Receipt): number => {
    return receipt.transactions.reduce((sum, txn) => sum + txn.amount, 0);
  };

  const getProcessedCount = (receipt: Receipt): number => {
    if (receipt.documentType === 'bank_statement' && receipt.batchSessions.length > 0) {
      return receipt.batchSessions[0].totalProcessed;
    }
    return receipt.transactions.length;
  };

  const getFileName = (fileUrl: string): string => {
    return fileUrl.split('/').pop() || 'Unknown file';
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Receipts</h1>
          <p className="text-muted-foreground mt-1">Manage and process your uploaded documents</p>
        </div>
        <Button asChild>
          <Link href="/receipts/upload">
            <Plus size={18} className="mr-2" />
            Upload Receipt
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search receipts by name, date..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['All', 'Processed', 'Pending', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "cursor-pointer px-3 py-0.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === status 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "bg-muted text-muted-foreground hover:border-primary/20 border border-transparent"
              )}
            >
              {status}
            </button>
          ))}
        
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className=" flex-1 flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-2 text-rose-500" size={32} />
          <p className="text-rose-700 dark:text-rose-400">{error}</p>
          <Button onClick={fetchReceipts} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && receipts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="mb-4 inline-flex p-4 bg-primary/10 rounded-full">
              <ReceiptIcon className="text-primary" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No receipts yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first receipt to start tracking transactions automatically with AI-powered processing.
            </p>
            <Button asChild size="lg">
              <Link href="/receipts/upload">
                <Upload size={18} className="mr-2" />
                Upload Your First Receipt
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Receipts Grid */}
      {!loading && !error && filteredReceipts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReceipts.map((receipt, index) => {
            const status = getStatusFromProcessing(receipt.processingStatus);
            const fileName = getFileName(receipt.fileUrl);
            const totalAmount = getTotalAmount(receipt);
            const processedCount = getProcessedCount(receipt);

            return (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/receipts/${receipt.id}`} className="block group">
                  <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all h-full flex flex-col">
                    {/* Preview / Thumbnail */}
                    <div className="relative h-40 bg-muted/30 flex items-center justify-center p-4 group-hover:bg-muted/50 transition-colors">
                      <div className="w-24 h-32 bg-white shadow-sm border border-gray-200 rounded flex flex-col items-center justify-center p-2 relative transform group-hover:-translate-y-1 transition-transform duration-300">
                        <FileText className="text-gray-400 mb-2" size={32} />
                        <div className="w-full h-1 bg-gray-100 mb-1 rounded"></div>
                        <div className="w-3/4 h-1 bg-gray-100 mb-1 rounded"></div>
                        <div className="w-full h-1 bg-gray-100 rounded"></div>
                      </div>

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-foreground text-xs font-semibold px-2 py-1 rounded shadow-sm">
                          View Details
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {status === 'PROCESSED' && <CheckCircle2 className="text-emerald-500 fill-white" size={20} />}
                        {status === 'PENDING' && <Clock className="text-amber-500 fill-white" size={20} />}
                        {status === 'FAILED' && <AlertCircle className="text-rose-500 fill-white" size={20} />}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground truncate pr-2" title={fileName}>
                          {fileName}
                        </h3>
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(receipt.uploadedAt)}
                      </div>

                      <div className="text-xs text-muted-foreground mb-4 capitalize">
                        {receipt.documentType?.replace(/_/g, ' ') || 'Receipt'}
                      </div>

                      <div className="mt-auto pt-4 border-t border-border flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Approved Transactions</span>
                          <span className="font-medium text-foreground">
                            {processedCount}/{receipt.expectedTransactions}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Total</span>
                          <div className="font-medium text-foreground">
                            {formatCurrency(totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty Filter Results */}
      {!loading && !error && receipts.length > 0 && filteredReceipts.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Filter className="mx-auto mb-2 text-muted-foreground" size={32} />
          <p className="text-muted-foreground">No receipts found with status: {filter}</p>
          <Button onClick={() => setFilter('All')} variant="outline" className="mt-4">
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
}
