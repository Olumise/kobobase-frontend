"use client"

import { Provider } from 'react-redux'
import { store } from './index'
import { useEffect, useRef } from 'react'
import { loadAuthFromStorage } from './slices/authSlice'

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      store.dispatch(loadAuthFromStorage())
      initialized.current = true
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}
