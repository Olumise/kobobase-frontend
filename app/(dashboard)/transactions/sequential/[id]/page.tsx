'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Save, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sampleTransactions } from '@/lib/mockData';
import { Stepper } from '@/components/sequential/Stepper';
import { TransactionReviewCard, TransactionState } from '@/components/sequential/TransactionReviewCard';
import { ClarificationChat } from '@/components/sequential/ClarificationChat';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function SequentialProcessingPage() {
  const params = useParams();
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [processState, setProcessState] = useState<Record<string, TransactionState>>({
    'txn_001': 'READY',
    'txn_002': 'CLARIFICATION_NEEDED',
    'txn_003': 'NEEDS_CONFIRMATION',
  });

  const transactions = sampleTransactions.slice(0, 5);
  const currentTxn = transactions[currentIndex];
  
  const steps = transactions.map((_, i) => ({
    id: `step-${i}`,
    label: `Transaction ${i + 1}`
  }));

  const handleApprove = () => {
    if (currentIndex < transactions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentTxnState = processState[currentTxn.id] || 'READY';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              Review Session 
              <Badge variant="secondary" className="font-mono text-xs">sess_001</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Review and approve extracted transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2 hidden sm:flex">
             <Save size={16} /> Save Draft
           </Button>
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
             <CheckCircle2 size={16} /> Finish Session
           </Button>
        </div>
      </div>

      {/* Progress Stepper Section */}
      <Card className="p-4 mb-8 bg-card/50 border-dashed">
        <Stepper 
          steps={steps}
          currentStepIndex={currentIndex}
        />
      </Card>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTxn.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <TransactionReviewCard 
              transaction={currentTxn}
              state={currentTxnState}
              onApprove={handleApprove}
              onSkip={() => {}}
              onClarify={() => setIsChatOpen(true)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Info */}
        <div className="mt-8 flex items-center gap-12 text-sm text-muted-foreground font-medium">
           <button 
             onClick={handleBack}
             disabled={currentIndex === 0}
             className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors"
           >
             <ChevronLeft size={16} /> Previous
           </button>
           
           <div className="flex items-center gap-2">
             <Sparkles size={14} className="text-primary" />
             <span>AI Assisted Verification Active</span>
           </div>

           <button 
             onClick={handleApprove}
             disabled={currentIndex === transactions.length - 1}
             className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors"
           >
             Next <ChevronRight size={16} />
           </button>
        </div>
      </div>

      {/* Clarification Side Panel */}
      <ClarificationChat 
        transactionId={currentTxn.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onComplete={() => {
          setProcessState(prev => ({
            ...prev,
            [currentTxn.id]: 'READY'
          }));
          setIsChatOpen(false);
        }}
      />
      
      {/* Floating Chat Trigger (Mobile Only) */}
      <Button 
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl lg:hidden"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageSquare size={24} />
      </Button>
    </div>
  );
}
