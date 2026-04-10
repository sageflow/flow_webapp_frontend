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
  History,
  Video,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Link2,
  Link2Off,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import type { RequestedMeetingDto, UpcomingMeetingDto } from '../services/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (utc: string): string => {
  try {
    return new Date(utc).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return utc
  }
}

const formatDate = (utc: string): string => {
  try {
    return new Date(utc).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return utc
  }
}

const durationMins = (start: string, end: string): number => {
  try {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  } catch {
    return 0
  }
}

const initials = (name: string): string =>
  name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const avatarHue = (name: string): string => {
  const palettes = [
    'from-violet-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palettes[Math.abs(hash) % palettes.length]
}

/** Derive a display name from the student email (e.g. john.doe@school.com → John Doe) */
const meetingLabel = (m: UpcomingMeetingDto): string => {
  const local = m.studentEmail?.split('@')[0] || 'Session'
  // Convert dot/underscore separated to Title Case
  return local
    .split(/[._-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BookingCardProps {
  req: RequestedMeetingDto
  actionLoading: 'accept' | 'reject' | null
  onAction: (action: 'accept' | 'reject') => void
}

const BookingCard: React.FC<BookingCardProps> = ({ req, actionLoading, onAction }) => {
  const color = avatarHue(req.studentName)
  const isActing = !!actionLoading

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 min-w-0">
      {/* Student info */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {initials(req.studentName)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {req.studentName}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
            {req.studentEmail}
          </p>
        </div>
      </div>

      {/* Time snippet */}
      <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 italic leading-relaxed">
        "{formatDate(req.startUtc)} · {formatTime(req.startUtc)} – {formatTime(req.endUtc)}"
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAction('accept')}
          disabled={isActing}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-xs font-semibold py-2 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {actionLoading === 'accept' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAction('reject')}
          disabled={isActing}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-gray-500 border border-gray-200 text-xs font-semibold py-2 rounded-xl hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-all"
        >
          {actionLoading === 'reject' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          Decline
        </motion.button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PsychologistDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Booking requests
  const [requests, setRequests] = useState<RequestedMeetingDto[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<number, 'accept' | 'reject' | null>>({})

  // Upcoming meetings (Today's Schedule)
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeetingDto[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [psychEmail, setPsychEmail] = useState<string | null>(null)

  // Google Calendar connection
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null)
  const [googleStatusLoading, setGoogleStatusLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [cancellingEvent, setCancellingEvent] = useState<string | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [cancelConfirmEvent, setCancelConfirmEvent] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch booking requests
  const fetchRequests = useCallback(async () => {
    if (!user?.id) return
    setRequestsLoading(true)
    setRequestsError(null)
    try {
      const data = await apiService.getRequestedMeetings(user.id)
      setRequests(data)
    } catch (err: unknown) {
      const status = (err as any)?.status
      const message = err instanceof Error ? err.message : ''
      if (status === 403 && (message.includes('REVOKED') || message.includes('NOT_CONNECTED'))) {
        setGoogleConnected(false)
        setGoogleError('Your Google account session has expired. Please reconnect.')
      } else {
        setRequestsError(err instanceof Error ? err.message : 'Failed to load booking requests')
      }
    } finally {
      setRequestsLoading(false)
    }
  }, [user?.id])

  // Fetch psychologist email, then fetch upcoming meetings
  const fetchSchedule = useCallback(async () => {
    if (!user?.id) return
    setScheduleLoading(true)
    setScheduleError(null)
    try {
      const profile = await apiService.getPsychologistById(user.id)
      const email: string = profile?.email || profile?.emailAddress || ''
      if (!email) throw new Error('Could not resolve psychologist email')
      setPsychEmail(email)
      const meetings = await apiService.getUpcomingMeetings(email)
      setUpcomingMeetings(Array.isArray(meetings) ? meetings : [])
    } catch (err: unknown) {
      const status = (err as any)?.status
      const message = err instanceof Error ? err.message : ''
      if (status === 403 && (message.includes('REVOKED') || message.includes('NOT_CONNECTED'))) {
        setGoogleConnected(false)
        setGoogleError('Your Google account session has expired. Please reconnect.')
      } else {
        setScheduleError(err instanceof Error ? err.message : 'Failed to load schedule')
      }
    } finally {
      setScheduleLoading(false)
    }
  }, [user?.id])

  const fetchGoogleStatus = useCallback(async () => {
    if (!user?.id) return
    setGoogleStatusLoading(true)
    try {
      const { connected } = await apiService.checkGoogleStatus(user.id)
      setGoogleConnected(connected)
      setGoogleError(null)
    } catch (err: unknown) {
      const status = (err as any)?.status
      const message = err instanceof Error ? err.message : ''
      if (status === 403 && (message.includes('REVOKED') || message.includes('NOT_CONNECTED'))) {
        setGoogleConnected(false)
        setGoogleError('Your Google account session has expired. Please reconnect.')
      } else {
        setGoogleConnected(null)
      }
    } finally {
      setGoogleStatusLoading(false)
    }
  }, [user?.id])

  const handleConnectGoogle = () => {
    if (!user?.id) return
    window.location.href = apiService.getGoogleConnectUrl(user.id)
  }

  const handleDisconnectGoogle = async () => {
    if (!user?.id) return
    setDisconnecting(true)
    try {
      await apiService.disconnectGoogle(user.id)
      setGoogleConnected(false)
      setShowDisconnectConfirm(false)
    } catch (err: unknown) {
      setGoogleError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleCancelSession = async (googleEventId: string) => {
    if (!user?.id) return
    setCancellingEvent(googleEventId)
    try {
      await apiService.cancelSession(user.id, googleEventId)
      setUpcomingMeetings(prev => prev.filter(m => m.googleEventId !== googleEventId))
      setCancelConfirmEvent(null)
    } catch (err: unknown) {
      const status = (err as any)?.status
      const message = err instanceof Error ? err.message : ''
      if (status === 403 && (message.includes('REVOKED') || message.includes('NOT_CONNECTED'))) {
        setGoogleConnected(false)
        setGoogleError('Your Google account session has expired. Please reconnect.')
      } else {
        setScheduleError(err instanceof Error ? err.message : 'Failed to cancel session')
        setTimeout(() => setScheduleError(null), 4000)
      }
    } finally {
      setCancellingEvent(null)
    }
  }

  useEffect(() => {
    fetchGoogleStatus()
    fetchRequests()
    fetchSchedule()
  }, [fetchGoogleStatus, fetchRequests, fetchSchedule])

  // Accept / Reject
  const handleAction = async (req: RequestedMeetingDto, action: 'accept' | 'reject') => {
    if (!user?.id) return
    setActionLoading(prev => ({ ...prev, [req.id]: action }))
    try {
      if (action === 'accept') {
        await apiService.acceptMeetingRequest(req.id, user.id)
      } else {
        await apiService.rejectMeetingRequest(req.id, user.id)
      }
      setRequests(prev => prev.filter(r => r.id !== req.id))
    } catch (err: unknown) {
      const status = (err as any)?.status
      const message = err instanceof Error ? err.message : ''
      if (status === 403 && (message.includes('REVOKED') || message.includes('NOT_CONNECTED'))) {
        setGoogleConnected(false)
        setGoogleError('Your Google account session has expired. Please reconnect.')
      } else {
        setRequestsError(err instanceof Error ? err.message : `Failed to ${action} request`)
        setTimeout(() => setRequestsError(null), 4000)
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [req.id]: null }))
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const psychName = user?.username ? `Dr. ${user.username}` : 'Dr. Anderson'

  // ── Date picker state
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const calRef = useRef<HTMLDivElement>(null)

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node))
        setCalendarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build calendar grid for calMonth
  const buildCalGrid = (monthStart: Date): (Date | null)[] => {
    const year = monthStart.getFullYear()
    const month = monthStart.getMonth()
    const firstDay = new Date(year, month, 1).getDay() // 0 Sun … 6 Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const grid: (Date | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))
    return grid
  }

  const calGrid = buildCalGrid(calMonth)
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const getYYYYMMDD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Filter meetings strictly by the YYYY-MM-DD prefix of the UTC string
  // This avoids timezone shifts dropping meetings scheduled late in the UTC day
  const dateStr = getYYYYMMDD(selectedDate)
  const dayMeetings = upcomingMeetings.filter(
    m => m.startUtc && m.startUtc.startsWith(dateStr)
  )
  const [firstSession, ...restSessions] = dayMeetings

  // Header subtitle count
  const todayStr = getYYYYMMDD(today)
  const todayCount = upcomingMeetings.filter(
    m => m.startUtc && m.startUtc.startsWith(todayStr)
  ).length

  const formatSelectedDate = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  const monthLabel = calMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  return (
    <div className="min-h-screen bg-[#f5f3ff]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">SageFlow</span>
          </div>

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
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{psychName}</p>
                    <p className="text-xs text-gray-400 truncate">{psychEmail || user?.role || 'Psychologist'}</p>
                  </div>
                  {googleConnected && (
                    <button
                      onClick={() => { setShowDisconnectConfirm(true); setIsProfileOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Link2Off className="w-4 h-4" />
                      Disconnect Google
                    </button>
                  )}
                  {!googleConnected && googleConnected !== null && (
                    <button
                      onClick={() => { handleConnectGoogle(); setIsProfileOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                      Connect Google
                    </button>
                  )}
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

      {/* ── Page Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {psychName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            You have {todayCount} session{todayCount !== 1 ? 's' : ''} today
            {requests.length > 0 && ` and ${requests.length} pending request${requests.length !== 1 ? 's' : ''} to review`}.
          </p>
        </div>

        {/* Google token revoked / reconnect banner */}
        <AnimatePresence>
          {googleError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-4"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{googleError}</span>
              </div>
              <button
                onClick={handleConnectGoogle}
                className="ml-4 flex-shrink-0 text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Reconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Calendar not connected banner */}
        <AnimatePresence>
          {!googleStatusLoading && googleConnected === false && !googleError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between bg-violet-50 border border-violet-200 text-violet-800 text-sm px-5 py-4 rounded-xl mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold">Connect Google Calendar</p>
                  <p className="text-xs text-violet-500 mt-0.5">Link your Google account to manage sessions and sync your schedule.</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConnectGoogle}
                className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-all"
              >
                <Link2 className="w-4 h-4" />
                Connect
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected badge (inline with header) */}
        {!googleStatusLoading && googleConnected === true && (
          <div className="flex items-center gap-1.5 mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-xs font-medium text-emerald-600">Google Calendar connected</span>
          </div>
        )}

        {/* Global error banner */}
        <AnimatePresence>
          {requestsError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {requestsError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Two-column layout ── */}
        <div className="flex gap-6 items-start">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ── Booking Requests ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Booking Requests</h2>
                  {requests.length > 0 && (
                    <span className="px-2 py-0.5 bg-violet-600 text-white text-xs font-bold rounded-full">
                      {requests.length} New
                    </span>
                  )}
                </div>
                <button
                  onClick={fetchRequests}
                  disabled={requestsLoading}
                  className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Skeleton */}
              {requestsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-10 bg-gray-100 rounded-xl mb-3" />
                      <div className="flex gap-2">
                        <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                        <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!requestsLoading && requests.length === 0 && !requestsError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-10 text-center border border-gray-100"
                >
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-violet-400" />
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">No pending requests</p>
                  <p className="text-sm text-gray-400">New session requests will appear here.</p>
                </motion.div>
              )}

              {/* Cards grid */}
              {!requestsLoading && requests.length > 0 && (
                <AnimatePresence initial={false}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requests.map((req, idx) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                      >
                        <BookingCard
                          req={req}
                          actionLoading={actionLoading[req.id] ?? null}
                          onAction={action => handleAction(req, action)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </section>

            {/* ── Meeting History (placeholder — API not yet implemented) ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Meeting History</h2>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <History className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">No meeting history yet</p>
                  <p className="text-xs text-gray-300">Past sessions will appear here.</p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right column: Today’s Schedule ── */}
          <div className="w-72 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-gradient-to-b from-violet-700 to-purple-800 rounded-3xl p-5 text-white shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-200" />
                  <h2 className="text-base font-bold text-white">Schedule</h2>
                </div>
                {/* Calendar icon toggles picker */}
                <div className="relative" ref={calRef}>
                  <button
                    onClick={() => setCalendarOpen(o => !o)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                    title="Pick a date"
                  >
                    <Calendar className="w-4 h-4 text-purple-200" />
                  </button>

                  {/* Mini calendar popup */}
                  <AnimatePresence>
                    {calendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-[#3b1f8c] rounded-2xl p-4 shadow-2xl z-50 border border-white/10"
                      >
                        {/* Month navigation */}
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 text-purple-200" />
                          </button>
                          <span className="text-xs font-bold text-white">{monthLabel}</span>
                          <button
                            onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-purple-200" />
                          </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-center text-[10px] font-bold text-purple-300/70">{d}</span>
                          ))}
                        </div>

                        {/* Day grid */}
                        <div className="grid grid-cols-7 gap-y-0.5">
                          {calGrid.map((d, i) => {
                            if (!d) return <span key={`empty-${i}`} />
                            const isToday = isSameDay(d, today)
                            const isSelected = isSameDay(d, selectedDate)
                            return (
                              <button
                                key={d.toISOString()}
                                onClick={() => { setSelectedDate(d); setCalendarOpen(false) }}
                                className={`
                                  w-7 h-7 mx-auto rounded-lg text-[11px] font-semibold transition-all
                                  ${isSelected
                                    ? 'bg-white text-purple-800 shadow-sm'
                                    : isToday
                                      ? 'bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-400/50'
                                      : 'text-purple-200 hover:bg-white/15'
                                  }
                                `}
                              >
                                {d.getDate()}
                              </button>
                            )
                          })}
                        </div>

                        {/* Today shortcut */}
                        <button
                          onClick={() => { setSelectedDate(today); setCalMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setCalendarOpen(false) }}
                          className="mt-3 w-full text-xs font-semibold text-purple-300 hover:text-white transition-colors text-center"
                        >
                          Jump to Today
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {/* Subtitle */}
              <p className="text-[11px] text-purple-300/80 mb-3 ml-0.5">Upcoming Meetings</p>

              {/* Date navigator row */}
              <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 mb-4">
                <button
                  onClick={() => {
                    const prev = new Date(selectedDate)
                    prev.setDate(prev.getDate() - 1)
                    setSelectedDate(prev)
                    setCalMonth(new Date(prev.getFullYear(), prev.getMonth(), 1))
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/15 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-purple-200" />
                </button>
                <span className="text-xs font-bold text-white">
                  {isSameDay(selectedDate, today) ? 'Today' : formatSelectedDate(selectedDate)}
                </span>
                <button
                  onClick={() => {
                    const nxt = new Date(selectedDate)
                    nxt.setDate(nxt.getDate() + 1)
                    setSelectedDate(nxt)
                    setCalMonth(new Date(nxt.getFullYear(), nxt.getMonth(), 1))
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/15 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-purple-200" />
                </button>
              </div>

              {/* Loading */}
              {scheduleLoading && (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white/10 rounded-2xl p-4 animate-pulse">
                      <div className="h-3 bg-white/20 rounded w-1/3 mb-3" />
                      <div className="h-4 bg-white/30 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-white/20 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* API Error — clean state (no raw error string) */}
              {!scheduleLoading && scheduleError && (
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-300/60 mx-auto mb-3" />
                  <p className="text-purple-200 text-sm font-medium mb-1">No schedule available</p>
                  <p className="text-purple-300/70 text-xs mb-4">Couldn’t load sessions right now.</p>
                  <button
                    onClick={fetchSchedule}
                    className="text-xs font-semibold text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* No sessions on selected date */}
              {!scheduleLoading && !scheduleError && dayMeetings.length === 0 && (
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-300/50 mx-auto mb-3" />
                  <p className="text-purple-200 text-sm font-medium">No sessions</p>
                  <p className="text-purple-300/60 text-xs mt-1">
                    {isSameDay(selectedDate, today) ? 'Nothing scheduled for today.' : 'Nothing on this day.'}
                  </p>
                </div>
              )}

              {/* First/next session (highlighted) */}
              {!scheduleLoading && !scheduleError && firstSession && (
                <div className="bg-white/[0.15] backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">
                      {isSameDay(selectedDate, today) ? 'Next Session' : 'First Session'} • {formatTime(firstSession.startUtc)}
                    </span>
                    {isSameDay(selectedDate, today) && (
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-auto" />
                    )}
                  </div>
                  <p className="font-bold text-white text-base mb-0.5">{meetingLabel(firstSession)}</p>

                  <div className="mt-4 flex gap-2">
                    {firstSession.meetLink ? (
                      <a
                        href={firstSession.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-purple-700 font-bold text-sm py-2.5 rounded-xl hover:bg-purple-50 transition-colors shadow-md"
                      >
                        <Video className="w-4 h-4" />
                        Start Session
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white/60 font-semibold text-sm py-2.5 rounded-xl cursor-default"
                      >
                        <Video className="w-4 h-4" />
                        Start Session
                      </button>
                    )}
                    {firstSession.googleEventId && (
                      <button
                        onClick={() => setCancelConfirmEvent(firstSession.googleEventId)}
                        disabled={cancellingEvent === firstSession.googleEventId}
                        className="flex items-center justify-center w-10 bg-white/10 hover:bg-red-500/30 text-purple-200 hover:text-white rounded-xl transition-colors disabled:opacity-50"
                        title="Cancel session"
                      >
                        {cancellingEvent === firstSession.googleEventId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Remaining sessions */}
              {!scheduleLoading && !scheduleError && restSessions.length > 0 && (
                <div className="space-y-3">
                  {restSessions.map((m, i) => (
                    <motion.div
                      key={m.googleEventId || i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.06 }}
                      className="border-t border-white/10 pt-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-purple-300 mb-0.5">{formatTime(m.startUtc)}</p>
                          <p className="font-semibold text-white text-sm">{meetingLabel(m)}</p>
                        </div>
                        {m.googleEventId && (
                          <button
                            onClick={() => setCancelConfirmEvent(m.googleEventId)}
                            disabled={cancellingEvent === m.googleEventId}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/30 text-purple-300 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0 mt-0.5"
                            title="Cancel session"
                          >
                            {cancellingEvent === m.googleEventId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Disconnect confirmation modal ── */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDisconnectConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link2Off className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Disconnect Google Calendar?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Your existing meetings won't be deleted from Google Calendar, but new bookings and schedule sync will stop working.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Keep Connected
                </button>
                <button
                  onClick={handleDisconnectGoogle}
                  disabled={disconnecting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {disconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Disconnect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cancel session confirmation modal ── */}
      <AnimatePresence>
        {cancelConfirmEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setCancelConfirmEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel this session?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This will remove the event from Google Calendar and notify the student. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmEvent(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Keep Session
                </button>
                <button
                  onClick={() => handleCancelSession(cancelConfirmEvent)}
                  disabled={!!cancellingEvent}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancellingEvent === cancelConfirmEvent && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PsychologistDashboard
