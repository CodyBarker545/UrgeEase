'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { usePreferencesStore } from '@/lib/store'

function ThemePreferenceSync() {
  const preferredTheme = usePreferencesStore((state) => state.preferences.theme)
  const { setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    const isAppRoute = pathname?.startsWith('/app')
    setTheme(isAppRoute ? preferredTheme : 'light')
  }, [pathname, preferredTheme, setTheme])

  return null
}

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ThemePreferenceSync />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

