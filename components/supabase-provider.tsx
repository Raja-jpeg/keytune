'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

const Context = createContext<any>(null)

export const SupabaseProvider = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  const [supabase] = useState(() => createClient())
  const [currentSession, setSession] = useState<Session | null>(session)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return <Context.Provider value={{ supabase, session: currentSession }}>{children}</Context.Provider>
}

export const useSupabase = () => useContext(Context)
