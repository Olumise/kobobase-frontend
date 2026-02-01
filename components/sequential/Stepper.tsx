
'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StepperProps {
  total: number;
  current: number; // 0-indexed
  completed: number[]; // Array of completed indices
}

export function Stepper({ total, current, completed }: StepperProps) {
  return (
    <div className="w-full py-6 px-4 bg-background border-b border-border sticky top-0 z-20">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-full max-w-2xl relative">
          {/* Progress Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
          
          {/* Progress Line Active */}
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10" 
            initial={{ width: '0%' }}
            animate={{ width: `${(current / (total - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />

          {/* Steps */}
          <div className="flex justify-between w-full">
            {Array.from({ length: total }).map((_, index) => {
              const isCompleted = completed.includes(index);
              const isCurrent = current === index;
              const isFuture = !isCompleted && !isCurrent;

              return (
                <div key={index} className="relative group">
                  <motion.div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                      isCompleted ? "border-primary bg-primary text-primary-foreground" :
                      isCurrent ? "border-primary text-primary ring-4 ring-primary/20 scale-110" :
                      "border-muted text-muted-foreground"
                    )}
                    initial={false}
                    animate={{ scale: isCurrent ? 1.2 : 1 }}
                  >
                    {isCompleted ? <Check size={14} /> : <Circle size={10} fill={isCurrent ? "currentColor" : "transparent"} />}
                  </motion.div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Transaction {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 text-sm font-medium text-muted-foreground">
          Transaction <span className="text-foreground">{current + 1}</span> of <span className="text-foreground">{total}</span>
        </div>
      </div>
    </div>
  );
}
