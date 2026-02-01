
'use client';

import { useState } from 'react';
import { 
  Check, 
  AlertTriangle, 
  Info, 
  SkipForward, 
  ChevronDown, 
  Sparkles,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { sampleCategories, sampleBankAccounts } from '@/lib/mockData';
import { motion } from 'framer-motion';

export type TransactionState = 'READY' | 'CLARIFICATION_NEEDED' | 'NEEDS_CONFIRMATION';

interface TransactionReviewCardProps {
  transaction: any;
  state: TransactionState;
  onApprove: () => void;
  onSkip: () => void;
  onClarify: () => void;
}

export function TransactionReviewCard({ 
  transaction, 
  state, 
  onApprove, 
  onSkip, 
  onClarify 
}: TransactionReviewCardProps) {
  
  // Badge/Header Logic
  const getHeaderConfig = () => {
    switch (state) {
      case 'READY':
        return {
          bg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50 text-emerald-700',
          icon: Check,
          text: 'Ready to approve',
          border: 'border-emerald-200'
        };
      case 'CLARIFICATION_NEEDED':
        return {
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50 text-amber-700',
          icon: AlertTriangle,
          text: 'Clarification needed',
          border: 'border-amber-200'
        };
      case 'NEEDS_CONFIRMATION':
        return {
          bg: 'bg-blue-500',
          lightBg: 'bg-blue-50 text-blue-700',
          icon: Info,
          text: 'Action required',
          border: 'border-blue-200'
        };
    }
  };

  const config = getHeaderConfig();
  const Icon = config.icon;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Dynamic Header Badge */}
      <div className={cn("flex items-center px-4 py-3 rounded-lg border", config.lightBg, config.border)}>
        <Icon size={18} className="mr-2" />
        <span className="font-medium">{config.text}</span>
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Amount & Confidence */}
          <div className="flex justify-between items-start">
            <div>
               <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Amount</p>
               <h2 className="text-4xl font-semibold text-foreground mt-1">{formatCurrency(transaction.amount)}</h2>
            </div>
            <div className="flex flex-col items-end">
              <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full flex items-center">
                <Sparkles size={12} className="mr-1" />
                {transaction.aiConfidence * 100}% Confidence
              </div>
            </div>
          </div>

          {/* Alert for Clarification */}
          {state === 'CLARIFICATION_NEEDED' && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3"
             >
               <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
               <div>
                  <h4 className="font-medium text-amber-800 text-sm">Additional information needed</h4>
                  <p className="text-amber-700 text-xs mt-1">Please provide the category and contact for this transaction.</p>
               </div>
             </motion.div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 col-span-2">
               <label className="text-sm font-medium text-muted-foreground">Description</label>
               <textarea 
                 defaultValue={transaction.description}
                 className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
               />
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Category</label>
               <div className={cn("relative", state === 'CLARIFICATION_NEEDED' ? 'ring-2 ring-amber-400 rounded-lg' : '')}>
                 <select 
                   defaultValue={transaction.categoryId}
                   className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                 >
                   {sampleCategories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                   ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" size={16} />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Date</label>
               <div className="relative">
                 <input 
                   type="date"
                   defaultValue={transaction.transactionDate}
                   className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                 />
                 <CalendarIcon className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" size={16} />
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
               <div className="relative">
                 <select 
                   defaultValue={transaction.paymentMethod}
                   className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                 >
                   <option value="card">Card</option>
                   <option value="cash">Cash</option>
                   <option value="transfer">Transfer</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" size={16} />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Bank Account</label>
               <div className="relative">
                 <select 
                   defaultValue={transaction.bankAccountId}
                   className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                 >
                    {sampleBankAccounts.map(ba => (
                      <option key={ba.id} value={ba.id}>{ba.bankName} - {ba.accountName}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" size={16} />
               </div>
             </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button 
            onClick={onSkip}
            className="flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <SkipForward size={18} className="mr-2" />
            Skip
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            {state === 'CLARIFICATION_NEEDED' && (
              <button 
                onClick={onClarify}
                className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center"
              >
                Clarify Transaction
              </button>
            )}
            
            <button 
              onClick={onApprove}
              disabled={state === 'CLARIFICATION_NEEDED'}
              className="flex-1 sm:flex-none px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center transform active:scale-95"
            >
              <Check size={18} className="mr-2" />
              Approve & Next
            </button>
          </div>
        </div>
      </div>

      {/* AI Details Collapsible (Simplified) */}
      <div className="bg-transparent border border-dashed border-border rounded-lg p-4">
         <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">AI Extraction Details</h4>
         <p className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
           raw_text: "WHOLE FOODS MARKET... TOTAL $51.46"
         </p>
      </div>
    </div>
  );
}
