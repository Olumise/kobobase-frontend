'use client';

import { Check, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Transaction {
	transaction_index: number;
	needs_clarification?: boolean;
	needs_confirmation?: boolean;
	confidence_score?: number;
	processing_status?: 'approved' | 'skipped' | undefined;
	created_transaction_id?: string | null;
	transaction?: {
		amount?: number;
		description?: string;
	};
}

interface TransactionStepperProps {
	transactions: Transaction[];
	currentIndex: number;
	onNavigate: (index: number) => void;
	isLoading?: boolean;
}

export function TransactionStepper({
	transactions,
	currentIndex,
	onNavigate,
	isLoading = false
}: TransactionStepperProps) {
	const progressValue = transactions.length > 1
		? (currentIndex / (transactions.length - 1)) * 100
		: 0;

	const getTransactionState = (txn: Transaction) => {
		if (txn.processing_status === 'approved') return 'approved';
		if (txn.processing_status === 'skipped') return 'skipped';
		if (txn.needs_clarification) return 'clarification';
		if (txn.needs_confirmation) return 'confirmation';
		return 'ready';
	};

	const getStateIcon = (state: string) => {
		switch (state) {
			case 'clarification':
				return AlertTriangle;
			case 'confirmation':
				return Info;
			default:
				return Check;
		}
	};

	const getStateColor = (state: string, isActive: boolean, isCompleted: boolean) => {
		if (state === 'approved') {
			return isActive
				? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
				: 'bg-emerald-500 text-white border-emerald-500';
		}

		if (state === 'skipped') {
			return isActive
				? 'bg-gray-500 text-white border-gray-500 ring-2 ring-gray-300'
				: 'bg-gray-400 text-white border-gray-400';
		}

		if (isActive) {
			switch (state) {
				case 'clarification':
					return 'bg-amber-500 text-white border-amber-500';
				case 'confirmation':
					return 'bg-blue-500 text-white border-blue-500';
				default:
					return 'bg-primary text-primary-foreground border-primary';
			}
		}

		if (isCompleted) {
			return 'bg-emerald-500 text-white border-emerald-500';
		}

		return 'bg-muted text-muted-foreground border-muted';
	};

	return (
		<TooltipProvider>
			<div className="w-full py-4 px-2">
				<div className="relative flex justify-between items-start">
					{/* Background Line */}
					<div
						className="absolute top-5 left-0 right-0 h-0.5 bg-muted"
						style={{ left: '5%', right: '5%' }}
					/>

					{/* Progress Line */}
					<motion.div
						className="absolute top-5 h-0.5 bg-primary"
						style={{ left: '5%' }}
						initial={{ width: 0 }}
						animate={{ width: `calc(${progressValue}% * 0.9)` }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					/>

					{transactions.map((txn, index) => {
						const isCompleted = index < currentIndex;
						const isActive = index === currentIndex;
						const state = getTransactionState(txn);
						const StateIcon = getStateIcon(state);
						const canNavigate = !isLoading;

						return (
							<Tooltip key={txn.transaction_index}>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center flex-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => canNavigate && onNavigate(index)}
											disabled={!canNavigate}
											className={cn(
												"relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-4 border-background",
												getStateColor(state, isActive, isCompleted),
												canNavigate && "hover:scale-110 cursor-pointer",
												isActive && "shadow-lg scale-110"
											)}
										>
											{isCompleted && !isActive ? (
												<Check size={18} />
											) : (
												<span>{index + 1}</span>
											)}
										</Button>

										{/* Active indicator dot */}
										{isActive && (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="w-2 h-2 rounded-full bg-primary mt-1"
											/>
										)}
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<div className="text-xs space-y-1">
										<p className="font-semibold">Transaction {index + 1}</p>
										{txn.transaction?.description && (
											<p className="text-muted-foreground max-w-50 truncate">
												{txn.transaction.description}
											</p>
										)}
										{txn.transaction?.amount && (
											<p className="font-medium">
												${txn.transaction.amount.toLocaleString()}
											</p>
										)}
										{state === 'approved' && (
											<p className="text-emerald-600 font-medium">✓ Approved</p>
										)}
										{state === 'skipped' && (
											<p className="text-gray-600 font-medium">⏭ Skipped</p>
										)}
										{state === 'clarification' && (
											<p className="text-amber-500">Needs clarification</p>
										)}
										{state === 'confirmation' && (
											<p className="text-blue-500">Needs confirmation</p>
										)}
										{txn.created_transaction_id && (
											<p className="text-muted-foreground font-mono text-[10px]">
												ID: {txn.created_transaction_id.slice(0, 8)}...
											</p>
										)}
										{txn.confidence_score && !txn.processing_status && (
											<p className="text-muted-foreground">
												{Math.round(txn.confidence_score * 100)}% confidence
											</p>
										)}
									</div>
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>
			</div>
		</TooltipProvider>
	);
}
