
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          variant: 'default' as const,
          className: 'bg-primary/10 text-primary border-primary',
          icon: Check,
          text: 'Ready to approve'
        };
      case 'CLARIFICATION_NEEDED':
        return {
          variant: 'outline' as const,
          className: 'bg-amber-400/10 text-amber-400 border-amber-400',
          icon: AlertTriangle,
          text: 'Clarification needed'
        };
      case 'NEEDS_CONFIRMATION':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-500/10 text-blue-400 border-blue-400',
          icon: Info,
          text: 'Action required'
        };
    }
  };

  const config = getHeaderConfig();
  const Icon = config.icon;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Dynamic Header Badge */}
      <div className={cn("flex items-center px-4 py-3 rounded-lg border", config.className)}>
        <Icon size={18} className="mr-2" />
        <span className="font-medium">{config.text}</span>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-8">
          
          {/* Amount & Confidence */}
          <div className="flex justify-between items-start">
            <div>
               <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Amount</p>
               <h2 className="text-4xl font-semibold text-foreground mt-1">{formatCurrency(transaction.amount)}</h2>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                <Sparkles size={12} className="mr-1" />
                {transaction.aiConfidence * 100}% Confidence
              </Badge>
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
               <Textarea 
                 defaultValue={transaction.description}
                 className="min-h-[80px] bg-background resize-none"
               />
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Category</label>
               <Select defaultValue={transaction.categoryId}>
                 <SelectTrigger className={cn("bg-background w-full", state === 'CLARIFICATION_NEEDED' ? 'ring-2 ring-amber-400' : '')}>
                   <SelectValue placeholder="Select category" />
                 </SelectTrigger>
                 <SelectContent>
                   {sampleCategories.map(cat => (
                     <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Date</label>
               <div className="relative">
                 <Input 
                   type="date"
                   defaultValue={transaction.transactionDate}
                   className="bg-background"
                 />
                 <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
               <Select defaultValue={transaction.paymentMethod}>
                 <SelectTrigger className="bg-background w-full">
                   <SelectValue placeholder="Select method" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="card">Card</SelectItem>
                   <SelectItem value="cash">Cash</SelectItem>
                   <SelectItem value="transfer">Transfer</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Bank Account</label>
               <Select defaultValue={transaction.bankAccountId}>
                 <SelectTrigger className="bg-background w-full">
                   <SelectValue placeholder="Select account" />
                 </SelectTrigger>
                 <SelectContent>
                    {sampleBankAccounts.map(ba => (
                      <SelectItem key={ba.id} value={ba.id}>{ba.bankName} - {ba.accountName}</SelectItem>
                    ))}
                 </SelectContent>
               </Select>
             </div>
          </div>
        </CardContent>

        {/* Action Footer */}
        <CardFooter className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <SkipForward size={18} className="mr-2" />
            Skip
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            {state === 'CLARIFICATION_NEEDED' && (
              <Button 
                onClick={onClarify}
                className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-medium"
              >
                Clarify Transaction
              </Button>
            )}
            
            <Button 
              onClick={onApprove}
              disabled={state === 'CLARIFICATION_NEEDED'}
              size="lg"
              className="flex-1 sm:flex-none px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-medium shadow-lg transition-all"
            >
              <Check size={18} className="mr-2" />
              Approve & Next
            </Button>
          </div>
        </CardFooter>
      </Card>

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
