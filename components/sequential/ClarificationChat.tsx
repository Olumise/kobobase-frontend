"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { clarificationApi } from "@/lib/api";
import { ReviewTransaction } from "@/lib/types/transaction";

interface ClarificationChatProps {
	clarificationId: string;
	isOpen: boolean;
  TxnIndex:number;
	onClose: () => void;
	onComplete: () => void;
}

interface ApiClarificationMessage {
	id: string;
	sessionId: string;
	role: "assistant" | "user";
	messageText: any;
	createdAt: string;
}

interface ChatMessage {
	role: "assistant" | "user";
	content: string;
	questions?: QuestionObject[];
}

interface QuestionObject {
	field: string;
	question: string;
	hint?: string;
	suggestions?: string[];
}

interface QuestionAnswer {
	field: string;
	question: string;
	answer: string;
}

export function ClarificationChat({
	clarificationId,
	isOpen,
	onClose,
  TxnIndex,
	onComplete,
}: ClarificationChatProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pendingQuestions, setPendingQuestions] = useState<QuestionObject[]>([]);
	const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
	const [showForm, setShowForm] = useState(true);
	const [freeFormMessage, setFreeFormMessage] = useState("");
	const [inputMode, setInputMode] = useState<"questions" | "message">("questions");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		const getSessionMessages = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await clarificationApi.getSession(
					clarificationId as string,
				);
        
				const apiMessages: ChatMessage[] = response.data.clarificationMessages.map(
					(message: ApiClarificationMessage) => {
						if (message.role === "user") {
							return {
								role: message.role,
								content: message.messageText,
							};
						} else {
							// Assistant message - parse JSON and extract notes and questions
							try {
								const parsedMessage = JSON.parse(message.messageText);
								return {
									role: message.role,
									content: parsedMessage.notes || "",
									questions: parsedMessage.questions || [],
								};
							} catch (err) {
								console.error("Failed to parse assistant message:", err);
								return {
									role: message.role,
									content: "",
									questions: [],
								};
							}
						}
					},
				);
				console.log("Loaded messages:", apiMessages);
				setMessages(apiMessages);

				// Find the latest assistant message with questions and set them as pending
				const lastAssistantMsg = apiMessages.reverse().find((msg: ChatMessage) => msg.role === "assistant" && msg.questions && msg.questions.length > 0);
				if (lastAssistantMsg && lastAssistantMsg.questions) {
					setPendingQuestions(lastAssistantMsg.questions);
					setQuestionAnswers(lastAssistantMsg.questions.map((q: QuestionObject) => ({
						field: q.field,
						question: q.question,
						answer: ""
					})));
					setShowForm(true);
				}
			} catch (err: any) {
				setError(
					err.response?.data?.message || "Failed to load Clarification Session",
				);
			} finally {
				setIsLoading(false);
			}
		};
		if (clarificationId && isOpen) {
			getSessionMessages();
		}
	}, [clarificationId, isOpen]);

	useEffect(() => {
		if (isOpen) scrollToBottom();
	}, [messages, isOpen]);

	const handleSendFreeFormMessage = async () => {
		if (!freeFormMessage.trim()) {
			return;
		}

		// Add user message
		setMessages((prev) => [...prev, { role: "user", content: freeFormMessage }]);
		setFreeFormMessage("");
		setShowForm(false); // Hide form after sending
		setIsTyping(true);

		try {
			const response = await clarificationApi.sendMessage(
				clarificationId,
				freeFormMessage,
			);

			// Find the transaction matching the current TxnIndex
			const currentTransaction = response.data.transactions?.find(
				(txn: any) => txn.transaction_index === TxnIndex,
			);

			if (currentTransaction && currentTransaction.notes) {
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: currentTransaction.notes,
						questions: currentTransaction.questions || [],
					},
				]);

				// Update pending questions if there are new ones
				if (currentTransaction.questions && currentTransaction.questions.length > 0) {
					setPendingQuestions(currentTransaction.questions);
					setQuestionAnswers(currentTransaction.questions.map((q: QuestionObject) => ({
						field: q.field,
						question: q.question,
						answer: ""
					})));
					setShowForm(true); // Show form again for new questions
				} else {
					// No more questions, clear the form
					setPendingQuestions([]);
					setQuestionAnswers([]);
					setShowForm(false);
				}

				// Check if transaction is complete (clarification and confirmation are both false)
				if (
					currentTransaction.needs_clarification === false &&
					currentTransaction.needs_confirmation === false &&
					currentTransaction.is_complete === "true"
				) {
					// Transaction is complete - redirect after 1 second
					setTimeout(() => {
						onComplete();
					}, 1000);
				}
			} else {
				console.warn(
					"No transaction found for index:",
					TxnIndex,
					"Available transactions:",
					response.data.transactions,
				);
			}

			setIsTyping(false);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to send message");
			setIsTyping(false);
		}
	};

	const handleSendAnswers = async () => {
		// Validate all questions are answered
		const unansweredQuestions = questionAnswers.filter((qa) => !qa.answer.trim());
		if (unansweredQuestions.length > 0) {
			alert("Please answer all questions before submitting.");
			return;
		}

		// Add user message showing the answers
		const userMsg = questionAnswers
			.map((qa, idx) => `Q${idx + 1}: ${qa.question}\nA: ${qa.answer}`)
			.join("\n\n");
		setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
		setShowForm(false); // Hide form after sending
		setIsTyping(true);

		try {
			const response = await clarificationApi.sendMessage(
				clarificationId,
				JSON.stringify({ answers: questionAnswers }),
			);

			// Find the transaction matching the current TxnIndex
			const currentTransaction = response.data.transactions?.find(
				(txn: any) => txn.transaction_index === TxnIndex,
			);

			if (currentTransaction && currentTransaction.notes) {
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: currentTransaction.notes,
						questions: currentTransaction.questions || [],
					},
				]);

				// Update pending questions if there are new ones
				if (currentTransaction.questions && currentTransaction.questions.length > 0) {
					setPendingQuestions(currentTransaction.questions);
					setQuestionAnswers(currentTransaction.questions.map((q: QuestionObject) => ({
						field: q.field,
						question: q.question,
						answer: ""
					})));
					setShowForm(true); // Show form again for new questions
				} else {
					// No more questions, clear the form
					setPendingQuestions([]);
					setQuestionAnswers([]);
					setShowForm(false);
				}

				// Check if transaction is complete (clarification and confirmation are both false)
				if (
					currentTransaction.needs_clarification === false &&
					currentTransaction.needs_confirmation === false &&
					currentTransaction.is_complete === "true"
				) {
					// Transaction is complete - redirect after 1 second
					setTimeout(() => {
						onComplete();
					}, 1000);
				}
			} else {
				console.warn(
					"No transaction found for index:",
					TxnIndex,
					"Available transactions:",
					response.data.transactions,
				);
			}

			setIsTyping(false);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to send message");
			setIsTyping(false);
		}
	};
	console.log(messages);
	return (
		<Sheet
			open={isOpen}
			onOpenChange={(open) => !open && onClose()}>
			<SheetContent className="w-full sm:w-[650px] lg:w-[750px] p-0 flex flex-col h-full border-l border-border shadow-2xl">
				<SheetHeader className="p-4 border-b border-border bg-muted/30 shrink-0">
					<SheetTitle className="text-lg font-semibold text-foreground">
						Clarify Transaction
					</SheetTitle>
					<SheetDescription className="text-xs text-muted-foreground">
						ID: {clarificationId}
					</SheetDescription>
				</SheetHeader>

				{/* Messages Area */}
				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full p-4 bg-muted/5">
						<div className="space-y-4">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={cn(
									"flex gap-3 max-w-[85%]",
									msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
								)}>
								<Avatar
									className={cn(
										"w-8 h-8",
										msg.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground",
									)}>
									<AvatarFallback className="text-[10px]">
										{msg.role === "user" ? (
											<User size={14} />
										) : (
											<Bot size={14} />
										)}
									</AvatarFallback>
								</Avatar>
								<div
									className={cn(
										"rounded-2xl text-sm leading-relaxed shadow-sm",
										msg.role === "user"
											? "bg-primary text-primary-foreground rounded-tr-sm p-3"
											: "bg-card border border-border text-foreground rounded-tl-sm",
									)}>
									<div className={msg.role === "assistant" ? "p-3" : ""}>
										{msg.content}
									</div>

									{/* Render questions as cards if they exist */}
									{msg.role === "assistant" && msg.questions && msg.questions.length > 0 && (
										<div className="mt-3 pt-3 border-t border-border/50 space-y-2 px-3 pb-3">
											<p className="text-xs font-medium opacity-70">Please answer these questions:</p>
											{msg.questions.map((questionObj: QuestionObject, qIdx: number) => (
												<div
													key={qIdx}
													className="bg-muted/30 rounded-lg p-2.5 text-xs border border-border/30 space-y-1"
												>
													<div>
														<span className="font-semibold text-primary mr-1">Q{qIdx + 1}:</span>
														{questionObj.question}
													</div>
													{questionObj.hint && (
														<div className="text-xs text-muted-foreground italic pl-4">
															💡 {questionObj.hint}
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						))}

						{isTyping && (
							<div className="flex gap-3 mr-auto max-w-[85%]">
								<Avatar className="w-8 h-8 bg-muted text-muted-foreground">
									<AvatarFallback className="text-[10px]">
										<Bot size={14} />
									</AvatarFallback>
								</Avatar>
								<div className="bg-card border border-border p-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
									<span
										className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"
										style={{ animationDelay: "0ms" }}
									/>
									<span
										className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"
										style={{ animationDelay: "150ms" }}
									/>
									<span
										className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"
										style={{ animationDelay: "300ms" }}
									/>
								</div>
							</div>
						)}
							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>
				</div>

				{/* Input Area with Tabs - Show when form is visible */}
				{showForm && pendingQuestions.length > 0 && (
					<div className="border-t border-border bg-background shrink-0">
						{/* Tab Headers */}
						<div className="flex border-b border-border">
							<button
								onClick={() => setInputMode("questions")}
								className={cn(
									"flex-1 py-3 px-4 text-sm font-medium transition-colors",
									inputMode === "questions"
										? "text-primary border-b-2 border-primary bg-muted/30"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/20"
								)}
							>
								Answer Questions ({questionAnswers.filter(qa => qa.answer.trim()).length}/{questionAnswers.length})
							</button>
							<button
								onClick={() => setInputMode("message")}
								className={cn(
									"flex-1 py-3 px-4 text-sm font-medium transition-colors",
									inputMode === "message"
										? "text-primary border-b-2 border-primary bg-muted/30"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/20"
								)}
							>
								Send Message
							</button>
						</div>

						{/* Tab Content */}
						<div className="p-4 min-h-[400px] max-h-[calc(100vh-400px)] overflow-y-auto">
							{inputMode === "questions" ? (
								<div className="space-y-4">
									{questionAnswers.map((qa, idx) => {
										const questionObj = pendingQuestions[idx];
										return (
											<div key={idx} className="space-y-1.5">
												<label className="text-xs font-medium text-muted-foreground">
													<span className="text-primary">Q{idx + 1}:</span> {qa.question}
												</label>
												{questionObj?.hint && (
													<p className="text-xs text-muted-foreground italic">
														💡 {questionObj.hint}
													</p>
												)}
												<Textarea
													value={qa.answer}
													onChange={(e) => {
														const newAnswers = [...questionAnswers];
														newAnswers[idx].answer = e.target.value;
														setQuestionAnswers(newAnswers);
													}}
													placeholder={questionObj?.hint || "Type your answer..."}
													className="min-h-[60px] text-sm bg-muted/20 border-input focus:bg-background resize-none"
												/>
												{questionObj?.suggestions && questionObj.suggestions.length > 0 && (
													<div className="flex flex-wrap gap-1.5 mt-2">
														{questionObj.suggestions.map((suggestion, sIdx) => (
															<button
																key={sIdx}
																onClick={() => {
																	const newAnswers = [...questionAnswers];
																	newAnswers[idx].answer = suggestion;
																	setQuestionAnswers(newAnswers);
																}}
																className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 border border-border rounded-md transition-colors"
															>
																{suggestion}
															</button>
														))}
													</div>
												)}
											</div>
										);
									})}

									<Button
										onClick={handleSendAnswers}
										disabled={questionAnswers.some(qa => !qa.answer.trim()) || isTyping}
										className="w-full bg-primary hover:bg-primary/95 text-primary-foreground">
										<Send size={16} className="mr-2" />
										Submit All Answers
									</Button>
								</div>
							) : (
								<div className="space-y-3">
									<div className="flex gap-2 items-end">
										<Textarea
											value={freeFormMessage}
											onChange={(e) => setFreeFormMessage(e.target.value)}
											placeholder="Ask a question or provide additional context..."
											className="min-h-[80px] text-sm bg-muted/20 border-input focus:bg-background resize-none flex-1"
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													handleSendFreeFormMessage();
												}
											}}
										/>
									</div>
									<Button
										onClick={handleSendFreeFormMessage}
										disabled={!freeFormMessage.trim() || isTyping}
										variant="outline"
										className="w-full">
										<Send size={16} className="mr-2" />
										Send Message
									</Button>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Simple message input when form is hidden or no questions */}
				{(!showForm || pendingQuestions.length === 0) && !isTyping && (
					<div className="p-4 border-t border-border bg-background shrink-0">
						<div className="space-y-2">
							<div className="flex gap-2 items-end">
								<Textarea
									value={freeFormMessage}
									onChange={(e) => setFreeFormMessage(e.target.value)}
									placeholder="Type a message..."
									className="min-h-[60px] text-sm bg-muted/20 border-input focus:bg-background resize-none flex-1"
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSendFreeFormMessage();
										}
									}}
								/>
								<Button
									onClick={handleSendFreeFormMessage}
									disabled={!freeFormMessage.trim() || isTyping}
									size="icon"
									className="h-[60px] w-12 shrink-0">
									<Send size={18} />
								</Button>
							</div>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
