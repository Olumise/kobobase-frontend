"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
	onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
	"How much did I spend on groceries this month?",
	"Show me all my restaurant expenses",
	"What are my biggest expenses this year?",
	"Show me transactions from last week",
];

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center h-full p-8 text-center">
			<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
				<MessageSquare className="w-8 h-8 text-primary" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				Start a conversation
			</h3>
			<p className="text-muted-foreground mb-6 max-w-md">
				Ask questions about your transactions and get AI-powered insights
			</p>

			<div className="flex flex-wrap gap-2 justify-center max-w-2xl">
				{suggestions.map((suggestion, index) => (
					<Button
						key={index}
						variant="outline"
						size="sm"
						onClick={() => onSuggestionClick(suggestion)}
						className="text-xs"
					>
						{suggestion}
					</Button>
				))}
			</div>
		</div>
	);
}
