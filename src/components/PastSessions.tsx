/**
 * Past Sessions Component
 * 
 * Philosophy: Gentle Reflection, Not Tracking
 * - Shows recent sessions as a journal, not metrics
 * - No charts, graphs, or analytics
 * - No guilt-inducing streaks or productivity scores
 * - Just a calm way to reflect on your journey
 */

import { useEffect, useState } from 'react'
import { BookOpen, Coffee, MessageCircle, Calendar, Clock } from 'lucide-react'
import { getUserSessions, SessionRecord } from '../lib/supabase'

interface PastSessionsProps {
  isAuthenticated: boolean
  onClose: () => void
}

export function PastSessions({ isAuthenticated, onClose }: PastSessionsProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const data = await getUserSessions(20) // Last 20 sessions
      setSessions(data)
      setLoading(false)
    }

    loadSessions()
  }, [isAuthenticated])

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'study':
        return <BookOpen className="w-5 h-5" />
      case 'rest':
        return <Coffee className="w-5 h-5" />
      case 'reflect':
        return <MessageCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-blue-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-white mb-1">Your Journey</h2>
              <p className="text-white/60 text-sm">
                A gentle look at your recent sessions
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 mb-2">Sign in to see your journey</p>
              <p className="text-white/40 text-sm">
                Your sessions are saved locally, but sign in to sync across devices
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-white/40">Loading your sessions...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No sessions yet</p>
              <p className="text-white/40 text-sm">
                Start your first session to begin your journey
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={session.id || index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Activity Icon */}
                      <div className={`mt-1 ${getEnergyColor(session.energy_level)}`}>
                        {getActivityIcon(session.activity)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium capitalize">
                            {session.activity}
                          </span>
                          <span className="text-white/40 text-xs">•</span>
                          <span className={`text-xs capitalize ${getEnergyColor(session.energy_level)}`}>
                            {session.energy_level} energy
                          </span>
                        </div>

                        {session.feedback && (
                          <p className="text-white/70 text-sm mb-2 italic">
                            "{session.feedback}"
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-white/40 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(session.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(session.created_at)}
                          </span>
                          {session.duration_minutes && (
                            <span>{session.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Gentle reminder */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <p className="text-white/40 text-xs text-center italic">
              This is your journey, not a scorecard. Every session matters. 💚
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
