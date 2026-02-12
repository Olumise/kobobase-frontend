"use client";

import { useState, useEffect } from "react";
import { Menu, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { chatApi } from "@/lib/api";
import type { ChatSession, ChatMessage } from "@/lib/types/chat";
import { ChatSessionSidebar } from "@/components/chat/ChatSessionSidebar";
import { ChatMessagesArea } from "@/components/chat/ChatMessagesArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";

export default function ChatPage() {
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreatingSession, setIsCreatingSession] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

	// Fetch all sessions on mount
	useEffect(() => {
		fetchSessions();
	}, []);

	// Fetch session messages when active session changes
	useEffect(() => {
		if (activeSessionId) {
			fetchSessionMessages(activeSessionId);
		} else {
			setMessages([]);
		}
	}, [activeSessionId]);

	const fetchSessions = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await chatApi.getAllSessions();
			const sessionsData = response.data?.data || response.data || [];
			setSessions(Array.isArray(sessionsData) ? sessionsData : []);

			// Auto-select first session if available and no active session
			if (sessionsData.length > 0 && !activeSessionId) {
				setActiveSessionId(sessionsData[0].id);
			}
		} catch (err: any) {
			console.error("Failed to fetch sessions:", err);
			setError(err.response?.data?.message || "Failed to load chat sessions");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchSessionMessages = async (sessionId: string) => {
		try {
			setError(null);
			const response = await chatApi.getSession(sessionId);
			const sessionData = response.data?.data || response.data;
			setMessages(sessionData.messages || []);
		} catch (err: any) {
			console.error("Failed to fetch session messages:", err);
			setError(err.response?.data?.message || "Failed to load messages");
		}
	};

	const handleNewChat = async () => {
		try {
			setIsCreatingSession(true);
			setError(null);
			const response = await chatApi.createSession();
			const newSession = response.data?.data || response.data;

			setSessions((prev) => [newSession, ...prev]);
			setActiveSessionId(newSession.id);
			setMessages([]);
			setIsMobileSidebarOpen(false);
		} catch (err: any) {
			console.error("Failed to create session:", err);
			setError(err.response?.data?.message || "Failed to create new chat");
		} finally {
			setIsCreatingSession(false);
		}
	};

	const handleSendMessage = async (messageText: string) => {
		if (!messageText.trim()) return;

		let sessionId = activeSessionId;

		// Create session if none active
		if (!sessionId) {
			try {
				setIsCreatingSession(true);
				setError(null);
				const response = await chatApi.createSession();
				const newSession = response.data?.data || response.data;

				setSessions((prev) => [newSession, ...prev]);
				setActiveSessionId(newSession.id);
				sessionId = newSession.id;
				setMessages([]);
				setIsMobileSidebarOpen(false);
			} catch (err: any) {
				console.error("Failed to create session:", err);
				setError(err.response?.data?.message || "Failed to create new chat");
				setIsCreatingSession(false);
				return;
			} finally {
				setIsCreatingSession(false);
			}
		}

		try {
			setError(null);
			setIsTyping(true);

			// Add user message optimistically
			const tempUserMessage: ChatMessage = {
				id: `temp-${Date.now()}`,
				sessionId: sessionId,
				query: messageText,
				response: "",
				transactionsFound: 0,
				createdAt: new Date().toISOString(),
			};
			setMessages((prev) => [...prev, tempUserMessage]);

			// Send message to API
			const response = await chatApi.sendMessage(sessionId, messageText);
			const responseData = response.data?.data || response.data;

			// Replace temp message with real message and add assistant response
			const realUserMessage: ChatMessage = {
				id: responseData.message?.id || tempUserMessage.id,
				sessionId: sessionId,
				query: messageText,
				response: "",
				transactionsFound: 0,
				createdAt: responseData.message?.createdAt || tempUserMessage.createdAt,
			};

			const assistantMessage: ChatMessage = {
				id: `assistant-${Date.now()}`,
				sessionId: sessionId,
				query: "",
				response: responseData.response || "",
				transactionsFound: responseData.transactionsFound || 0,
				retrievedTransactions: responseData.transactions || [],
				createdAt: new Date().toISOString(),
			};

			setMessages((prev) => {
				const withoutTemp = prev.filter((m) => m.id !== tempUserMessage.id);
				return [...withoutTemp, realUserMessage, assistantMessage];
			});

			// Update session list (session title may have been auto-generated)
			await fetchSessions();
			setActiveSessionId(sessionId); // Maintain active session
		} catch (err: any) {
			console.error("Failed to send message:", err);
			setError(err.response?.data?.message || "Failed to send message");
			// Remove optimistic message on error
			setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
		} finally {
			setIsTyping(false);
		}
	};

	const handleSelectSession = (sessionId: string) => {
		setActiveSessionId(sessionId);
		setIsMobileSidebarOpen(false);
	};

	const handleDeleteSession = async (sessionId: string) => {
		try {
			setError(null);
			await chatApi.deleteSession(sessionId);
			setSessions((prev) => prev.filter((s) => s.id !== sessionId));

			// If deleted session was active, clear it
			if (sessionId === activeSessionId) {
				setActiveSessionId(null);
				setMessages([]);
			}
		} catch (err: any) {
			console.error("Failed to delete session:", err);
			setError(err.response?.data?.message || "Failed to delete conversation");
		}
	};

	const Sidebar = () => (
		<ChatSessionSidebar
			sessions={sessions}
			activeSessionId={activeSessionId}
			isLoading={isLoading}
			onNewChat={handleNewChat}
			onSelectSession={handleSelectSession}
			onDeleteSession={handleDeleteSession}
		/>
	);

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)]">
			{/* Error Alert */}
			{error && (
				<Alert variant="destructive" className="m-4 mb-0">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="flex flex-1 overflow-hidden">
				{/* Desktop Sidebar */}
				<div className="hidden lg:block w-80 shrink-0">
					<Sidebar />
				</div>

				{/* Mobile Sidebar */}
				<div className="lg:hidden absolute top-4 left-4 z-10">
					<Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="shadow-md">
								<Menu size={20} />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-80 p-0">
							<Sidebar />
						</SheetContent>
					</Sheet>
				</div>

				{/* Main Chat Area */}
				<div className="flex-1 flex flex-col">
					{!activeSessionId && messages.length === 0 ? (
						<ChatEmptyState onSuggestionClick={handleSendMessage} />
					) : (
						<>
							<ChatMessagesArea messages={messages} isTyping={isTyping} />
							<ChatInput
								onSend={handleSendMessage}
								disabled={isTyping || isCreatingSession}
								placeholder={
									isCreatingSession
										? "Creating session..."
										: "Ask about your transactions..."
								}
							/>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
