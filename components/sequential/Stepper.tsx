'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StepperProps {
  steps: { id: string; label: string }[];
  currentStepIndex: number;
}

export function Stepper({ steps, currentStepIndex }: StepperProps) {
  // Calculate progress percentage for the bar
  const progressValue = (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between items-start">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" style={{ left: '5%', right: '5%' }} />

        {/* Progress Line */}
        <motion.div
          className="absolute top-5 h-0.5 bg-primary"
          style={{ left: '5%' }}
          initial={{ width: 0 }}
          animate={{ width: `calc(${progressValue}% * 0.9)` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? 'var(--primary)' : 'var(--muted)',
                  scale: isActive ? 1.1 : 1
                }}
                className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 border-4 border-background",
                  isCompleted || isActive ? "text-primary-foreground shadow-md bg-primary" : "text-muted-foreground bg-muted"
                )}
              >
                {isCompleted ? (
                   <Check size={18} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              <span className={cn(
                "mt-2 text-xs font-medium transition-colors duration-300",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
