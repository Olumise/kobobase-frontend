"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // If not authenticated, redirect to login
    // The API interceptor will also redirect on 401, but this handles the initial load
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
