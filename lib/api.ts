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

export default api;
