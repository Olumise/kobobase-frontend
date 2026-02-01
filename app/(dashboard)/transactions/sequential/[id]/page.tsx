
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sampleTransactions } from '@/lib/mockData';
import { Stepper } from '@/components/sequential/Stepper';
import { TransactionReviewCard, TransactionState } from '@/components/sequential/TransactionReviewCard';
import { ClarificationChat } from '@/components/sequential/ClarificationChat';
import { motion, AnimatePresence } from 'framer-motion';

export default function SequentialProcessingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  
  // Local state for the current transaction
  const [currentState, setCurrentState] = useState<TransactionState>('READY');

  const currentTransaction = transactions[currentIndex];
  const total = transactions.length;

  useEffect(() => {
    // Mock logic: 3rd transaction (index 2) needs clarification initially
    if (currentIndex === 2 && !completedIndices.includes(2)) {
      setCurrentState('CLARIFICATION_NEEDED');
    } else {
      setCurrentState('READY');
    }
  }, [currentIndex, completedIndices]);

  const handleApprove = async () => {
    // Show saving state or toast here if we had one
    // setSaving(true)... await...
    
    setCompletedIndices(prev => [...prev, currentIndex]);
    
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleSkip = () => {
    if (confirm("Skip this transaction? It will not be saved.")) {
       if (currentIndex < total - 1) {
         setCurrentIndex(prev => prev + 1);
       } else {
         setShowCompletion(true);
       }
    }
  };

  const handleClarify = () => {
    setIsChatOpen(true);
  };

  const handleChatComplete = () => {
    setIsChatOpen(false);
    setCurrentState('READY');
    // Maybe show a success toast here
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden -m-6 lg:-m-8">
      {/* LEFT COLUMN: Receipt Preview (Desktop only) */}
      <div className="hidden lg:flex w-[40%] bg-zinc-900 flex-col border-r border-sidebar-border relative">
        <div className="p-4 bg-zinc-950/50 backdrop-blur border-b border-zinc-800 text-zinc-400 text-sm flex justify-between items-center">
            <span>Receipt Preview</span>
            <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors"><RefreshCw size={14} /></button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-zinc-900/50">
             {/* Mock Receipt (Simplified) */}
             <div className="bg-white text-zinc-900 font-mono text-xs p-8 shadow-2xl min-h-[600px] w-full max-w-sm opacity-90 scale-90 origin-top">
                <div className="text-center font-semibold text-xl mb-4">RECEIPT</div>
                <div className="space-y-4">
                  {transactions.map((t, idx) => (
                    <div key={t.id} className={cn(
                      "flex justify-between p-1 transition-colors",
                      idx === currentIndex ? "bg-primary/30 ring-2 ring-primary rounded scale-105 font-semibold" : ""
                    )}>
                      <span>{t.description.substring(0, 15)}...</span>
                      <span>${t.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-black my-4"></div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>TOTAL</span>
                    <span>${transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
             </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Processing Interface */}
      <div className="flex-1 flex flex-col bg-background relative z-0">
        <Stepper total={total} current={currentIndex} completed={completedIndices} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col items-center">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <TransactionReviewCard 
                transaction={currentTransaction}
                state={currentState}
                onApprove={handleApprove}
                onSkip={handleSkip}
                onClarify={handleClarify}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Clarification Chat */}
      <ClarificationChat 
        transactionId={currentTransaction.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onComplete={handleChatComplete}
      />

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletion && (
           <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
             >
               <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={40} />
               </div>
               <h2 className="text-2xl font-semibold text-foreground mb-2">Sequential Processing Complete</h2>
               <p className="text-muted-foreground mb-8">
                 You have successfully reviewed all {total} transactions from this receipt.
               </p>
               
               <div className="bg-muted/30 rounded-xl p-4 mb-8 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-emerald-600">{completedIndices.length}</div>
                    <div className="text-xs text-muted-foreground uppercase">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-foreground">{total - completedIndices.length}</div>
                    <div className="text-xs text-muted-foreground uppercase">Skipped</div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => router.push('/transactions')}
                    className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
                 >
                   View All Transactions
                 </button>
                 <button 
                    onClick={() => router.push('/receipts/upload')}
                    className="w-full py-3 bg-transparent text-muted-foreground hover:text-foreground font-medium transition-colors"
                 >
                   Upload Another Receipt
                 </button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
