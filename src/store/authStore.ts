import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  // LandingPage.tsx(236,17) xətasını düzəldir
  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  // LandingPage.tsx(236,24) xətasını düzəldir
  register: async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  fetchProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ user: null, loading: false })
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      set({ user: profile as User, loading: false })
    } else {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? '',
          plan: 'free',
          tokens_used: 0,
          tokens_limit: 50,
        })
        .select()
        .single()

      if (!insertError && newProfile) {
        set({ user: (newProfile as User), loading: false })
      } else {
        set({ user: null, loading: false })
      }
    }
  },
}))
