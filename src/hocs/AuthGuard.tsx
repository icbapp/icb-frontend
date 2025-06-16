/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

const AuthGuard = ({ children, locale }: ChildrenType & { locale: Locale }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token')

    if (!token) {
      setIsAuthenticated(false)
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  if (isAuthenticated === null) return null // Or show a loader

  return <>{isAuthenticated ? children : <AuthRedirect lang={locale} />}</>
}

export default AuthGuard
