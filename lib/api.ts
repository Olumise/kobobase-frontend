import axios from "axios";
import type {
	UploadReceiptResponse,
	ExtractReceiptResponse,
	ReceiptUploadError,
	ReceiptExtractionError,
} from "./types/receipt";

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
};

export const bankAccountsApi = {

	getUserBankAccounts: (isActive: boolean = true) =>
		api.get("/bank-account", {
			params: {
				isActive
			}
		}),
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
};

export const contactsApi = {
	findContact: (contactName: string) =>
		api.post("/contact/find", { contactName }),

	createContact: (data: {
		name: string;
		normalizedName?: string;
		ContactType?: string;
		categoryId?: string;
		typicalAmountRangeMin?: number;
		typicalAmountRangeMax?: number;
		nameVariations?: string[];
		transactionCount?: number;
		lastTransactionDate?: string;
		notes?: string;
	}) => api.post("/contact", data),

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

	updateContact: (contactId: string, data: {
		name?: string;
		normalizedName?: string;
		ContactType?: string;
		categoryId?: string;
		typicalAmountRangeMin?: number;
		typicalAmountRangeMax?: number;
		nameVariations?: string[];
		notes?: string;
	}) => api.put(`/contact/${contactId}`, data),

	incrementTransactionCount: (contactId: string, transactionDate: string) =>
		api.patch(`/contact/${contactId}/increment`, { transactionDate }),
};

export const categoriesApi = {
	findCategory: (categoryName: string) =>
		api.post("/category/find", { categoryName }),

	createCategory: (data: {
		name: string;
		icon?: string;
		color?: string;
		isSystemCategory?: boolean;
		isActive?: boolean;
	}) => api.post("/category", data),

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

	updateCategory: (categoryId: string, data: {
		name?: string;
		icon?: string;
		color?: string;
		isActive?: boolean;
	}) => api.put(`/category/${categoryId}`, data),

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

export default api;
