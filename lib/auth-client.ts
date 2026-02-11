import { createAuthClient } from "better-auth/react"
import api from './api'

// Custom fetch wrapper to handle your backend's response format
const customFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)

  // Transform all auth endpoint responses that return nested data
  const url = input.toString()
  if (url.includes('/auth/')) {
    const contentType = response.headers.get('content-type')

    // Only process JSON responses
    if (contentType?.includes('application/json')) {
      const data = await response.json()

      // Transform from { message, data: { session, user } }
      // to { session, user } which Better Auth expects
      if (data.data?.session && data.data?.user) {
        return new Response(JSON.stringify(data.data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      }

      // If data is nested but doesn't have session/user structure, return as-is
      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    }
  }

  return response
}

// Create Better Auth React client with custom fetch
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:4245
  basePath: "/auth", // Custom base path (not /api/auth)
  fetchOptions: {
    customFetchImpl: customFetch
  }
})

// Export hooks and methods from Better Auth
export const {
  signIn,
  signUp,
  useSession
} = authClient

// Custom logout function to match backend endpoint /auth/sign-out
export const logout = async () => {
  await api.post('/auth/sign-out')
  // Better Auth's useSession will automatically detect the session is gone
}
