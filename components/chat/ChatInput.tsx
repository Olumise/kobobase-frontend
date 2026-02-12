"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
	onSend: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

export function ChatInput({
	onSend,
	disabled = false,
	placeholder = "Ask about your transactions..."
}: ChatInputProps) {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (!message.trim() || disabled) return;
		onSend(message.trim());
		setMessage("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="p-4 border-t border-border bg-background">
			<div className="flex gap-2 items-end">
				<Textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					className="min-h-[60px] max-h-[120px] text-sm bg-muted/20 border-input focus:bg-background resize-none flex-1"
				/>
				<Button
					onClick={handleSend}
					disabled={!message.trim() || disabled}
					size="icon"
					className="h-[60px] w-12 shrink-0"
				>
					<Send size={18} />
				</Button>
			</div>
			<p className="text-xs text-muted-foreground mt-2">
				Press Enter to send, Shift+Enter for new line
			</p>
		</div>
	);
}
