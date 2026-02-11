"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	MessageSquare,
	Save,
	CheckCircle2,
	Sparkles,
	Loader2,
	AlertCircle,
} from "lucide-react";
import {
	TransactionReviewCard,
	TransactionState,
} from "@/components/sequential/TransactionReviewCard";
import { ClarificationChat } from "@/components/sequential/ClarificationChat";
import { TransactionStepper } from "@/components/sequential/TransactionStepper";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { transactionsApi } from "@/lib/api";
import type {
	BatchSession,
	TransactionExtraction,
	ReviewTransaction,
} from "@/lib/types/transaction";

export default function SequentialProcessingPage() {
	const params = useParams();
	const router = useRouter();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [processState, setProcessState] = useState<
		Record<string, TransactionState>
	>({});

	// Batch session state
	const [batchSession, setBatchSession] = useState<BatchSession | null>(null);
	const [transactions, setTransactions] = useState<ReviewTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isApproving, setIsApproving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch batch session data
	const fetchBatchSession = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const batchSessionId = params.id as string;
			const response =
				await transactionsApi.getBatchSessionInfo(batchSessionId);
			const sessionData: BatchSession = response.data.data;
			setBatchSession(sessionData);

			if (sessionData.extractedData?.transaction_results) {
				setTransactions(sessionData.extractedData.transaction_results);

				setCurrentIndex(sessionData.currentIndex || 0);
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to load batch session");
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch batch session data on mount
	useEffect(() => {
		if (params.id) {
			fetchBatchSession();
		}
	}, [params.id]);

	// Helper function to calculate session statistics
	const getSessionStats = () => {
		const total = transactions.length;
		const approved = transactions.filter(t => t.processing_status === "approved").length;
		const skipped = transactions.filter(t => t.processing_status === "skipped").length;
		const unprocessed = total - approved - skipped;
		const hasRemainingWork = unprocessed > 0 || skipped > 0;

		return { total, approved, skipped, unprocessed, hasRemainingWork };
	};

	const currentTxn = transactions[currentIndex];

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input/textarea
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			if (e.key === "ArrowLeft" && currentIndex > 0 && !isLoading) {
				e.preventDefault();
				handleBack();
			} else if (
				e.key === "ArrowRight" &&
				currentIndex < transactions.length - 1 &&
				!isLoading &&
				currentTxn &&
				(currentTxn.processing_status === "approved" || currentTxn.processing_status === "skipped")
			) {
				e.preventDefault();
				handleNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentIndex, transactions.length, isLoading, currentTxn]);

	const handleApprove = async (edits?: any) => {
		if (!batchSession?.id) return;

		try {
			setIsApproving(true);
			const previousIndex = currentIndex;
			await transactionsApi.approveAndNext(batchSession.id, edits);

			await fetchBatchSession();

			const stats = getSessionStats();

			// If we're at the last index position
			if (previousIndex >= transactions.length - 1) {
				// Check if there's remaining work
				if (stats.hasRemainingWork) {
					// Find first unprocessed or skipped transaction
					const nextIndex = transactions.findIndex(t =>
						!t.processing_status || t.processing_status === "skipped"
					);

					if (nextIndex !== -1) {
						// Navigate to first remaining transaction
						try {
							setIsLoading(true);
							await transactionsApi.getTransactionByIndex(batchSession.id, nextIndex);
							setCurrentIndex(nextIndex);
							setError(null);
						} catch (err: any) {
							console.error("Error navigating to remaining transaction:", err);
							setError(err.response?.data?.message || "Failed to navigate to remaining transaction");
						} finally {
							setIsLoading(false);
						}
						return;
					}
				}

				// Only complete session if ALL transactions are approved
				if (stats.approved === stats.total) {
					await transactionsApi.completeSession(batchSession.id);
					router.push("/receipts");
					return;
				}
			} else {
				// Normal flow: navigate to next transaction
				const targetIndex = previousIndex + 1;
				try {
					setIsLoading(true);
					await transactionsApi.getTransactionByIndex(batchSession.id, targetIndex);
					setCurrentIndex(targetIndex);
					setError(null);
				} catch (err: any) {
					console.error("Error navigating to next transaction:", err);
					setError(err.response?.data?.message || "Failed to navigate to next transaction");
				} finally {
					setIsLoading(false);
				}
			}
		} catch (err: any) {
			console.error("Error approving transaction:", err);
			setError(err.response?.data?.message || "Failed to approve transaction");
		} finally {
			setIsApproving(false);
		}
	};

	const handleSkip = async () => {
		if (!batchSession?.id) return;

		try {
			setIsApproving(true);
			const previousIndex = currentIndex;
			await transactionsApi.skipTransaction(batchSession.id);

			// Refetch batch session to get updated data
			await fetchBatchSession();

			const stats = getSessionStats();

			// If we're at the last index position
			if (previousIndex >= transactions.length - 1) {
				// Check if there's remaining work
				if (stats.hasRemainingWork) {
					// Find first unprocessed or skipped transaction
					const nextIndex = transactions.findIndex(t =>
						!t.processing_status || t.processing_status === "skipped"
					);

					if (nextIndex !== -1) {
						// Navigate to first remaining transaction
						try {
							setIsLoading(true);
							await transactionsApi.getTransactionByIndex(batchSession.id, nextIndex);
							setCurrentIndex(nextIndex);
							setError(null);
						} catch (err: any) {
							console.error("Error navigating to remaining transaction:", err);
							setError(err.response?.data?.message || "Failed to navigate to remaining transaction");
						} finally {
							setIsLoading(false);
						}
						return;
					}
				}

				// Only complete session if ALL transactions are approved
				if (stats.approved === stats.total) {
					await transactionsApi.completeSession(batchSession.id);
					router.push("/receipts");
					return;
				}
			} else {
				// Normal flow: navigate to next transaction
				const targetIndex = previousIndex + 1;
				try {
					setIsLoading(true);
					await transactionsApi.getTransactionByIndex(batchSession.id, targetIndex);
					setCurrentIndex(targetIndex);
					setError(null);
				} catch (err: any) {
					console.error("Error navigating to next transaction:", err);
					setError(err.response?.data?.message || "Failed to navigate to next transaction");
				} finally {
					setIsLoading(false);
				}
			}
		} catch (err: any) {
			console.error("Error skipping transaction:", err);
			setError(err.response?.data?.message || "Failed to skip transaction");
		} finally {
			setIsApproving(false);
		}
	};

	const handleBack = async () => {
		if (!batchSession?.id || currentIndex === 0) return;

		try {
			setIsLoading(true);
			const targetIndex = currentIndex - 1;
			await transactionsApi.getTransactionByIndex(batchSession.id, targetIndex);
			setCurrentIndex(targetIndex);
			setError(null);
		} catch (err: any) {
			console.error("Error navigating to previous transaction:", err);
			setError(err.response?.data?.message || "Failed to navigate to previous transaction");
		} finally {
			setIsLoading(false);
		}
	};

	const handleNext = async () => {
		if (!batchSession?.id || currentIndex >= transactions.length - 1) return;

		// Check if current transaction is approved or skipped before allowing next
		const canProceed = currentTxn?.processing_status === "approved" || currentTxn?.processing_status === "skipped";
		if (!canProceed) {
			setError("Please approve or skip the current transaction before proceeding to the next one.");
			return;
		}

		try {
			setIsLoading(true);
			const targetIndex = currentIndex + 1;
			await transactionsApi.getTransactionByIndex(batchSession.id, targetIndex);
			setCurrentIndex(targetIndex);
			setError(null);
		} catch (err: any) {
			console.error("Error navigating to next transaction:", err);
			setError(err.response?.data?.message || "Failed to navigate to next transaction");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToIndex = async (index: number) => {
		if (!batchSession?.id || index < 0 || index >= transactions.length) return;

		try {
			setIsLoading(true);
			await transactionsApi.getTransactionByIndex(batchSession.id, index);
			setCurrentIndex(index);
			setError(null);
		} catch (err: any) {
			console.error("Error navigating to transaction:", err);
			setError(err.response?.data?.message || "Failed to navigate to transaction");
		} finally {
			setIsLoading(false);
		}
	};

	// Prioritize data quality state over processing status
	// This ensures clarification/confirmation alerts show even for skipped/approved transactions
	const currentTxnState: TransactionState =
		currentTxn?.needs_clarification
			? "CLARIFICATION_NEEDED"
			: currentTxn?.needs_confirmation
				? "NEEDS_CONFIRMATION"
				: currentTxn?.processing_status === "approved"
					? "APPROVED"
					: currentTxn?.processing_status === "skipped"
						? "SKIPPED"
						: "READY";

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="w-8 h-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading batch session...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !batchSession || transactions.length === 0) {
	
		return (
			<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
				<Card className="p-8 max-w-md">
					<div className="flex flex-col items-center gap-4 text-center">
						<AlertCircle className="w-12 h-12 text-destructive" />
						<h2 className="text-xl font-semibold">Unable to Load Session</h2>
						<p className="text-muted-foreground">
							{error ||
								"The batch session you are looking for does not exist or has no transactions."}
						</p>
						<Button
							onClick={() => router.push("/receipts")}
							className="mt-4">
							<ArrowLeft size={16} />
							Back to Receipts
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-8rem)] flex flex-col">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full"
						onClick={() => router.push(`/receipts/${batchSession.receiptId}`)}>
						<ArrowLeft size={20} />
					</Button>
					<div>
						<h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
							Review Session
							<Badge
								variant="secondary"
								className="font-mono text-xs">
								{batchSession.id.slice(0, 8)}...
							</Badge>
						</h1>
						<p className="text-sm text-muted-foreground">
							Review and approve {batchSession.totalExpected} extracted
							transactions
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="gap-2 hidden sm:flex"
						onClick={() => router.push(`/receipts/${batchSession.receiptId}`)}>
						<Save size={16} /> Save Draft
					</Button>
					<Button
						className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
						onClick={async () => {
							await transactionsApi.completeSession(batchSession.id);
							router.push("/receipts");
						}}>
						<CheckCircle2 size={16} /> Finish Session
					</Button>
				</div>
			</div>

			{/* Transaction Progress Counter */}
			<Card className="p-4 mb-8 bg-card/50 border-dashed">
				<div className="flex items-center justify-center gap-2 mb-4">
					<span className="text-sm text-muted-foreground">Transaction</span>
					<span className="text-2xl font-bold text-foreground">
						{currentIndex + 1}
					</span>
					<span className="text-sm text-muted-foreground">of</span>
					<span className="text-2xl font-semibold text-muted-foreground">
						{transactions.length}
					</span>
				</div>

				{/* Transaction Stepper */}
				<TransactionStepper
					transactions={transactions}
					currentIndex={currentIndex}
					onNavigate={handleGoToIndex}
					isLoading={isLoading}
				/>
			</Card>

			<div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full pb-12">
				{currentTxn ? (
					<AnimatePresence mode="wait">
						<motion.div
							key={currentTxn.transaction_index}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="w-full">
							<TransactionReviewCard
								transaction={currentTxn}
								state={currentTxnState}
								onApprove={handleApprove}
								onSkip={handleSkip}
								onClarify={() => setIsChatOpen(true)}
								isApproving={isApproving}
							/>
						</motion.div>
					</AnimatePresence>
				) : (
					<div className="flex items-center justify-center">
						<p className="text-muted-foreground">Loading transaction...</p>
					</div>
				)}

				{/* Navigation Info */}
				<div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-12 text-sm text-muted-foreground font-medium">
					<button
						onClick={handleBack}
						disabled={currentIndex === 0 || isLoading}
						className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors">
						<ChevronLeft size={16} />
						<span className="hidden sm:inline">Previous</span>
						<kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded border hidden sm:inline-block">
							←
						</kbd>
					</button>

					<div className="flex items-center gap-2">
						<Sparkles
							size={14}
							className="text-primary"
						/>
						<span className="hidden lg:inline">AI Assisted Verification Active</span>
						<span className="lg:hidden">AI Active</span>
					</div>

					<button
						onClick={handleNext}
						disabled={
							currentIndex === transactions.length - 1 ||
							isLoading ||
							!currentTxn ||
							(currentTxn.processing_status !== "approved" && currentTxn.processing_status !== "skipped")
						}
						className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors">
						<kbd className="mr-1 px-1.5 py-0.5 text-xs bg-muted rounded border hidden sm:inline-block">
							→
						</kbd>
						<span className="hidden sm:inline">Next</span>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
			{currentTxn?.clarification_session_id && (
				<ClarificationChat
					TxnIndex={currentTxn.transaction_index}
					clarificationId={currentTxn?.clarification_session_id}
					isOpen={isChatOpen}
					onClose={() => {
						setIsChatOpen(false);
						fetchBatchSession();
					}}
					onComplete={() => {
						setIsChatOpen(false);
						fetchBatchSession();
					}}
				/>
			)}

			{/* Floating Chat Trigger (Mobile Only) */}
			<Button
				size="icon"
				className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl lg:hidden"
				onClick={() => setIsChatOpen(true)}>
				<MessageSquare size={24} />
			</Button>
		</div>
	);
}
