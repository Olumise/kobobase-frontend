
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown
} from 'lucide-react';
import { sampleTransactions, sampleCategories } from '@/lib/mockData';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = sampleTransactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.transactionType === filterType;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.transactionType === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

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
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0">
          <Button 
            variant={filterType === 'ALL' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType('ALL')}
          >
            All
          </Button>
          <Button 
            variant={filterType === 'INCOME' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType('INCOME')}
            className={cn(filterType === 'INCOME' && "bg-emerald-600 hover:bg-emerald-700")}
          >
            Income
          </Button>
          <Button 
            variant={filterType === 'EXPENSE' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType('EXPENSE')}
            className={cn(filterType === 'EXPENSE' && "bg-rose-600 hover:bg-rose-700")}
          >
            Expense
          </Button>
        </div>
        
    
      </div>

      {/* Transactions Table */}
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
                const category = sampleCategories.find(c => c.id === txn.categoryId);
                const Icon = category?.icon || ArrowDownRight;

                return (
                  <motion.tr 
                    key={txn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {txn.transactionDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">{txn.merchant}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" 
                          style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                          {category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize text-muted-foreground">
                      {txn.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", 
                          txn.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                          "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {txn.status === 'CONFIRMED' ? 'Completed' : 'Pending'}
                        </span>
                    </td>
                    <td className={cn("px-6 py-4 text-right font-semibold whitespace-nowrap", 
                        txn.transactionType === 'INCOME' ? "text-emerald-600" : "text-foreground"
                      )}>
                        {txn.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border bg-muted/5 flex justify-center">
          <button className="text-sm font-medium text-primary hover:underline">Load More Transactions</button>
        </div>
      </div>
    </div>
  );
}
