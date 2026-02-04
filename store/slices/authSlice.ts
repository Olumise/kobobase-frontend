import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppDispatch } from '../index'

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload))
      }
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false

      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    hydrate: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
    },
  },
})

export const { setUser, clearUser, setLoading, hydrate } = authSlice.actions

// Thunk to load auth from localStorage
export const loadAuthFromStorage = () => (dispatch: AppDispatch) => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        dispatch(hydrate(user))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }
}

export default authSlice.reducer
