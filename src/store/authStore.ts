import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  // Yeni adlar (LandingPage üçün)
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  // Köhnə adlar (LoginPage/RegisterPage üçün)
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  // LOGIN MƏNTİQİ (Hər iki ada bağlandı)
  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },
  signIn: async (email: string, password: string) => {
    return get().login(email, password)
  },

  // REGISTER MƏNTİQİ (Hər iki ada bağlandı)
  register: async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
  },
  signUp: async (email: string, password: string, fullName: string) => {
    return get().register(email, password, fullName)
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
