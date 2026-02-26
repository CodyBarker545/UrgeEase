'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserPreferences, OnboardingData } from './types'

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

interface PreferencesState {
  preferences: UserPreferences
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setPreferredMode: (mode: 'chat' | 'voice') => void
  setTone: (tone: 'calm' | 'direct') => void
}

interface OnboardingState {
  onboardingData: OnboardingData
  completeOnboarding: (data: { preferredMode: 'chat' | 'voice'; tone: 'calm' | 'direct' }) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token: string, user: User) => {
        set({ token, user })
      },
      logout: () => {
        set({ token: null, user: null })
      },
    }),
    {
      name: 'urgeease-auth',
    }
  )
)

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: {
        preferredMode: 'chat',
        tone: 'calm',
        theme: 'system',
      },
      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),
      setPreferredMode: (mode) =>
        set((state) => ({
          preferences: { ...state.preferences, preferredMode: mode },
        })),
      setTone: (tone) =>
        set((state) => ({
          preferences: { ...state.preferences, tone },
        })),
    }),
    {
      name: 'urgeease-preferences',
    }
  )
)

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      onboardingData: {
        completed: false,
      },
      completeOnboarding: (data) =>
        set({
          onboardingData: {
            completed: true,
            preferredMode: data.preferredMode,
            tone: data.tone,
          },
        }),
    }),
    {
      name: 'urgeease-onboarding',
    }
  )
)
