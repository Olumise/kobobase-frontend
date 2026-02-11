
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
  AlertCircle,
  FileText,
  MoreVertical,
  AlertTriangle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReceiptPreview } from "@/components/receipts/ReceiptPreview";
import { receiptsApi } from '@/lib/api';
import { useSequentialProcessing } from '@/hooks/useSequentialProcessing';
import { BankAccountSelector } from '@/components/receipts/BankAccountSelector';
import { ReprocessWarningDialog } from '@/components/receipts/ReprocessWarningDialog';
import { DeleteReceiptDialog } from '@/components/receipts/DeleteReceiptDialog';
import type { Transaction, BatchSession } from '@/lib/types/transaction';

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
  transactions: Transaction[];
  batchSessions: BatchSession[];
}

export default function ReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);

  // Session state management
  const [activeBatchSession, setActiveBatchSession] = useState<BatchSession | null>(null);
  const [buttonState, setButtonState] = useState<'process' | 'continue'>('process');
  const [showReprocessWarning, setShowReprocessWarning] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  // Delete state management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extraction state management
  const [isExtracting, setIsExtracting] = useState(false);

  // SSE Progress Hook
  const {
    progress,
    message: progressMessage,
    step: progressStep,
    isProcessing,
    result: processingResult,
    error: processingError,
    initiateProcessing,
  } = useSequentialProcessing();

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

  // Check for existing batch session and determine button state
  useEffect(() => {
    const checkSessionState = async () => {
      if (!receipt?.id) return;

      try {
        setIsCheckingSession(true);

        // Find the most recent in-progress batch session
        const relevantSession = receipt.batchSessions
          ?.filter((session: BatchSession) => session.status === 'in_progress')
          .sort((a: BatchSession, b: BatchSession) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

        setActiveBatchSession(relevantSession || null);

        // Determine button state - only show "continue" for in-progress sessions
        if (
          relevantSession &&
          relevantSession.status === 'in_progress' &&
          relevantSession.extractedData?.transaction_results &&
          relevantSession.extractedData.transaction_results.length > 0
        ) {
          // Check if there are any skipped or unprocessed transactions
          const hasSkippedOrUnprocessed = relevantSession.extractedData.transaction_results.some(
            (txn: any) => txn.processing_status === 'skipped' || !txn.processing_status ||
            (txn.processing_status !== 'approved' && txn.processing_status !== 'skipped')
          );

          // Has in-progress session with pending work - allow continuation
          if (hasSkippedOrUnprocessed) {
            setButtonState('continue');
          } else {
            // All transactions are approved - no need to continue
            setButtonState('process');
          }
        } else {
          // No in-progress session - show process
          setButtonState('process');
        }
      } catch (error) {
        console.error('Error checking session state:', error);
        setButtonState('process'); // Default to safe state
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSessionState();
  }, [receipt?.id, receipt?.batchSessions, receipt?.transactions]);

  const handleProcessButtonClick = () => {
    if (!receipt?.id) return;

    switch (buttonState) {
      case 'continue':
        // Navigate directly to existing session
        if (activeBatchSession) {
          router.push(`/transactions/sequential/${activeBatchSession.id}`);
        }
        break;

      case 'process':
      default:
        // Show bank selector to start new processing
        setShowBankSelector(true);
        break;
    }
  };

  const handleReprocessClick = () => {
    setShowReprocessWarning(true);
  };

  const handleReprocessConfirm = async () => {
    // User confirmed deletion - proceed with bank selector
    setShowReprocessWarning(false);
    setShowBankSelector(true);
  };

  const handleBankAccountSelected = async (bankAccountId: string) => {
    if (!receipt?.id) return;

    // Close the bank selector
    setShowBankSelector(false);

    // Start the SSE processing
    await initiateProcessing(receipt.id, bankAccountId);
  };

  const handleDeleteReceipt = async () => {
    if (!receipt?.id) return;

    try {
      setIsDeleting(true);
      await receiptsApi.deleteReceipt(receipt.id);

      // Close dialog and navigate back to receipts list
      setShowDeleteDialog(false);
      router.push('/receipts');
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      // You could add a toast notification here
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExtractReceipt = async () => {
    if (!receipt?.id) return;

    try {
      setIsExtracting(true);
      const extractResponse = await receiptsApi.extractReceipt(receipt.id);

      // Check if no transactions were detected
      if (extractResponse.detection.transaction_count === 0) {
        // Show error or redirect with error message
        console.error('No transactions found:', extractResponse.detection.notes);
        setIsExtracting(false);
        return;
      }

      // Reload the page to show updated receipt data
      window.location.reload();
    } catch (error: any) {
      console.error('Error extracting receipt:', error);
      setIsExtracting(false);
    }
  };

  // Handle processing completion
  useEffect(() => {
    if (processingResult?.batch_session_id) {
      // Navigate to the sequential processing page with the batch session ID
      router.push(`/transactions/sequential/${processingResult.batch_session_id}`);
    }
  }, [processingResult, router]);

  // Handle processing errors
  useEffect(() => {
    if (processingError) {
      console.error('Processing error:', processingError);
      // You could add a toast notification here
    }
  }, [processingError]);

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
    const receiptId = params.id as string;

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
          <h1 className="text-xl font-semibold text-foreground">Unable to Load Receipt</h1>
        </div>
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12 max-w-2xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Receipt</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The receipt you are looking for does not exist.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/receipts">
                  <ArrowLeft size={16} />
                  Back to Receipts
                </Link>
              </Button>
              {receiptId && (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      setIsDeleting(true);
                      await receiptsApi.deleteReceipt(receiptId);
                      router.push('/receipts');
                    } catch (err) {
                      console.error('Error deleting receipt:', err);
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete Receipt'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog for error state */}
        <DeleteReceiptDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteReceipt}
          transactionCount={0}
          isDeleting={isDeleting}
        />
      </div>
    );
  }

  // Check if receipt is pending and needs extraction
  const needsExtraction = receipt.processingStatus === 'pending' && !receipt.rawOcrText;

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
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            Receipt Details
            <Badge variant="secondary" className="font-mono text-xs">
              #{receipt.id.slice(0, 8)}...
            </Badge>
          </h1>
        </div>
        <Badge
          variant={
            receipt.processingStatus === 'processed' ? 'default' :
            receipt.processingStatus === 'processing' ? 'secondary' :
            receipt.processingStatus === 'failed' ? 'destructive' :
            'outline'
          }
          className={cn(
            "capitalize",
            receipt.processingStatus === 'processed' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            receipt.processingStatus === 'processing' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
            receipt.processingStatus === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}
        >
          {receipt.processingStatus}
        </Badge>
      </div>

      {/* Pending Extraction State - Simplified View */}
      {needsExtraction ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12 max-w-lg">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Receipt Awaiting Extraction</h2>
            <p className="text-muted-foreground mb-8">
              This receipt has been uploaded but hasn't been processed yet. Extract the receipt to analyze and detect transactions from the document.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                Delete Receipt
              </Button>
              <Button
                size="lg"
                onClick={handleExtractReceipt}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Extract Receipt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
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

          {/* Status Card - Show session progress or approved count */}
          {(activeBatchSession?.extractedData?.transaction_results || (receipt.transactions && receipt.transactions.length > 0)) && (
            <Card className="shadow-sm">
              <CardContent className="">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {/* Placeholder for optional icons/labels */}
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tighter text-foreground">
                      {activeBatchSession?.extractedData?.transaction_results ? (
                        <>
                          {activeBatchSession.extractedData.transaction_results.length} transaction{activeBatchSession.extractedData.transaction_results.length !== 1 ? 's' : ''} detected
                        </>
                      ) : (
                        <>
                          {receipt.transactions.length} approved transaction{receipt.transactions.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                      {activeBatchSession?.extractedData?.transaction_results ? (
                        <Badge variant="outline" className="text-blue-600 bg-blue-500/5 border-blue-500/10 gap-1 px-2">
                          <Loader2 size={12} className="animate-spin" /> In Progress ({activeBatchSession.totalProcessed || 0} of {activeBatchSession.totalExpected} processed)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-500/5 border-emerald-500/10 gap-1 px-2">
                          <CheckCircle2 size={12} /> Approved
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
          )}

          {/* Approved Transactions */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">Approved Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              {receipt.transactions && receipt.transactions.length > 0 ? (
                <ScrollArea className="h-full max-h-100">
                  <div className="divide-y divide-border">
                    {receipt.transactions.map((txn: Transaction, index: number) => {
                      return (
                        <div
                          key={txn.id}
                          className={cn(
                            "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors",
                            index % 2 !== 0 && "bg-muted/5"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">
                                {txn.description || txn.contact?.name || 'Transaction'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {txn.transactionDate
                                  ? new Date(txn.transactionDate).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(txn.amount || 0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full min-h-50 text-center p-8">
                  <div>
                    <p className="text-muted-foreground mb-2">No Approved Transactions Yet</p>
                    <p className="text-xs text-muted-foreground">
                      Initiate processing to extract and approve transactions from this receipt
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
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete Receipt</span>
            </Button>

            {/* Hamburger Menu - Show when there are approved transactions or an active session */}
            {(receipt.transactions.length > 0 || activeBatchSession) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleReprocessClick}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <AlertTriangle size={16} className="mr-2" />
                    Re-process Receipt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {receipt.processingStatus === 'pending' && !receipt.rawOcrText ? (
              <Button
                className='flex-1'
                onClick={handleExtractReceipt}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Extract Receipt
                  </>
                )}
              </Button>
            ) : (
              <Button
                className='flex-1'
                onClick={handleProcessButtonClick}
                disabled={
                  !receipt.expectedTransactions ||
                  receipt.expectedTransactions < 1 ||
                  isCheckingSession ||
                  isProcessing
                }
              >
                <Zap className="fill-current w-5 h-5" />
                {isCheckingSession ? (
                  'Checking...'
                ) : buttonState === 'continue' && activeBatchSession ? (
                  (() => {
                    const skippedCount = activeBatchSession.extractedData?.transaction_results?.filter(
                      (txn: any) => txn.processing_status === 'skipped'
                    ).length || 0;

                    if (skippedCount > 0) {
                      return `Continue Approval (${skippedCount} skipped)`;
                    }
                    return `Continue Approval (${activeBatchSession.currentIndex || 0} of ${activeBatchSession.totalExpected})`;
                  })()
                ) : (
                  'Initiate Transaction Processing'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Bank Account Selector Modal */}
      <BankAccountSelector
        isOpen={showBankSelector}
        onClose={() => setShowBankSelector(false)}
        onSelect={handleBankAccountSelected}
        isLoading={isProcessing}
      />

      {/* Re-process Warning Dialog */}
      <ReprocessWarningDialog
        isOpen={showReprocessWarning}
        onClose={() => setShowReprocessWarning(false)}
        onConfirm={handleReprocessConfirm}
        transactionCount={receipt?.transactions?.length || 0}
        isProcessing={isProcessing}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteReceiptDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteReceipt}
        transactionCount={receipt?.transactions?.length || 0}
        isDeleting={isDeleting}
      />

      {/* Full Screen Loading Modal with SSE Progress */}
      <AnimatePresence>
        {isProcessing && (
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
                <h2 className="text-2xl font-semibold text-foreground">Processing Transactions</h2>
                <p className="text-muted-foreground">Please wait while we extract and analyze your transactions...</p>
              </div>

              <Card className="p-4 shadow-sm w-full bg-card">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-medium text-foreground">{progressMessage || 'Initializing...'}</span>
                  <Badge variant="secondary" className="font-mono">{progress}%</Badge>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>

                {/* Step indicator */}
                {progressStep && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                      <span className="capitalize">{progressStep?.replace(/_/g, ' ') || ''}</span>
                    </div>
                  </div>
                )}
              </Card>

              {processingError && (
                <Card className="p-4 shadow-sm w-full bg-destructive/5 border-destructive/20">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle size={16} />
                    <span className="font-medium">{processingError}</span>
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
