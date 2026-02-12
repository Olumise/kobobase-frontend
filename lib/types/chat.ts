import type { TransactionDetail } from "./transaction";

// Chat Message
export interface ChatMessage {
	id: string;
	sessionId: string;
	query: string;
	response: string;
	transactionsFound: number;
	retrievedTransactions?: TransactionDetail[];
	createdAt: string;
}

// Chat Session
export interface ChatSession {
	id: string;
	userId: string;
	title: string | null; // Auto-generated from first message
	status: "active" | "completed";
	createdAt: string;
	updatedAt: string;
	messages: ChatMessage[];
}

// API Response Types
export interface CreateSessionResponse {
	message: string;
	data: ChatSession;
}

export interface GetAllSessionsResponse {
	message: string;
	data: ChatSession[];
}

export interface GetSessionResponse {
	message: string;
	data: ChatSession;
}

export interface SendMessageResponse {
	message: string;
	data: {
		message: ChatMessage;
		response: string;
		transactionsFound: number;
		transactions: TransactionDetail[];
	};
}

export interface CompleteSessionResponse {
	message: string;
	data: ChatSession;
}

export interface DeleteSessionResponse {
	message: string;
	data: {
		success: boolean;
		message: string;
	};
}
