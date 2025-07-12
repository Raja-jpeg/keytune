/**'use client';

import StripeButton from '@/components/StripeButton';
import { useUser } from '@supabase/auth-helpers-react';

export default function DashboardPage() {
  const user = useUser();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
      <StripeButton email={user.email!} />
    </div>
  );
}**/

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Music, Shield, Download, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface MusicLink {
  id: string
  filename: string
  link_id: string
  is_premium: boolean
  expires_at: string
  created_at: string
}

export default function DashboardPage() {
  const [links, setLinks] = useState<MusicLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    fetchLinks()
    
    // Check for success/cancel params
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const linkId = searchParams.get('link_id')
    
    if (success === 'true') {
      setNotification('Payment successful! Your link has been upgraded to premium.')
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    } else if (canceled === 'true') {
      setNotification('Payment canceled.')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  const fetchLinks = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('User not logged in')
      }

      const { data, error } = await supabase
        .from('music_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLinks(data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error loading links')
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  fetchLinks();
}, [fetchLinks]);

  const handleUpgradeToPremium = async (linkId: string) => {
  const confirmed = window.confirm(
    'Are you sure you want to upgrade this link to Premium? This action cannot be undone.'
  )
  if (!confirmed) return

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('music_links')
      .update({ is_premium: true })
      .eq('link_id', linkId)
      .eq('user_id', user.id)

    if (error) throw error

    setNotification('Link successfully upgraded to premium.')
    fetchLinks()
  } catch (error: any) {
    console.error(error)
    alert('Failed to upgrade link: ' + error.message)
  }
}

  const copyLink = (linkId: string) => {
    const url = `${window.location.origin}/link/${linkId}`
    navigator.clipboard.writeText(url)
    setNotification('Link copied to clipboard!')
    setTimeout(() => setNotification(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <Loader className="animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <AlertCircle className="mr-2" />
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400">{notification}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Music Links</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            Back to Home
          </button>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 text-lg">No music links created yet.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Music className="h-8 w-8 text-cyan-400" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold truncate">{link.filename}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      link.is_premium 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {link.is_premium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Expires:</span>
                    <span className="text-sm text-white">
                      {new Date(link.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => copyLink(link.link_id)}
                    className="w-full py-2 px-4 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all text-sm font-medium"
                  >
                    Copy Share Link
                  </button>
                  

                {!link.is_premium && (
                  <button
                    onClick={() => handleUpgradeToPremium(link.link_id)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all text-sm font-medium"
                  >
                    Mark as Premium
                  </button>
                )}  
                  
                  <Link
                    href={`/link/${link.link_id}`}
                    className="block w-full py-2 px-4 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium text-center"
                  >
                    View Link
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold">{links.length}</p>
                <p className="text-gray-400">Total Links</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">{links.filter(l => l.is_premium).length}</p>
                <p className="text-gray-400">Premium Links</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Download className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{links.filter(l => !l.is_premium).length}</p>
                <p className="text-gray-400">Free Links</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}