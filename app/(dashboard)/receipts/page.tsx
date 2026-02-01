
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { sampleReceipts } from '@/lib/mockData';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ReceiptsPage() {
  const [filter, setFilter] = useState('All');

  const filteredReceipts = sampleReceipts.filter(r => {
    if (filter === 'All') return true;
    return r.status === filter.toUpperCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Receipts</h1>
          <p className="text-muted-foreground mt-1">Manage and process your uploaded documents</p>
        </div>
        <Link 
          href="/receipts/upload" 
          className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Upload Receipt
        </Link>
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
                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === status 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
              )}
            >
              {status}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent flex items-center">
            <Filter size={14} className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReceipts.map((receipt, index) => (
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
                     {receipt.status === 'PROCESSED' && <CheckCircle2 className="text-emerald-500 fill-white" size={20} />}
                     {receipt.status === 'PENDING' && <Clock className="text-amber-500 fill-white" size={20} />}
                     {receipt.status === 'FAILED' && <AlertCircle className="text-rose-500 fill-white" size={20} />}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground truncate pr-2" title={receipt.fileName}>
                      {receipt.fileName}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(receipt.uploadDate)}
                  </div>

                  <div className="mt-auto pt-4 border-t border-border flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                       <span className="text-xs text-muted-foreground">Transactions</span>
                       <span className="font-medium text-foreground">
                         {receipt.processedCount}/{receipt.transactionCount}
                       </span>
                    </div>
                    <div className="text-right">
                       <span className="text-xs text-muted-foreground">Total</span>
                       <div className="font-medium text-foreground">
                         {formatCurrency(receipt.totalAmount)}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
