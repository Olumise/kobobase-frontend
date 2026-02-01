
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { sampleReceipts, sampleTransactions } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const receipt = sampleReceipts.find(r => r.id === params.id) || sampleReceipts[0];
  
  const [isInitiating, setIsInitiating] = useState(false);
  const [loadingText, setLoadingText] = useState('Initiating AI extraction...');

  const handleInitiateProcessing = async () => {
    setIsInitiating(true);
    
    const messages = [
      'Initiating AI extraction...',
      'Analyzing transactions...', 
      'Enriching transaction data...'
    ];

    for (let i = 0; i < messages.length; i++) {
      setLoadingText(messages[i]);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    router.push(`/transactions/sequential/sess_001`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/receipts" 
          className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            Receipt Details
            <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              #{receipt.id}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-hidden">
        {/* LEFT: Receipt Preview */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl overflow-hidden shadow-sm relative flex flex-col">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 backdrop-blur-sm transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="flex-1 bg-zinc-800 flex items-center justify-center p-8 overflow-y-auto">
             {/* Mock Receipt Image */}
             <div className="bg-white w-full max-w-sm shadow-2xl p-6 min-h-[500px] text-xs font-mono text-zinc-800 opacity-90">
               <div className="text-center mb-6">
                 <h2 className="text-xl font-semibold mb-1">WHOLE FOODS MARKET</h2>
                 <p>1234 Main St, San Francisco, CA</p>
                 <p>415-555-0123</p>
               </div>
               <div className="border-b border-dashed border-zinc-400 my-4"></div>
               <div className="space-y-2">
                 <div className="flex justify-between"><span>ORG BANANAS</span><span>$2.99</span></div>
                 <div className="flex justify-between"><span>ALMOND MILK</span><span>$4.49</span></div>
                 <div className="flex justify-between"><span>GRASS FED BEEF</span><span>$12.99</span></div>
                 <div className="flex justify-between"><span>SOURDOUGH BREAD</span><span>$5.50</span></div>
                 <div className="flex justify-between"><span>AVOCADO BAG</span><span>$6.99</span></div>
                 <div className="flex justify-between"><span>SALMON FILLET</span><span>$18.50</span></div>
               </div>
               <div className="border-b border-dashed border-zinc-400 my-4"></div>
               <div className="flex justify-between font-semibold text-lg mt-2">
                 <span>TOTAL</span>
                 <span>$51.46</span>
               </div>
               <div className="mt-8 text-center text-zinc-500">
                 <p>Thank you for shopping with us!</p>
                 <p>{new Date().toLocaleDateString()} 14:32:01</p>
               </div>
             </div>
          </div>
          <div className="bg-zinc-900 p-4 border-t border-zinc-700 text-zinc-400 text-xs flex justify-between">
            <span>Page 1 of 1</span>
            <span>Zoom: 100%</span>
          </div>
        </div>

        {/* RIGHT: Extraction Results */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  
         
                </div>
                <h2 className="text-2xl font-semibold tracking-tighter text-foreground">
                  {receipt.transactionCount} transactions detected
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                   <span className="flex items-center text-emerald-600">
                     <CheckCircle2 size={14} className="mr-1" /> Extraction complete
                   </span>
                   <span>•</span>
                   <span>Processing time: 3.2s</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">OCR Confidence</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-2xl font-semibold text-primary">94%</span>
                </div>
                <div className="w-32 h-2 bg-muted rounded-full mt-2 ml-auto">
                  <div className="h-full bg-primary rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Preview */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 flex flex-col">
            <h3 className="font-semibold text-foreground mb-4">Detected Transactions</h3>
            
            <div className="space-y-0 flex-1 overflow-y-auto max-h-[400px]">
              {sampleTransactions.slice(0, 5).map((txn, index) => (
                <div 
                  key={txn.id} 
                  className={cn(
                    "flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-muted/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      {txn.aiConfidence * 100}%
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.transactionDate}</p>
                    </div>
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 border-t border-border">
                + {Math.max(0, receipt.transactionCount - 5)} more items detected
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-auto pt-2">
            <button 
              onClick={() => {}}
              className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete Receipt</span>
            </button>
            <button 
              onClick={handleInitiateProcessing}
              className="flex-1 h-14 bg-primary text-primary-foreground text-lg font-medium rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">
                <Zap className="fill-current" />
                Initiate Transaction Processing
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Loading Modal */}
      <AnimatePresence>
        {isInitiating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md text-center space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-primary w-8 h-8 fill-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground animate-pulse">Processing Transactions</h2>
                <p className="text-muted-foreground">Please wait while we prepare your session...</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-full">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">{loadingText}</span>
                  <span className="text-primary font-mono">8 items</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
