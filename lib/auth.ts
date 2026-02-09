import api from "./api";

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	defaultCurrency: string;
	customContextPrompt: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Login user with email and password
 * Better Auth will set HTTP-only cookies automatically via set-cookie header
 */
export async function login(email: string, password: string): Promise<User> {
	const response = await api.post("/auth/signin", { email, password });
	return response.data.data.user;
}

/**
 * Sign up new user
 * Better Auth will set HTTP-only cookies automatically via set-cookie header
 */
export async function signup(
	name: string,
	email: string,
	password: string
): Promise<User> {
	const response = await api.post("/auth/signup", { name, email, password });
	return response.data.data.user;
}

/**
 * Logout user
 * This will clear the HTTP-only cookies on the backend
 */
export async function logout(): Promise<void> {
	await api.post("/auth/signout");
}

/**
 * Verify session by making a lightweight authenticated request
 * We can use any protected endpoint - using bank accounts as it's likely lightweight
 */
export async function verifySession(): Promise<boolean> {
	try {
		// Make any authenticated request - the authVerify middleware will validate the session
		await api.get("/bank-account", { params: { isActive: true } });
		return true;
	} catch (error) {
		// Session is invalid or expired
		return false;
	}
}
