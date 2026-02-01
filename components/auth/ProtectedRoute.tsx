"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login')
    }
  }, [isAuthenticated, token, router])

  if (!isAuthenticated || !token) {
    return null
  }

  return <>{children}</>
}
