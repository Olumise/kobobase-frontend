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

	const currentTxn = transactions[currentIndex];

	const handleApprove = async () => {
		if (!batchSession?.id) return;

		try {
			await transactionsApi.approveAndNext(batchSession.id);

			if (currentIndex < transactions.length - 1) {
				setCurrentIndex((prev) => prev + 1);
			} else {
				await transactionsApi.completeSession(batchSession.id);
				router.push("/receipts");
			}
		} catch (err: any) {
			console.error("Error approving transaction:", err);
		}
	};

	const handleBack = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
		}
	};

	const currentTxnState = currentTxn?.needs_clarification
		? `CLARIFICATION_NEEDED`
		: currentTxn?.needs_confirmation
			? "NEEDS_CONFIRMATION"
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
				<div className="flex items-center justify-center gap-2">
					<span className="text-sm text-muted-foreground">Transaction</span>
					<span className="text-2xl font-bold text-foreground">
						{currentIndex + 1}
					</span>
					<span className="text-sm text-muted-foreground">of</span>
					<span className="text-2xl font-semibold text-muted-foreground">
						{transactions.length}
					</span>
				</div>
			</Card>

			<div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full pb-12">
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
						className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors">
						<ChevronLeft size={16} /> Previous
					</button>

					<div className="flex items-center gap-2">
						<Sparkles
							size={14}
							className="text-primary"
						/>
						<span>AI Assisted Verification Active</span>
					</div>

					<button
						onClick={handleApprove}
						disabled={currentIndex === transactions.length - 1}
						className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors">
						Next <ChevronRight size={16} />
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
