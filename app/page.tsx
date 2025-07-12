// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Music, Shield, Link, Zap } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return <LandingPage />
}

function LandingPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError(null)
    setSuccessMessage(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) throw error
        
        // Check if user already exists
        if (data.user?.identities?.length === 0) {
          throw new Error('User already exists. Please sign in instead.')
        }
        
        if (data.user && !data.session) {
          setSuccessMessage('Check your email for the confirmation link!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) {
      setAuthError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error: any) {
      setAuthError(error.message)
    }
  }

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setAuthError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <Music className="h-16 w-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            KeyTune
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Secure music sharing with expiring links, IP protection, and premium access controls. 
            Share your beats safely.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white/5 rounded-lg backdrop-blur-sm">
              <Shield className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Sharing</h3>
              <p className="text-gray-400">IP logging, expiring links, watermarks</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg backdrop-blur-sm">
              <Link className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Links</h3>
              <p className="text-gray-400">Generate unique, trackable sharing links</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg backdrop-blur-sm">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Premium Features</h3>
              <p className="text-gray-400">Monetize your music with paid access</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
              {authError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-300">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={signInWithGoogle}
                type="button"
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.61-0.056-1.229-0.155-1.849h-9.845z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                onClick={signInWithGitHub}
                type="button"
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setAuthError(null)
                setSuccessMessage(null)
              }}
              className="text-cyan-400 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [userLinks, setUserLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // The auth state change will automatically redirect to login
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const fetchUserLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('music_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching links:', error)
        setError('Failed to load your music links')
      } else {
        setUserLinks(data || [])
      }
    } catch (err) {
      console.error('Error in fetchUserLinks:', err)
      setError('Failed to load your music links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserLinks()
  }, [])

  const handleUploadComplete = (linkId: string) => {
    fetchUserLinks() // Refresh the links
  }
  
  const handlePremiumAccess = async () => {
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: 'premium-upgrade' }),
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong with the payment setup')
      }
    } catch (err) {
      console.error('Stripe error:', err)
      alert('Error creating Stripe checkout session')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Music className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">KeyTune</h1>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <FileUpload onUploadComplete={handleUploadComplete} />

            {/* Recent Links */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Music Links</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="mt-2 text-gray-400">Loading your tracks...</p>
                  </div>
                ) : userLinks.length > 0 ? (
                  userLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{link.filename}</h3>
                        <p className="text-sm text-gray-400">
                          Created {new Date(link.created_at).toLocaleDateString()} • 
                          {link.is_premium ? ' Premium' : ' Free'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => copyToClipboard(`${window.location.origin}/link/${link.link_id}`)}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm hover:bg-cyan-500/30 transition-all"
                        >
                          Copy Link
                        </button>
                        <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm hover:bg-purple-500/30 transition-all">
                          Analytics
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No tracks uploaded yet</p>
                    <p className="text-sm mt-1">Upload your first track to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Links</span>
                  <span className="font-semibold">{userLinks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Views</span>
                  <span className="font-semibold">
                    {userLinks.reduce((sum, link) => sum + (link.view_count || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Premium Links</span>
                  <span className="font-semibold">{userLinks.filter(l => l.is_premium).length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg p-6 border border-cyan-500/30">
              <h3 className="font-semibold mb-2">Upgrade to Premium</h3>
              <p className="text-sm text-gray-300 mb-4">
                Unlock advanced security features and monetization
              </p>
              <button 
                onClick={handlePremiumAccess} 
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}