"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/lib/types/chat";
import { ChatTransactionCard } from "./ChatTransactionCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
	message: ChatMessage;
	role: "user" | "assistant";
}

export function MessageBubble({ message, role }: MessageBubbleProps) {
	const isUser = role === "user";

	return (
		<div
			className={cn(
				"flex gap-3 max-w-[85%]",
				isUser ? "ml-auto flex-row-reverse" : "mr-auto"
			)}
		>
			<Avatar
				className={cn(
					"w-8 h-8 shrink-0",
					isUser
						? "bg-primary text-primary-foreground"
						: "bg-muted text-muted-foreground"
				)}
			>
				<AvatarFallback className="text-[10px]">
					{isUser ? <User size={14} /> : <Bot size={14} />}
				</AvatarFallback>
			</Avatar>

			<div className="flex flex-col gap-2 flex-1">
				<div
					className={cn(
						"rounded-2xl text-sm leading-relaxed shadow-sm",
						isUser
							? "bg-primary text-primary-foreground rounded-tr-sm p-3"
							: "bg-card border border-border text-foreground rounded-tl-sm p-3"
					)}
				>
					{isUser ? (
						<p>{message.query}</p>
					) : (
						<div className="prose prose-sm dark:prose-invert max-w-none">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
								// Customize rendering for better styling
								p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
								ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
								ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
								li: ({ children }) => <li className="leading-relaxed">{children}</li>,
								strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
								em: ({ children }) => <em className="italic">{children}</em>,
								h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
								h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
								h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
								code: ({ children, className }) => {
									const isInline = !className;
									return isInline ? (
										<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
									) : (
										<code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>
									);
								},
								pre: ({ children }) => <pre className="bg-muted p-2 rounded mb-2 overflow-x-auto">{children}</pre>,
								blockquote: ({ children }) => (
									<blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-2">
										{children}
									</blockquote>
								),
								a: ({ children, href }) => (
									<a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
										{children}
									</a>
								),
							}}
						>
							{message.response}
						</ReactMarkdown>
						</div>
					)}
				</div>

				{/* Transaction cards for assistant messages */}
				{!isUser && message.retrievedTransactions && message.retrievedTransactions.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
						{message.retrievedTransactions.slice(0, 6).map((transaction) => (
							<ChatTransactionCard key={transaction.id} transaction={transaction} />
						))}
					</div>
				)}

				{/* Show "View all" if more than 6 transactions */}
				{!isUser && message.transactionsFound > 6 && (
					<p className="text-xs text-muted-foreground mt-1">
						Showing 6 of {message.transactionsFound} transactions
					</p>
				)}
			</div>
		</div>
	);
}
