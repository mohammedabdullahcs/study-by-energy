/**
 * Optional Cloud Sync Component
 *
 * Design Decision: Non-Blocking Auth
 * - Completely optional - app works fine without it
 * - Shows in a subtle corner, never modal or intrusive
 * - Can be collapsed to stay out of the way
 * - No pressure language ("sync now", "backup your data")
 * - Calm, gentle invitation to use cloud features
 * - Triggered redeploy on Vercel
 */

import { useState, useEffect } from 'react'
import { Cloud, CloudOff, User, LogOut, X } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface CloudSyncProps {
  onAuthChange?: (isAuthenticated: boolean) => void
}

export function CloudSync({ onAuthChange }: CloudSyncProps) {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Listen for auth state changes
  useEffect(() => {
    if (!supabase) return

    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      onAuthChange?.(!!user)
    })

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      onAuthChange?.(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [onAuthChange])

  // Don't show if Supabase not configured
  if (!isSupabaseConfigured) return null

  const handleSignIn = async () => {
    if (!supabase || !email) return

    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Send magic link instead of code for better UX
          shouldCreateUser: true,
        },
      })

      if (error) throw error

      setMessage('Check your email for a sign-in link')
      setEmail('')
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return

    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setMessage('Signed out')
    } catch (error: any) {
      setMessage(error.message || 'Error signing out')
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-white rounded-full shadow-lg border-2 border-calm-200 hover:border-calm-400 transition-all group"
          title={user ? 'Cloud sync active' : 'Optional cloud sync'}
        >
          {user ? (
            <Cloud className="w-5 h-5 text-calm-600" />
          ) : (
            <CloudOff className="w-5 h-5 text-calm-400 group-hover:text-calm-600" />
          )}
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-calm-200 p-6 w-80">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-calm-600" />
              <h3 className="font-medium text-calm-800">Optional Cloud Sync</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-calm-400 hover:text-calm-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-calm-600">
                <User className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <p className="text-sm text-calm-500">
                Your sessions are being saved to the cloud.
              </p>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-calm-300 text-calm-700 rounded-lg hover:bg-calm-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-calm-600">
                Save your sessions across devices. Completely optional.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border-2 border-calm-200 rounded-lg focus:border-calm-400 focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={handleSignIn}
                disabled={isLoading || !email}
                className="w-full px-4 py-3 bg-calm-800 text-white rounded-lg hover:bg-calm-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send sign-in link'}
              </button>
              {message && (
                <p
                  className={`text-sm ${
                    message.includes('error') || message.includes('wrong')
                      ? 'text-red-600'
                      : 'text-calm-600'
                  }`}
                >
                  {message}
                </p>
              )}
              <p className="text-xs text-calm-400">
                No password needed. We'll email you a magic link.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
