"use client";

import { useState } from "react";
import { Calendar, User as UserIcon, Tag, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TransactionDetail } from "@/lib/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";
import { transactionsApi } from "@/lib/api";

interface ChatTransactionCardProps {
	transaction: TransactionDetail;
}

export function ChatTransactionCard({ transaction }: ChatTransactionCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fullTransaction, setFullTransaction] = useState<TransactionDetail | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		try {
			setIsLoading(true);

			// Fetch full transaction details from API
			const response = await transactionsApi.getTransactionById(transaction.id);
			const txnData = response.data?.data || response.data;

			setFullTransaction(txnData);
			setIsModalOpen(true);
		} catch (err: any) {
			console.error("Failed to fetch transaction details:", err);
			// Fallback to showing partial data if API fails
			setFullTransaction(transaction);
			setIsModalOpen(true);
		} finally {
			setIsLoading(false);
		}
	};

	// These handlers are required by TransactionDetailModal but not used in chat context
	const handleEdit = (txn: TransactionDetail) => {
		console.log("Edit transaction:", txn.id);
		setIsModalOpen(false);
		// Note: Edit functionality could be added later if needed
	};

	const handleDelete = (txn: TransactionDetail) => {
		console.log("Delete transaction:", txn.id);
		setIsModalOpen(false);
		// Note: Delete functionality could be added later if needed
	};

	return (
		<>
			<Card
				className="cursor-pointer hover:shadow-md transition-shadow border-border relative"
				onClick={handleClick}
			>
				<CardContent className="p-3">
					<div className="space-y-2">
						{/* Amount and Type */}
						<div className="flex items-center justify-between">
							<span
								className={`text-base font-semibold ${
									transaction.transactionType === "INCOME"
										? "text-green-600 dark:text-green-400"
										: transaction.transactionType === "EXPENSE"
										? "text-rose-600 dark:text-rose-400"
										: "text-blue-600 dark:text-blue-400"
								}`}
							>
								{transaction.transactionType === "INCOME" ? "+" : "-"}
								{formatCurrency(transaction.amount, transaction.currency)}
							</span>
							<Badge variant="outline" className="text-xs">
								{transaction.transactionType}
							</Badge>
						</div>

						{/* Description/Summary */}
						<p className="text-sm text-foreground line-clamp-1">
							{transaction.summary || transaction.description || "No description"}
						</p>

						{/* Category and Contact */}
						<div className="flex items-center gap-3 text-xs text-muted-foreground">
							{transaction.category && (
								<div className="flex items-center gap-1">
									<Tag size={12} />
									<span className="line-clamp-1">{transaction.category.name}</span>
								</div>
							)}
							{transaction.contact && (
								<div className="flex items-center gap-1">
									<UserIcon size={12} />
									<span className="line-clamp-1">{transaction.contact.name}</span>
								</div>
							)}
						</div>

						{/* Date */}
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<Calendar size={12} />
							<span>{format(new Date(transaction.transactionDate), "MMM dd, yyyy")}</span>
						</div>
					</div>

					{/* Loading Overlay */}
					{isLoading && (
						<div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Transaction Detail Modal */}
			{fullTransaction && (
				<TransactionDetailModal
					transaction={fullTransaction}
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
