"use client";

import { useRef, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "@/lib/types/chat";
import { MessageBubble } from "./MessageBubble";

interface ChatMessagesAreaProps {
	messages: ChatMessage[];
	isTyping?: boolean;
}

export function ChatMessagesArea({ messages, isTyping = false }: ChatMessagesAreaProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isTyping]);

	return (
		<div className="flex-1 overflow-hidden">
			<ScrollArea className="h-full p-4 bg-muted/5">
				<div className="space-y-4">
					{messages.map((msg) => (
						<div key={msg.id} className="space-y-4">
							{/* User Message */}
							{msg.query && (
								<MessageBubble
									message={msg}
									role="user"
								/>
							)}
							{/* Assistant Response */}
							{msg.response && (
								<MessageBubble
									message={msg}
									role="assistant"
								/>
							)}
						</div>
					))}

					{/* Typing Indicator */}
					{isTyping && (
						<div className="flex gap-3 mr-auto max-w-[85%]">
							<Avatar className="w-8 h-8 bg-muted text-muted-foreground shrink-0">
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
	);
}
