// app/link/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Music, Download, Shield, Clock, Eye, Lock } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

interface MusicLink {
  id: string
  filename: string
  file_path: string
  link_id: string
  is_premium: boolean
  expires_at: string
  watermark?: string
  created_at: string
  user_id: string
}

export default function LinkPage() {
  const params = useParams()
  const router = useRouter()
  const linkId = params.id as string

  const [musicLink, setMusicLink] = useState<MusicLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (linkId) {
      fetchMusicLink()
      logAccess()
    }
  }, [linkId])

  const fetchMusicLink = async () => {
    try {
      const { data, error } = await supabase
        .from('music_links')
        .select('*')
        .eq('link_id', linkId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Link not found')

      const isExpired = new Date(data.expires_at) < new Date()
      if (isExpired) {
        throw new Error('This link has expired')
      }

      setMusicLink(data)

      // Handle premium access
      if (data.is_premium) {
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        if (!user) {
          // Redirect to login if not signed in
          router.push(`/login?redirect=/link/${linkId}`)
          return
        }

        // Only owner can access premium link
        if (user.id === data.user_id) {
          setHasAccess(true)
          await loadAudio(data.file_path)
        } else {
          throw new Error('This is a premium link. Only the owner can access it.')
        }
      } else {
        // Free link, anyone can access
        setHasAccess(true)
        await loadAudio(data.file_path)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAudio = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('music-files')
        .createSignedUrl(filePath, 3600)

      if (data?.signedUrl) {
        setAudioUrl(data.signedUrl)
      }
    } catch (err) {
      console.error('Error loading audio:', err)
    }
  }

const logAccess = async () => {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const { ip } = await ipResponse.json()

    const { error } = await supabase
      .from('link_analytics')
      .insert({
        link_id: linkId,
        ip_address: ip,
        user_agent: navigator.userAgent,
        country: '', // Will add geo lookup if time permits
        device_type: /Mobile|iP(hone|od|ad)|Android|BlackBerry/.test(navigator.userAgent) 
          ? 'Mobile' 
          : 'Desktop'
      })

    if (error) throw error
  } catch (err) {
    console.error('Error logging access:', err)
  }
}

  const handlePremiumAccess = async () => {
    const confirmUpgrade = window.confirm(
      'Upgrading this link to Premium is permanent and cannot be undone. Do you wish to proceed?'
    )

    if (!confirmUpgrade) return

    try {
      const { error } = await supabase
        .from('music_links')
        .update({ is_premium: true })
        .eq('link_id', linkId)

      if (error) throw error

      alert('Link upgraded to Premium successfully.')
      fetchMusicLink()
    } catch (err: any) {
      console.error('Upgrade error:', err)
      alert('Error upgrading link.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-cyan-400" />
              <h1 className="text-2xl font-bold">KeyTune</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Expires {new Date(musicLink?.expires_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Track Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{musicLink?.filename}</h2>
              <p className="text-gray-400 mb-4">
                Shared securely via KeyTune
              </p>
              
              {musicLink?.is_premium && (
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 font-semibold">Premium Track</span>
                </div>
              )}
            </div>
          </div>

          {/* Audio Player or Access Control */}
          {hasAccess ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Audio Player</h3>
              {audioUrl ? (
                <div className="space-y-4">
                  <audio 
                    controls 
                    className="w-full"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  >
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = audioUrl
                        a.download = musicLink?.filename || 'audio'
                        a.click()
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading audio...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Access Required</h3>
                <p className="text-gray-400 mb-6">
                  This track requires premium access to listen and download.
                </p>
                <button
                  onClick={handlePremiumAccess}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Get Premium Access - $2.99
                </button>
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span>Security Features</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span>Access logged & monitored</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Link expires automatically</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span>IP address tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4 text-gray-400" />
                <span>Watermarked audio</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}