
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Zap,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { sampleReceipts } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReceiptPreview } from "@/components/receipts/ReceiptPreview";
import { receiptsApi } from '@/lib/api';

interface Receipt {
  id: string;
  userId: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  rawOcrText: string;
  uploadedAt: string;
  processedAt: string | null;
  processingStatus: string;
  documentType: string;
  expectedTransactions: number;
  detectionCompleted: boolean;
  extractionMetadata: {
    isPDF: boolean;
    pageCount?: number;
    ocrConfidence?: number;
    processingTime?: number;
  };
  transactions: any[];
  batchSessions: any[];
}

export default function ReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [loadingText, setLoadingText] = useState('Initiating AI extraction...');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await receiptsApi.getReceiptById(params.id as string);

        const receiptData = response.data.receipt || response.data;

        const formattedReceipt = {
          ...receiptData,
          extractionMetadata: {
            isPDF: receiptData.fileType === 'application/pdf',
            pageCount: receiptData.extractionMetadata?.pageCount,
            ocrConfidence: receiptData.extractionMetadata?.ocrConfidence,
            processingTime: receiptData.extractionMetadata?.processingTime,
            ...receiptData.extractionMetadata
          }
        };

        setReceipt(formattedReceipt);
      } catch (err: any) {
        console.error('Error fetching receipt:', err);
        setError(err.response?.data?.message || 'Failed to load receipt');
        // Fallback to mock data in development
        const fallbackReceipt = sampleReceipts.find(r => r.id === params.id);
        if (fallbackReceipt) {
          setReceipt(fallbackReceipt as any);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchReceipt();
    }
  }, [params.id]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !receipt) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            asChild
          >
            <Link href="/receipts">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Receipt Not Found</h1>
        </div>
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Receipt</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The receipt you are looking for does not exist.'}
            </p>
            <Button asChild>
              <Link href="/receipts">
                <ArrowLeft size={16} />
                Back to Receipts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10" 
          asChild
        >
          <Link href="/receipts">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            Receipt Details
            <Badge variant="secondary" className="font-mono text-xs">
              #{receipt.id}
            </Badge>
          </h1>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-hidden">
        {/* LEFT: Receipt Preview */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl overflow-hidden shadow-sm relative flex flex-col gap-6">
          <ReceiptPreview
            fileUrl={receipt.fileUrl}
            fileType={receipt.fileType}
            fileName={`Receipt ${receipt.id}`}
          />
           {/* Receipt Info Card */}
          {/* <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">File Type</p>
                  <p className="text-sm font-medium">
                    {receipt.extractionMetadata?.isPDF || receipt.fileType === 'application/pdf' ? 'PDF Document' : 'Image'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Document Type</p>
                  <p className="text-sm font-medium capitalize">
                    {receipt.documentType?.replace(/_/g, ' ') || 'Receipt'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Uploaded</p>
                  <p className="text-sm font-medium">{new Date(receipt.uploadedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">File Size</p>
                  <p className="text-sm font-medium">{(receipt.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                {receipt.extractionMetadata?.pageCount && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pages</p>
                    <p className="text-sm font-medium">{receipt.extractionMetadata.pageCount}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* RIGHT: Extraction Results */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
         

          {/* Status Card */}
          <Card className="shadow-sm">
            <CardContent className="">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Placeholder for optional icons/labels */}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tighter text-foreground">
                    {receipt.expectedTransactions} transactions detected
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                     {receipt.processingStatus === 'PROCESSED' || receipt.processingStatus === 'processed' ? (
                       <Badge variant="outline" className="text-emerald-600 bg-emerald-500/5 border-emerald-500/10 gap-1 px-2">
                         <CheckCircle2 size={12} /> Extraction complete
                       </Badge>
                     ) : (
                       <Badge variant="outline" className="text-amber-600 bg-amber-500/5 border-amber-500/10 gap-1 px-2">
                         <Clock size={12} /> {receipt.processingStatus?.replace(/_/g, ' ') || 'Processing'}
                       </Badge>
                     )}
                     {receipt.extractionMetadata?.processingTime && (
                       <>
                         <span>•</span>
                         <span className="flex items-center gap-1"><Clock size={12} /> {receipt.extractionMetadata.processingTime}s</span>
                       </>
                     )}
                  </div>
                </div>

                {receipt.extractionMetadata?.ocrConfidence !== undefined && (
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">OCR Confidence</p>
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-2xl font-bold text-primary">{receipt.extractionMetadata.ocrConfidence}%</span>
                    </div>
                    <Progress value={receipt.extractionMetadata.ocrConfidence} className="h-2 w-32 ml-auto" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Preview */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">Approved Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              {receipt.transactions && receipt.transactions.length > 0 ? (
                <ScrollArea className="h-full max-h-100">
                  <div className="divide-y divide-border">
                    {receipt.transactions.map((txn: any, index: number) => (
                      <div
                        key={txn.id || index}
                        className={cn(
                          "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors",
                          index % 2 !== 0 && "bg-muted/5"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
                          {txn.aiConfidence && (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-8 px-2 font-mono">
                              {Math.round(txn.aiConfidence * 100)}%
                            </Badge>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{txn.description || txn.merchant || 'Transaction'}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.transactionDate ? new Date(txn.transactionDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="font-semibold text-foreground">
                          {formatCurrency(txn.amount || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full min-h-50 text-center p-8">
                  <div>
                    <p className="text-muted-foreground mb-2">No Approved Transaction yet</p>
                    <p className="text-xs text-muted-foreground">
                      Initiate processing to extract approved transactions from this receipt
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-auto pt-2">
            <Button
              variant="outline"
              onClick={() => {}}
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete Receipt</span>
            </Button>
            <Button
              className='flex-1'
              onClick={handleInitiateProcessing}
              disabled={!receipt.expectedTransactions || receipt.expectedTransactions < 1}
            >
              <Zap className="fill-current w-5 h-5" />
              Initiate Transaction Processing
            </Button>
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

              <Card className="p-4 shadow-sm w-full bg-card">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-medium text-foreground">{loadingText}</span>
                  <Badge variant="secondary" className="font-mono">8 items</Badge>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
