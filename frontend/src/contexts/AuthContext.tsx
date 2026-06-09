import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Check for explicit demo mode first
      if (localStorage.getItem('demo_mode') === 'true') {
        const demoUser = {
          id: 'demo-user-id',
          email: 'demo@example.com',
          user_metadata: { name: 'Demo User' },
        } as any
        setUser(demoUser)
        setSession({ user: demoUser, access_token: 'demo-token' } as any)
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Supabase Auth failure:', err)
        // Auto-enable demo mode if Supabase is unreachable
        localStorage.setItem('demo_mode', 'true')
        window.location.reload()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('demo_mode') !== 'true') {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    localStorage.removeItem('demo_mode')
    try {
      await supabase.auth.signOut()
    } catch {}
    setUser(null)
    setSession(null)
    window.location.href = '/'
  }

  const value = {
    user,
    session,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
