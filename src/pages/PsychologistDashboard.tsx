import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  User,
  Clock,
  LogOut,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Mail,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import type { RequestedMeetingDto } from '../services/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format UTC ISO string into a readable local time */
const formatDateTime = (utc: string): string => {
  try {
    return new Date(utc).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return utc
  }
}

/** Derive initials from a full name */
const initials = (name: string): string =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

/** Pick a deterministic avatar colour from the name */
const avatarColor = (name: string): string => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ─── Component ────────────────────────────────────────────────────────────────

const PsychologistDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [requests, setRequests] = useState<RequestedMeetingDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  // Track per-request action loading: { [requestId]: 'accept' | 'reject' | null }
  const [actionLoading, setActionLoading] = useState<Record<number, 'accept' | 'reject' | null>>({})

  // ── Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Fetch booking requests
  const fetchRequests = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    setFetchError(null)
    try {
      const data = await apiService.getRequestedMeetings(user.id)
      setRequests(data)
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load booking requests')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  // ── Accept / Reject
  const handleAction = async (request: RequestedMeetingDto, action: 'accept' | 'reject') => {
    if (!user?.id) return
    setActionLoading(prev => ({ ...prev, [request.id]: action }))
    try {
      if (action === 'accept') {
        await apiService.acceptMeetingRequest(request.id, user.id)
      } else {
        await apiService.rejectMeetingRequest(request.id, user.id)
      }
      // Remove from list after action
      setRequests(prev => prev.filter(r => r.id !== request.id))
    } catch (err: unknown) {
      console.error(`Failed to ${action} request:`, err)
      // Show error briefly then clear
      setFetchError(err instanceof Error ? err.message : `Failed to ${action} request`)
      setTimeout(() => setFetchError(null), 4000)
    } finally {
      setActionLoading(prev => ({ ...prev, [request.id]: null }))
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const psychologistName = user?.username ? `Dr. ${user.username}` : 'Dr. Anderson'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-sm">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-montserrat font-bold text-lg text-heading">SageFlow</span>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(p => !p)}
              className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
            >
              <User className="w-4 h-4 text-white" />
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl py-2"
                >
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-heading truncate">{psychologistName}</p>
                    <p className="text-xs text-body truncate">{user?.role || 'Psychologist'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-heading">
            Welcome back, {psychologistName}
          </h1>
          <p className="text-sm text-body mt-1">
            Psychologist&nbsp;&bull;&nbsp;ID #{user?.id ?? '—'}
          </p>
        </div>

        {/* ── Booking Requests Section ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              <h2 className="text-sm font-bold text-heading tracking-wider uppercase">
                Booking Requests
              </h2>
              {requests.length > 0 && (
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                  {requests.length}
                </span>
              )}
            </div>
            <button
              onClick={fetchRequests}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {fetchError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {fetchError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/70 rounded-2xl p-5 border border-white/60 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-9 w-24 bg-gray-200 rounded-xl" />
                      <div className="h-9 w-20 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && requests.length === 0 && !fetchError && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-10 text-center"
            >
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-violet-400" />
              </div>
              <p className="font-semibold text-heading mb-1">No pending requests</p>
              <p className="text-sm text-body">New session requests will appear here.</p>
            </motion.div>
          )}

          {/* Request cards */}
          {!isLoading && (
            <AnimatePresence initial={false}>
              <div className="space-y-3">
                {requests.map((req, idx) => {
                  const isActing = !!actionLoading[req.id]
                  const color = avatarColor(req.studentName)
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">

                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
                          {initials(req.studentName)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-heading text-sm truncate">
                            {req.studentName}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-body">
                              <Mail className="w-3.5 h-3.5 text-violet-400" />
                              {req.studentEmail}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-body">
                              <Clock className="w-3.5 h-3.5 text-violet-400" />
                              {formatDateTime(req.startUtc)}
                              {' → '}
                              {formatDateTime(req.endUtc)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAction(req, 'accept')}
                            disabled={isActing}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
                          >
                            {actionLoading[req.id] === 'accept' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAction(req, 'reject')}
                            disabled={isActing}
                            className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 text-xs font-semibold px-4 py-2 rounded-xl hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-all"
                          >
                            {actionLoading[req.id] === 'reject' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Decline
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>
          )}
        </section>
      </div>
    </div>
  )
}

export default PsychologistDashboard
