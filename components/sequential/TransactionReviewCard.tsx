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
import { contactsApi, categoriesApi } from "@/lib/api";

export type TransactionState =
	| "READY"
	| "CLARIFICATION_NEEDED"
	| "NEEDS_CONFIRMATION";

interface TransactionReviewCardProps {
	transaction: any;
	state: TransactionState;
	onApprove: () => void;
	onSkip: () => void;
	onClarify: () => void;
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
}: TransactionReviewCardProps) {

	const [contacts, setContacts] = useState<any[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const [isLoadingContacts, setIsLoadingContacts] = useState(false);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);

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

		fetchContacts();
		fetchCategories();
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
		}
	};

	const config = getHeaderConfig();
	const Icon = config.icon;

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
					{/* Alert for Clarification */}
					{state === "CLARIFICATION_NEEDED" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
							<AlertTriangle
								className="text-amber-600 flex-shrink-0 mt-0.5"
								size={18}
							/>
							<div>
								<h4 className="font-medium text-amber-800 text-sm">
									Additional Clarification needed
								</h4>
								<p className="text-amber-700 text-xs mt-1">
									{transaction?.notes}
								</p>
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
							onClick={onApprove}
							disabled={state === "CLARIFICATION_NEEDED"}
							size="lg"
							className="flex-1 sm:flex-none px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-medium shadow-lg transition-all">
							<Check
								size={18}
								className="mr-2"
							/>
							Approve & Next
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
