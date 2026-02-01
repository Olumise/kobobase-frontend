
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { sampleBankAccounts } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 1, label: 'Uploading receipt...' },
  { id: 2, label: 'Extracting text...' },
  { id: 3, label: 'Detecting transactions...' },
];

export default function UploadReceiptPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [bankAccountId, setBankAccountId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': []
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file || !bankAccountId) return;

    setIsProcessing(true);

    // Simulate multi-stage process
    // Step 1: Upload (0-33%)
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Extraction (34-66%)
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Detection (67-100%)
    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Complete
    router.push('/receipts/rcp_001'); // Redirect to mock receipt detail
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload Receipt</h1>
        <p className="text-muted-foreground mt-1">Upload a receipt or bank statement to automatically extract transactions.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        {!isProcessing ? (
          <div className="space-y-8">
            {/* File Dropzone */}
            {!file ? (
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                  isDragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted/20"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="text-muted-foreground w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Drag & drop or click to upload
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We support .JPG, .PNG and .PDF files. Max file size 10MB.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-xl p-4 flex items-center justify-between bg-muted/20">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 text-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{file.name}</h4>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Select Bank Account <span className="text-destructive">*</span>
              </label>
              <select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="" disabled>Select an account</option>
                {sampleBankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} - {account.accountName} ({account.accountNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={!file || !bankAccountId}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
              >
                Upload & Extract
                <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            {/* Progress Visualization */}
            <div className="w-full space-y-8">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="relative flex items-center">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                        isActive ? "border-primary bg-primary text-primary-foreground scale-110" :
                        isCompleted ? "border-primary bg-primary text-primary-foreground" :
                        "border-muted bg-background text-muted-foreground"
                      )}
                    >
                      {isActive ? <Loader2 className="animate-spin" size={20} /> : 
                       isCompleted ? <CheckCircle2 size={20} /> : 
                       <span className="text-sm font-medium">{step.id}</span>
                      }
                    </div>
                    
                    <div className="ml-4 flex-1 text-left">
                      <h4 className={cn(
                        "font-medium transition-colors duration-300",
                        isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </h4>
                      {isActive && (
                        <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-sm text-center text-muted-foreground">
              Please wait while our AI analyzes your document...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
