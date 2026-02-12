"use client";

import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ChatSession } from "@/lib/types/chat";
import { ChatSessionItem } from "./ChatSessionItem";
import { useState } from "react";

interface ChatSessionSidebarProps {
	sessions: ChatSession[];
	activeSessionId: string | null;
	isLoading: boolean;
	onNewChat: () => void;
	onSelectSession: (sessionId: string) => void;
	onDeleteSession: (sessionId: string) => void;
}

export function ChatSessionSidebar({
	sessions,
	activeSessionId,
	isLoading,
	onNewChat,
	onSelectSession,
	onDeleteSession,
}: ChatSessionSidebarProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

	const handleDeleteClick = (sessionId: string) => {
		setSessionToDelete(sessionId);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (sessionToDelete) {
			onDeleteSession(sessionToDelete);
			setSessionToDelete(null);
		}
		setDeleteDialogOpen(false);
	};

	return (
		<>
			<div className="flex flex-col h-full border-r border-border bg-muted/30">
				{/* Header */}
				<div className="p-4 border-b border-border">
					<Button
						onClick={onNewChat}
						className="w-full justify-start gap-2"
						variant="default"
					>
						<Plus size={16} />
						New Chat
					</Button>
				</div>

				{/* Sessions List */}
				<ScrollArea className="flex-1 p-4">
					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-20 w-full rounded-lg" />
							))}
						</div>
					) : sessions.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-sm text-muted-foreground">No conversations yet</p>
							<p className="text-xs text-muted-foreground mt-1">
								Start a new chat to begin
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{sessions.map((session) => (
								<ChatSessionItem
									key={session.id}
									session={session}
									isActive={session.id === activeSessionId}
									onClick={() => onSelectSession(session.id)}
									onDelete={() => handleDeleteClick(session.id)}
								/>
							))}
						</div>
					)}
				</ScrollArea>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete conversation?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							conversation and all its messages.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="bg-rose-600 hover:bg-rose-700 text-white"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
