"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    // Only redirect after loading is complete and no session exists
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [isPending, session, router])

  // Show loading spinner while checking session
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show nothing if redirecting
  if (!session) {
    return null
  }

  // Render children if authenticated
  return <>{children}</>
}
