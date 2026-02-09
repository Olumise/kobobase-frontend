"use client";

import { useState, useEffect } from "react";
import {
	Check,
	AlertTriangle,
	Info,
	SkipForward,
	ChevronDown,
	Sparkles,
	Calendar as CalendarIcon,
	Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { contactsApi, categoriesApi, transactionsApi } from "@/lib/api";

export type TransactionState =
	| "READY"
	| "CLARIFICATION_NEEDED"
	| "NEEDS_CONFIRMATION"
	| "APPROVED"
	| "SKIPPED";

interface BankAccount {
	id: string;
	accountName: string;
	accountNumber: string;
	bankName: string;
	currency: string;
}

interface TransactionEdits {
	categoryId?: string;
	contactId?: string;
	userBankAccountId?: string;
	toBankAccountId?: string;
	amount?: number;
	description?: string;
	transactionDate?: string;
	paymentMethod?: string;
}

interface TransactionReviewCardProps {
	transaction: any;
	state: TransactionState;
	onApprove: (edits?: TransactionEdits) => void;
	onSkip: () => void;
	onClarify: () => void;
	isApproving?: boolean;
}

const paymentMethods = [
	{ label: "Cash Payment", value: "cash" },
	{ label: "Bank Transfer", value: "transfer" },
	{ label: "Card Payment", value: "card" }
];

export function TransactionReviewCard({
	transaction,
	state,
	onApprove,
	onSkip,
	onClarify,
	isApproving = false,
}: TransactionReviewCardProps) {

	const [contacts, setContacts] = useState<any[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const [isLoadingContacts, setIsLoadingContacts] = useState(false);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);
	const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
	const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);

	const [description, setDescription] = useState<string>(
		transaction?.transaction?.description || ""
	);
	const [selectedCategory, setSelectedCategory] = useState<string>(
		transaction?.enrichment_data?.category_id || ""
	);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		transaction?.transaction?.time_sent
			? new Date(transaction.transaction.time_sent)
			: undefined
	);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
		transaction?.transaction?.payment_method || ""
	);
	const [selectedContact, setSelectedContact] = useState<string>(
		transaction?.enrichment_data?.contact_id || ""
	);
	const [selectedUserBankAccount, setSelectedUserBankAccount] = useState<string>(
		transaction?.enrichment_data?.user_bank_account_id || ""
	);
	const [selectedToBankAccount, setSelectedToBankAccount] = useState<string>(
		transaction?.enrichment_data?.to_bank_account_id || ""
	);

	useEffect(() => {
		const fetchContacts = async () => {
			setIsLoadingContacts(true);
			try {
				const response = await contactsApi.getAllContacts();
				setContacts(response.data.data);
			} catch (error) {
				console.error("Failed to fetch contacts:", error);
			} finally {
				setIsLoadingContacts(false);
			}
		};

		const fetchCategories = async () => {
			setIsLoadingCategories(true);
			try {
				const response = await categoriesApi.getAllCategories();
				setCategories(response.data.data.categories);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			} finally {
				setIsLoadingCategories(false);
			}
		};

		const fetchBankAccounts = async () => {
			setIsLoadingBankAccounts(true);
			try {
				const response = await transactionsApi.getUserBankAccounts();
				const accounts = response.data.data?.accounts || response.data.accounts || [];
				setBankAccounts(accounts);
			} catch (error) {
				console.error("Failed to fetch bank accounts:", error);
				setBankAccounts([]);
			} finally {
				setIsLoadingBankAccounts(false);
			}
		};

		fetchContacts();
		fetchCategories();
		fetchBankAccounts();
	}, []);

	useEffect(() => {
		if (transaction?.transaction?.description) {
			setDescription(transaction.transaction.description);
		}
	}, [transaction?.transaction?.description]);

	useEffect(() => {
		if (transaction?.enrichment_data?.category_id) {
			setSelectedCategory(transaction.enrichment_data.category_id);
		}
	}, [transaction?.enrichment_data?.category_id]);

	useEffect(() => {
		if (transaction?.transaction?.time_sent) {
			setSelectedDate(new Date(transaction.transaction.time_sent));
		}
	}, [transaction?.transaction?.time_sent]);

	useEffect(() => {
		if (transaction?.transaction?.payment_method) {
			setSelectedPaymentMethod(transaction.transaction.payment_method);
		}
	}, [transaction?.transaction?.payment_method]);

	useEffect(() => {
		if (transaction?.enrichment_data?.contact_id) {
			setSelectedContact(transaction.enrichment_data.contact_id);
		}
	}, [transaction?.enrichment_data?.contact_id]);

	useEffect(() => {
		if (transaction?.enrichment_data?.user_bank_account_id) {
			setSelectedUserBankAccount(transaction.enrichment_data.user_bank_account_id);
		}
	}, [transaction?.enrichment_data?.user_bank_account_id]);

	useEffect(() => {
		if (transaction?.enrichment_data?.to_bank_account_id) {
			setSelectedToBankAccount(transaction.enrichment_data.to_bank_account_id);
		}
	}, [transaction?.enrichment_data?.to_bank_account_id]);

	const getHeaderConfig = () => {
		switch (state) {
			case "READY":
				return {
					variant: "default" as const,
					className: "bg-primary/10 text-primary border-primary",
					icon: Check,
					text: "Ready to approve",
				};
			case "CLARIFICATION_NEEDED":
				return {
					variant: "outline" as const,
					className: "bg-amber-400/10 text-amber-400 border-amber-400",
					icon: AlertTriangle,
					text: "Clarification needed",
				};
			case "NEEDS_CONFIRMATION":
				return {
					variant: "secondary" as const,
					className: "bg-blue-500/10 text-blue-400 border-blue-400",
					icon: Info,
					text: "Action required",
				};
			case "APPROVED":
				return {
					variant: "default" as const,
					className: "bg-emerald-500/10 text-emerald-600 border-emerald-500",
					icon: Check,
					text: "Already approved",
				};
			case "SKIPPED":
				return {
					variant: "secondary" as const,
					className: "bg-gray-400/10 text-gray-600 border-gray-400",
					icon: SkipForward,
					text: "Previously skipped",
				};
		}
	};

	const config = getHeaderConfig();
	const Icon = config.icon;

	const collectEdits = (): TransactionEdits => {
		const edits: TransactionEdits = {};

		// Only include fields that have been changed from original values
		if (description !== (transaction?.transaction?.description || "")) {
			edits.description = description;
		}

		if (selectedCategory !== (transaction?.enrichment_data?.category_id || "")) {
			edits.categoryId = selectedCategory;
		}

		if (selectedContact !== (transaction?.enrichment_data?.contact_id || "")) {
			edits.contactId = selectedContact;
		}

		if (selectedPaymentMethod !== (transaction?.transaction?.payment_method || "")) {
			edits.paymentMethod = selectedPaymentMethod;
		}

		if (selectedUserBankAccount !== (transaction?.enrichment_data?.user_bank_account_id || "")) {
			edits.userBankAccountId = selectedUserBankAccount;
		}

		if (selectedToBankAccount !== (transaction?.enrichment_data?.to_bank_account_id || "")) {
			edits.toBankAccountId = selectedToBankAccount || undefined;
		}

		// Handle date conversion to ISO string
		if (selectedDate) {
			const originalDate = transaction?.transaction?.time_sent
				? new Date(transaction.transaction.time_sent).toISOString()
				: null;
			const newDate = selectedDate.toISOString();

			if (newDate !== originalDate) {
				edits.transactionDate = newDate;
			}
		}

		return edits;
	};

	return (
		<div className="w-full max-w-2xl mx-auto space-y-6">
			{/* Dynamic Header Badge */}
			{/* <div
				className={cn(
					"flex items-center px-4 py-3 rounded-lg border",
					config.className,
				)}>
				<Icon
					size={18}
					className="mr-2"
				/>
				<span className="font-medium">{config.text}</span>
			</div> */}

			{/* Main Card */}
			<Card className="shadow-sm overflow-hidden">
				<CardContent className="p-6 md:p-8 space-y-8">
					{/* Alert for Already Approved */}
					{state === "APPROVED" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
							<Check
								className="text-emerald-600 shrink-0 mt-0.5"
								size={18}
							/>
							<div className="flex-1">
								<h4 className="font-medium text-emerald-800 text-sm">
									This transaction has already been approved
								</h4>
								{transaction?.created_transaction_id && (
									<p className="text-emerald-700 text-xs mt-1">
										Transaction ID: {transaction.created_transaction_id}
									</p>
								)}
							</div>
						</motion.div>
					)}

					{/* Alert for Skipped */}
					{state === "SKIPPED" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3">
							<SkipForward
								className="text-gray-600 shrink-0 mt-0.5"
								size={18}
							/>
							<div className="flex-1">
								<h4 className="font-medium text-gray-800 text-sm">
									This transaction was previously skipped
								</h4>
								<p className="text-gray-700 text-xs mt-1">
									You can still approve it if needed
								</p>
							</div>
						</motion.div>
					)}

					{/* Alert for Clarification */}
					{state === "CLARIFICATION_NEEDED" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
							<AlertTriangle
								className="text-amber-600 shrink-0 mt-0.5"
								size={18}
							/>
							<div className="flex-1">
								<h4 className="font-medium text-amber-800 text-sm">
									Please provide the following information:
								</h4>
								{transaction?.questions && transaction.questions.length > 0 && (
									<ul className="mt-2 space-y-1">
										{transaction.questions.map((q: string, i: number) => (
											<li key={i} className="text-amber-700 text-xs">• {q}</li>
										))}
									</ul>
								)}
								{transaction?.notes && (
									<details className="mt-2">
										<summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-700">
											Technical notes
										</summary>
										<p className="text-amber-700 text-xs mt-1">
											{transaction.notes}
										</p>
									</details>
								)}
							</div>
						</motion.div>
					)}

					{transaction?.transaction && (
						/* Amount & Confidence */
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
									Amount
								</p>
								<h2 className="text-4xl font-semibold text-foreground mt-1">
									{formatCurrency(transaction?.transaction?.amount)}
								</h2>
							</div>
							<div className="flex flex-col items-end">
								<Badge
									variant="secondary"
									className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
									<Sparkles
										size={12}
										className="mr-1"
									/>
									{transaction?.confidence_score
										? transaction.confidence_score * 100
										: 0}
									% Confidence
								</Badge>
							</div>
						</div>
					)}

					{transaction?.transaction && (
						/* Form Grid */

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2 col-span-2">
								<label className="text-sm font-medium text-muted-foreground">
									Description
								</label>
								<Textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="min-h-[80px] bg-background resize-none"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">
									Category
								</label>
								<Select
									value={selectedCategory}
									onValueChange={setSelectedCategory}>
									<SelectTrigger
										className={cn(
											"bg-background w-full",
											state === "CLARIFICATION_NEEDED"
												? "ring-2 ring-amber-400"
												: "",
										)}>
										<SelectValue
											placeholder={
												isLoadingCategories
													? "Loading categories..."
													: "Select category"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{categories?.map((category) => (
											<SelectItem
												key={category?.id}
												value={category?.id}>
												{category?.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">
									Date
								</label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal bg-background",
												!selectedDate && "text-muted-foreground"
											)}>
											<CalendarIcon
												className="mr-2 h-4 w-4"
											/>
											{selectedDate ? (
												format(selectedDate, "PPP")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={(date) => {
												setSelectedDate(date);
												// To convert to ISO format matching "2025-01-01T17:58:07":
												// const isoDate = date?.toISOString().slice(0, 19);
												// Or to keep milliseconds: date?.toISOString()
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">
									Payment Method
								</label>
								<Select
									value={selectedPaymentMethod}
									onValueChange={setSelectedPaymentMethod}>
									<SelectTrigger className="bg-background w-full">
										<SelectValue placeholder="Select method" />
									</SelectTrigger>
									<SelectContent>
										{paymentMethods.map((method) => (
											<SelectItem
												key={method.value}
												value={method.value}>
												{method.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">
									Contact
								</label>
								<Select
									value={selectedContact}
									onValueChange={setSelectedContact}>
									<SelectTrigger className="bg-background w-full">
										<SelectValue
											placeholder={
												isLoadingContacts
													? "Loading contacts..."
													: "Select contact"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{contacts?.map((contact) => (
											<SelectItem
												key={contact?.id}
												value={contact?.id}>
												{contact?.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">
									Source Account
								</label>
								<Select
									value={selectedUserBankAccount}
									onValueChange={setSelectedUserBankAccount}>
									<SelectTrigger className="bg-background w-full">
										<SelectValue
											placeholder={
												isLoadingBankAccounts
													? "Loading accounts..."
													: "Select source account"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{bankAccounts?.map((account) => (
											<SelectItem
												key={account.id}
												value={account.id}>
												{account.accountName} - {account.bankName} ({account.accountNumber.slice(-4)})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{transaction?.enrichment_data?.is_self_transaction && (
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Destination Account
									</label>
									<Select
										value={selectedToBankAccount || "NONE"}
										onValueChange={(value) => setSelectedToBankAccount(value === "NONE" ? "" : value)}>
										<SelectTrigger className="bg-background w-full">
											<SelectValue
												placeholder={
													isLoadingBankAccounts
														? "Loading accounts..."
														: "Select destination account"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="NONE">None</SelectItem>
											{bankAccounts?.map((account) => (
												<SelectItem
													key={account.id}
													value={account.id}>
													{account.accountName} - {account.bankName} ({account.accountNumber.slice(-4)})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
					)}
				</CardContent>

				{/* Action Footer */}
				<CardFooter className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
					<Button
						variant="ghost"
						onClick={onSkip}
						className="text-muted-foreground hover:text-foreground font-medium transition-colors">
						<SkipForward
							size={18}
							className="mr-2"
						/>
						Skip
					</Button>

					<div className="flex gap-3 w-full sm:w-auto">
						{state === "CLARIFICATION_NEEDED" && (
							<Button
								onClick={onClarify}
								className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-medium">
								Clarify Transaction
							</Button>
						)}

						<Button
							onClick={() => {
								const edits = collectEdits();
								onApprove(edits);
							}}
							disabled={
								state === "CLARIFICATION_NEEDED" ||
								state === "APPROVED" ||
								isApproving
							}
							size="lg"
							className={cn(
								"flex-1 sm:flex-none px-8 font-medium shadow-lg transition-all",
								state === "APPROVED"
									? "bg-emerald-600 hover:bg-emerald-600 cursor-not-allowed opacity-60"
									: "bg-primary hover:bg-primary/95 text-primary-foreground"
							)}>
							{isApproving ? (
								<>
									<Loader2
										size={18}
										className="mr-2 animate-spin"
									/>
									Approving...
								</>
							) : state === "APPROVED" ? (
								<>
									<Check
										size={18}
										className="mr-2"
									/>
									Already Approved
								</>
							) : (
								<>
									<Check
										size={18}
										className="mr-2"
									/>
									Approve & Next
								</>
							)}
						</Button>
					</div>
				</CardFooter>
			</Card>

			{/* AI Details Collapsible (Simplified) */}
			<div className="bg-transparent border border-dashed border-border rounded-lg p-4">
				<h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
					AI Extraction Details
				</h4>
				<p className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
					raw_text: "WHOLE FOODS MARKET... TOTAL $51.46"
				</p>
			</div>
		</div>
	);
}
