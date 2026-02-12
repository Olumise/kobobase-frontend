"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/lib/types/chat";
import { formatDistanceToNow } from "date-fns";

interface ChatSessionItemProps {
	session: ChatSession;
	isActive: boolean;
	onClick: () => void;
	onDelete: () => void;
}

export function ChatSessionItem({
	session,
	isActive,
	onClick,
	onDelete,
}: ChatSessionItemProps) {
	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete();
	};

	const getSessionTitle = () => {
		if (session.title) {
			return session.title.length > 50
				? session.title.substring(0, 50) + "..."
				: session.title;
		}
		return "New conversation";
	};

	const getLastMessageTime = () => {
		const date = new Date(session.updatedAt);
		return formatDistanceToNow(date, { addSuffix: true });
	};

	return (
		<div
			onClick={onClick}
			className={cn(
				"group relative p-3 rounded-lg cursor-pointer transition-colors border",
				isActive
					? "bg-primary/10 border-primary"
					: "bg-card border-border hover:bg-muted/50"
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h4
							className={cn(
								"text-sm font-medium line-clamp-1",
								isActive ? "text-primary" : "text-foreground"
							)}
						>
							{getSessionTitle()}
						</h4>
						<Badge
							variant={session.status === "active" ? "default" : "secondary"}
							className="text-[10px] px-1.5 py-0 h-4"
						>
							{session.status}
						</Badge>
					</div>
					<p className="text-xs text-muted-foreground">{getLastMessageTime()}</p>
					<p className="text-xs text-muted-foreground mt-1">
						{session.messages.length} message{session.messages.length !== 1 ? "s" : ""}
					</p>
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
					onClick={handleDelete}
				>
					<Trash2 size={14} className="text-rose-600 dark:text-rose-400" />
				</Button>
			</div>
		</div>
	);
}
