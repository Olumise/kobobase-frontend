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
}

export function ClarificationChat({
	clarificationId,
	isOpen,
	onClose,
  TxnIndex,
	onComplete,
}: ClarificationChatProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
						// User messages are plain strings, assistant messages are JSON with 'notes'
						if (message.role === "user") {
							return {
								role: message.role,
								content: message.messageText,
							};
						} else {
							// Assistant message - parse JSON and extract notes
							try {
								const parsedMessage = JSON.parse(message.messageText);
								return {
									role: message.role,
									content: parsedMessage.notes || "",
								};
							} catch (err) {
								console.error("Failed to parse assistant message:", err);
								return {
									role: message.role,
									content: "",
								};
							}
						}
					},
				);
				console.log("Loaded messages:", apiMessages);
				setMessages(apiMessages);
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

	const handleSend = async () => {
		if (!input.trim()) return;

		// User message
		const userMsg = input;
		setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
		setInput("");
		setIsTyping(true);

		try {
			const response = await clarificationApi.sendMessage(
				clarificationId,
				userMsg,
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
					},
				]);

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
			<SheetContent className="w-full sm:w-[450px] p-0 flex flex-col h-full border-l border-border shadow-2xl">
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
										"p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm",
										msg.role === "user"
											? "bg-primary text-primary-foreground rounded-tr-sm"
											: "bg-card border border-border text-foreground rounded-tl-sm",
									)}>
									{msg.content}
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

				{/* Input Area */}
				<div className="p-4 border-t border-border bg-background shrink-0">
					<div className="flex gap-2 items-end">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							placeholder="Type your answer... (Shift+Enter for new line)"
							className="flex-1 rounded-lg bg-muted/20 border-input focus:bg-background min-h-[100px] max-h-[120px] resize-none px-4 py-3"
							rows={1}
						/>
						<Button
							size="icon"
							onClick={handleSend}
							disabled={!input.trim() || isTyping}
							className="rounded-lg h-11 w-11 shrink-0">
							<Send size={18} />
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
