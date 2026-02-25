import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, CheckCircle, Circle, Sparkles, RefreshCw, Sun, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { GuidanceResponse } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import AuthNavbar from '../components/common/AuthNavbar'

// ── helpers ───────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

// ── animated circular progress ring ──────────────────────────────
const ProgressRing: React.FC<{ pct: number; size?: number; stroke?: number }> = ({
  pct, size = 72, stroke = 6
}) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct / 100)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede9fe" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#ringGrad)" strokeWidth={stroke}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: dash }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
const DailyRoutinePage: React.FC = () => {
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guidances, setGuidances] = useState<GuidanceResponse[]>([])
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTodaysGuidances = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError('')
      const data = await apiService.getTodaysGuidances()
      setGuidances(data)
    } catch {
      setError("Failed to load today's guidance. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAsComplete = async (guidanceId: number) => {
    try {
      setCompletingId(guidanceId)
      setError('')
      const updated = await apiService.markGuidanceAsComplete(guidanceId)
      setGuidances(prev => prev.map(g => g.id === guidanceId ? updated : g))
    } catch {
      setError('Failed to mark as complete. Please try again.')
    } finally {
      setCompletingId(null)
    }
  }

  useEffect(() => {
    if (!authLoading) fetchTodaysGuidances()
  }, [authLoading])

  const completedCount = guidances.filter(g => g.isCompleted).length
  const totalCount = guidances.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone = totalCount > 0 && pct === 100

  // ── Page shell ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      {/* Ambient orbs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/15 to-orange-400/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <AuthNavbar backTo="/dashboard" backLabel="Dashboard" />

      {/* Main */}
      <div className="max-w-2xl w-full mx-auto px-6 pb-16 relative z-10">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-violet-700 mb-4 border border-violet-100/60">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(new Date().toISOString())}
          </div>
          <h1 className="text-h1 text-heading mb-1">Your Daily Guidance</h1>
          <p className="text-body text-body max-w-md mx-auto">
            Personalised activities to help you thrive today. Complete each one to build positive habits.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <ErrorMessage message={error} onClose={() => setError('')} className="mb-5" />
        )}

        {/* ── Loading ── */}
        {(authLoading || loading) ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : guidances.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-14 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Sun className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-lg font-montserrat font-bold text-heading mb-2">No Guidance for Today</h3>
            <p className="text-sm text-body max-w-xs mx-auto mb-6">
              Check back later! Your personalised daily guidance will appear here once it's ready.
            </p>
            <button
              onClick={() => fetchTodaysGuidances(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-semibold transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── Progress card ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="glass-card p-5 mb-6"
            >
              <div className="flex items-center gap-5">
                {/* Ring */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <ProgressRing pct={pct} />
                  <div className="absolute text-center">
                    <p className="text-lg font-montserrat font-bold text-heading leading-none">{pct}%</p>
                  </div>
                </div>

                {/* Progress text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-heading">Today's Progress</p>
                  </div>
                  <p className="text-xs text-label mb-3">{completedCount} of {totalCount} tasks completed</p>
                  <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Refresh */}
                <button
                  onClick={() => fetchTodaysGuidances(true)}
                  title="Refresh"
                  className="w-9 h-9 rounded-xl bg-white/70 hover:bg-violet-50 border border-white/60 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 text-violet-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* ── Guidance list ── */}
            <div className="space-y-3 mb-6">
              {guidances.map((guidance, index) => (
                <motion.div
                  key={guidance.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                  className={`glass-card p-5 transition-all duration-300 ${guidance.isCompleted ? 'opacity-70' : 'hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Index badge */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${guidance.isCompleted
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                        : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                      }`}>
                      {guidance.isCompleted
                        ? <CheckCircle className="w-4.5 h-4.5" />
                        : index + 1
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed font-medium ${guidance.isCompleted ? 'text-gray-400 line-through' : 'text-heading'
                        }`}>
                        {guidance.guidanceText}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[11px] text-label">
                          <Clock className="w-3 h-3" />
                          Added {formatTime(guidance.createdAt)}
                        </span>
                        <AnimatePresence>
                          {guidance.isCompleted && guidance.completedAt && (
                            <motion.span
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Done at {formatTime(guidance.completedAt)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {guidance.isCompleted ? (
                        <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => markAsComplete(guidance.id)}
                          disabled={completingId === guidance.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          className="w-9 h-9 rounded-full border-2 border-violet-200 bg-white/80 flex items-center justify-center hover:border-violet-500 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title="Mark as complete"
                        >
                          {completingId === guidance.id
                            ? <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
                            : <Circle className="w-4 h-4 text-violet-300" />
                          }
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Footer quote / all-done banner ── */}
            <AnimatePresence mode="wait">
              {allDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-7 text-center"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-montserrat font-bold text-heading mb-1">Amazing Work!</h3>
                  <p className="text-sm text-body">You've completed all your guidance for today. Keep up the great momentum!</p>
                  <motion.button
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-glow hover:opacity-90 transition-all"
                  >
                    Back to Dashboard
                  </motion.button>
                </motion.div>
              ) : (
                <motion.p
                  key="quote"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs text-label italic"
                >
                  "Small steps every day lead to big changes over time."
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}

export default DailyRoutinePage
