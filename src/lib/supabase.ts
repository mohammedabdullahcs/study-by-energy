/**
 * Supabase Client Initialization
 * 
 * Design Decision: Single Module Pattern
 * - All Supabase configuration lives in this one file
 * - Makes it easy to track cloud dependencies
 * - Can be disabled by simply not importing this module
 * 
 * Privacy Philosophy:
 * - No analytics enabled
 * - No tracking cookies
 * - No third-party integrations
 * - User data stays in their control
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables - users need to provide these
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Diagnostics: boolean-only environment checks (no secrets)
// Helps confirm Vite env replacement and Vercel env availability in production.
if (typeof window !== 'undefined') {
  // Whether Vite's env is present at runtime
  const viteEnvAvailable = typeof import.meta.env !== 'undefined'
  // Whether the specific Supabase env vars are set (boolean only, no values)
  const urlPresent = Boolean(import.meta.env.VITE_SUPABASE_URL)
  const anonKeyPresent = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

  // Single consolidated log for easier reading in production console
  // Example output: { viteEnvAvailable: true, urlPresent: true, anonKeyPresent: true, isSupabaseConfigured: true }
  // Note: does not print actual keys.
  // Remove after verification to keep console clean.
  // eslint-disable-next-line no-console
  console.log('[Env Diagnostics]', {
    viteEnvAvailable,
    urlPresent,
    anonKeyPresent,
    isSupabaseConfigured,
  })
}

/**
 * Supabase client instance
 * Returns null if not configured - app continues to work locally
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // No automatic token refresh to avoid background network calls
        // User must explicitly re-authenticate when session expires
        autoRefreshToken: false,
        // Persist session for user convenience (can sign out anytime)
        // This allows cross-tab login state
        persistSession: true,
        // Detect auth state changes for conditional syncing
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Database schema types
 * 
 * Design Decision: Minimal Schema
 * - Only sync essential session data
 * - No tracking of user behavior
 * - No analytics or metrics
 */
export interface SessionRecord {
  id?: string
  user_id?: string
  energy_level: 'low' | 'medium' | 'high'
  activity: 'study' | 'rest' | 'reflect'
  duration_minutes?: number
  feedback?: string
  created_at?: string
}

/**
 * Sync session data to cloud (when authenticated)
 * 
 * Design Decision: Conditional Sync
 * - Only syncs if user is authenticated
 * - Fails gracefully if offline or not configured
 * - Never blocks the UI
 */
export async function syncSession(session: SessionRecord): Promise<boolean> {
  // App works fine without cloud sync
  if (!supabase) return false

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Only sync if authenticated
    if (!user) return false

    const { error } = await supabase.from('sessions').insert({
      ...session,
      user_id: user.id,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.warn('Cloud sync failed, continuing locally:', error.message)
      return false
    }

    return true
  } catch (error) {
    // Never let cloud sync errors break the app
    console.warn('Cloud sync error, continuing locally:', error)
    return false
  }
}

/**
 * Get user's past sessions (when authenticated)
 * 
 * Design Decision: Pull on Demand
 * - Only loads when user explicitly requests
 * - No automatic background syncing
 * - No silent data collection
 */
export async function getUserSessions(limit = 10): Promise<SessionRecord[]> {
  if (!supabase) return []

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Failed to load sessions:', error.message)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('Error loading sessions:', error)
    return []
  }
}
