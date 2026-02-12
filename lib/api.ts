import axios from "axios";
import type {
	UploadReceiptResponse,
	ExtractReceiptResponse,
	ReceiptUploadError,
	ReceiptExtractionError,
} from "./types/receipt";
import type {
	CreateBankAccountPayload,
	UpdateBankAccountPayload,
	MatchBankAccountPayload,
} from "./types/bankAccount";
import type {
	CreateContactPayload,
	UpdateContactPayload,
} from "./types/contact";
import type {
	CreateCategoryPayload,
	UpdateCategoryPayload,
} from "./types/category";
import type {
	TransactionStatsResponse,
	StatsQueryParams,
	UsageStatsResponse,
	UsageSessionsResponse,
	UsageBreakdownResponse,
} from "./types/stats";
import type {
	UserProfile,
	UpdateUserProfileRequest,
	ChangePasswordRequest,
} from "./types/user";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, 
});

// Handle common errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
	
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

// API endpoints
export const receiptsApi = {
	getAllReceipts: () => api.get("/receipt"),
	getReceiptById: (id: string) => api.get(`/receipt/${id}`),
	uploadReceipt: async (file: File): Promise<UploadReceiptResponse> => {
		const formData = new FormData();
		formData.append("receipt", file);

		const response = await api.post<UploadReceiptResponse>(
			"/receipt/add",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		return response.data;
	},


	extractReceipt: async (receiptId: string): Promise<ExtractReceiptResponse> => {
		const response = await api.post<ExtractReceiptResponse>(
			`/receipt/extract/${receiptId}`,
		);

		return response.data;
	},


	deleteReceipt: async (receiptId: string): Promise<{ message: string }> => {
		const response = await api.delete<{ message: string }>(
			`/receipt/${receiptId}`,
		);

		return response.data;
	},

	updateReceiptFile: async (receiptId: string, file: File): Promise<UploadReceiptResponse> => {
		const formData = new FormData();
		formData.append("receipt", file);

		const response = await api.patch<UploadReceiptResponse>(
			`/receipt/update-file/${receiptId}`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		return response.data;
	},
};

export const bankAccountsApi = {
	getUserBankAccounts: (isActive: boolean = true) =>
		api.get("/bank-account", {
			params: {
				isActive
			}
		}),

	createBankAccount: (data: CreateBankAccountPayload) =>
		api.post("/bank-account", data),

	matchBankAccount: (data: MatchBankAccountPayload) =>
		api.post("/bank-account/match", data),

	getPrimaryBankAccount: () =>
		api.get("/bank-account/primary"),

	getBankAccountById: (accountId: string) =>
		api.get(`/bank-account/${accountId}`),

	updateBankAccount: (accountId: string, data: UpdateBankAccountPayload) =>
		api.put(`/bank-account/${accountId}`, data),

	deleteBankAccount: (accountId: string) =>
		api.delete(`/bank-account/${accountId}`),

	setPrimaryAccount: (accountId: string) =>
		api.patch(`/bank-account/${accountId}/set-primary`),
};

export const transactionsApi = {
	
	getUserBankAccounts: () => api.get("/bank-account", { params: { isActive: true } }),

	// Initiate sequential processing with progress updates (SSE)
	// Note: This should be called using fetch() directly, not axios, for SSE support
	initiateWithProgress: (receiptId: string, userBankAccountId: string) => {
		const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

		return fetch(`${baseURL}/transaction/sequential/initiate-with-progress/${receiptId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include", // This ensures cookies are sent with the request
			body: JSON.stringify({ userBankAccountId }),
		});
	},

	// Initiate sequential processing (standard, no SSE)
	initiateSequential: (receiptId: string, userBankAccountId: string) =>
		api.post(`/transaction/sequential/initiate/${receiptId}`, { userBankAccountId }),

	getCurrentTransaction: (batchSessionId: string) =>
		api.get(`/transaction/sequential/current/${batchSessionId}`),


	getBatchSessionInfo: (batchSessionId: string) =>
		api.get(`/transaction/batch/${batchSessionId}`),

	// Navigate to specific transaction by index
	getTransactionByIndex: (batchSessionId: string, index: number) =>
		api.get(`/transaction/sequential/${batchSessionId}/transaction/${index}`),

	approveAndNext: (batchSessionId: string, edits?: any) =>
		api.post("/transaction/sequential/approve-and-next", { batchSessionId, edits }),


	skipTransaction: (batchSessionId: string) =>
		api.post(`/transaction/sequential/skip/${batchSessionId}`),

	// Complete sequential session
	completeSession: (batchSessionId: string) =>
		api.post(`/transaction/sequential/complete/${batchSessionId}`),

	// Check if receipt has batch session
	getBatchSession: (receiptId: string) =>
		api.get(`/receipt/batch-session/${receiptId}`),

	// Core transaction CRUD endpoints
	getAllTransactions: (params?: {
		transactionType?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
		categoryId?: string;
		contactId?: string;
		startDate?: string;
		endDate?: string;
		status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
		limit?: number;
		offset?: number;
	}) => api.get('/transaction', { params }),

	getTransactionById: (transactionId: string) =>
		api.get(`/transaction/${transactionId}`),

	updateTransaction: (transactionId: string, data: any) =>
		api.put(`/transaction/${transactionId}`, data),

	deleteTransaction: (transactionId: string) =>
		api.delete(`/transaction/${transactionId}`),
};

export const contactsApi = {
	findContact: (contactName: string) =>
		api.post("/contact/find", { contactName }),

	createContact: (data: CreateContactPayload) =>
		api.post("/contact", data),

	searchContacts: (searchTerm: string, limit?: number) =>
		api.get("/contact/search", {
			params: { searchTerm, limit },
		}),

	getAllContacts: (limit?: number) =>
		api.get("/contact/all", {
			params: { limit },
		}),

	getContactById: (contactId: string) =>
		api.get(`/contact/${contactId}`),

	updateContact: (contactId: string, data: UpdateContactPayload) =>
		api.put(`/contact/${contactId}`, data),

	incrementTransactionCount: (contactId: string, transactionDate: string) =>
		api.patch(`/contact/${contactId}/increment`, { transactionDate }),
};

export const categoriesApi = {
	findCategory: (categoryName: string) =>
		api.post("/category/find", { categoryName }),

	createCategory: (data: CreateCategoryPayload) =>
		api.post("/category", data),

	getAllCategories: () =>
		api.get("/category/all"),

	getSystemCategories: () =>
		api.get("/category/system"),

	getUserCategories: () =>
		api.get("/category/user"),

	getUserCreatedCategories: () =>
		api.get("/category/user/created"),

	getCategoryById: (categoryId: string) =>
		api.get(`/category/${categoryId}`),

	updateCategory: (categoryId: string, data: UpdateCategoryPayload) =>
		api.put(`/category/${categoryId}`, data),

	deleteCategory: (categoryId: string) =>
		api.delete(`/category/${categoryId}`),
};

export const clarificationApi = {
	createSession: (data: {
		receiptId: string;
		extractedData?: any;
	}) => api.post("/clarification/create", data),

	getSession: (sessionId: string) =>
		api.get(`/clarification/session/${sessionId}`),

	completeSession: (sessionId: string, data?: { transactionId?: string }) =>
		api.patch(`/clarification/session/${sessionId}/complete`, data),

	getSessions: (receiptId?: string) =>
		api.get("/clarification/sessions", {
			params: receiptId ? { receiptId } : undefined,
		}),

	sendMessage: (sessionId: string, message: string) =>
		api.post(`/clarification/session/${sessionId}/message`, { message }),

	confirmSession: (sessionId: string, confirmations: Record<string, any>) =>
		api.post(`/clarification/session/${sessionId}/confirm`, { confirmations }),
};

export const transactionStatsApi = {
	getTransactionStats: (params?: StatsQueryParams) =>
		api.get<TransactionStatsResponse>("/transaction/stats", { params }),
};

export const usageApi = {
	getMyUsage: (period?: "all-time" | "current-month") =>
		api.get<UsageStatsResponse>("/usage/me", {
			params: period ? { period } : undefined,
		}),

	getMySessions: (limit?: number) =>
		api.get<UsageSessionsResponse>("/usage/me/sessions", {
			params: limit ? { limit } : undefined,
		}),

	getMyBreakdown: () =>
		api.get<UsageBreakdownResponse>("/usage/me/breakdown"),
};

export const userApi = {
	getProfile: () =>
		api.get<{ message: string; data: UserProfile }>("/user/profile"),

	updateProfile: (data: UpdateUserProfileRequest) =>
		api.patch<{ message: string; data: UserProfile }>("/user/profile", data),

	changePassword: (data: ChangePasswordRequest) =>
		api.post<{ message: string }>("/user/change-password", data),

	uploadImage: async (file: File): Promise<{ message: string; data: { url: string; path: string; filename: string } }> => {
		const formData = new FormData();
		formData.append("image", file);

		const response = await api.post<{ message: string; data: { url: string; path: string; filename: string } }>(
			"/user/upload-image",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		return response.data;
	},
};

// Chat API
export const chatApi = {
	// Create new chat session
	createSession: () =>
		api.post("/chat/session"),

	// Get all user sessions with previews
	getAllSessions: () =>
		api.get("/chat/sessions"),

	// Get single session with all messages
	getSession: (sessionId: string) =>
		api.get(`/chat/session/${sessionId}`),

	// Send message and get AI response
	sendMessage: (sessionId: string, query: string) =>
		api.post(`/chat/session/${sessionId}/message`, { query }),

	// Mark session as completed
	completeSession: (sessionId: string) =>
		api.patch(`/chat/session/${sessionId}/complete`),

	// Delete session
	deleteSession: (sessionId: string) =>
		api.delete(`/chat/session/${sessionId}`),
};

export default api;
