import axios from "axios";

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
			// Clear stored auth data
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			// Redirect to login page
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
};

export const transactionsApi = {
	// Get user bank accounts for transaction initialization
	getUserBankAccounts: () => api.get("/user/bank-accounts"),

	// Initiate sequential processing with progress updates (SSE)
	// Note: This should be called using fetch() directly, not axios, for SSE support
	initiateWithProgress: (receiptId: string, userBankAccountId: string) => {
		const token = localStorage.getItem("token");
		const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

		return fetch(`${baseURL}/transaction/sequential/initiate-with-progress/${receiptId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify({ userBankAccountId }),
		});
	},

	// Initiate sequential processing (standard, no SSE)
	initiateSequential: (receiptId: string, userBankAccountId: string) =>
		api.post(`/transaction/sequential/initiate/${receiptId}`, { userBankAccountId }),

	// Get current transaction in sequential processing
	getCurrentTransaction: (batchSessionId: string) =>
		api.get(`/transaction/sequential/current/${batchSessionId}`),

	// Approve transaction and move to next
	approveAndNext: (batchSessionId: string, edits?: any) =>
		api.post("/transaction/sequential/approve-and-next", { batchSessionId, edits }),

	// Skip current transaction
	skipTransaction: (batchSessionId: string) =>
		api.post(`/transaction/sequential/skip/${batchSessionId}`),

	// Complete sequential session
	completeSession: (batchSessionId: string) =>
		api.post(`/transaction/sequential/complete/${batchSessionId}`),

	// Check if receipt has batch session
	getBatchSession: (receiptId: string) =>
		api.get(`/receipt/batch-session/${receiptId}`),
};

export default api;
