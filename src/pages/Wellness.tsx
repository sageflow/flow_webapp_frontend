import React, { useState, useEffect } from 'react'
import {
  Heart, RefreshCw, Sparkles, Activity,
  AlertTriangle, CheckCircle, TrendingUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { StudentWellbeing } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import AuthNavbar from '../components/common/AuthNavbar'

// ── colour helpers ────────────────────────────────────────────────
const colourMap = {
  green: { gradient: 'from-emerald-400 to-teal-500', ring: '#10b981', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200/60' },
  yellow: { gradient: 'from-amber-400 to-yellow-500', ring: '#f59e0b', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200/60' },
  orange: { gradient: 'from-orange-400 to-amber-500', ring: '#f97316', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200/60' },
  red: { gradient: 'from-red-400 to-rose-500', ring: '#ef4444', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200/60' },
} as const
type ColourKey = keyof typeof colourMap
const getColour = (c: string): typeof colourMap[ColourKey] =>
  colourMap[(c?.toLowerCase() as ColourKey) ?? 'green'] ?? colourMap.green

const getStressLabel = (pct: number) => {
  if (pct <= 30) return 'Low'
  if (pct <= 60) return 'Moderate'
  if (pct <= 80) return 'High'
  return 'Very High'
}

const getStressIcon = (pct: number) => {
  if (pct <= 30) return <CheckCircle className="w-6 h-6" />
  if (pct <= 60) return <Activity className="w-6 h-6" />
  return <AlertTriangle className="w-6 h-6" />
}

// ── Animated SVG ring ─────────────────────────────────────────────
const StressRing: React.FC<{ pct: number; colour: string; size?: number; stroke?: number }> = ({
  pct, colour, size = 120, stroke = 10
}) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const { ring } = getColour(colour)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede9fe" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={ring} strokeWidth={stroke}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
const WellnessPage: React.FC = () => {
  const { loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wellbeingData, setWellbeingData] = useState<StudentWellbeing[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchWellbeing = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError('')
      const data = await apiService.getTodaysWellbeing()
      setWellbeingData(data)
    } catch {
      setError('Failed to load wellbeing data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { if (!authLoading) fetchWellbeing() }, [authLoading])

  const overallStress = wellbeingData.length > 0
    ? Math.round(wellbeingData.reduce((s, w) => s + w.stressPercentage, 0) / wellbeingData.length)
    : 0
  const overallColour = wellbeingData[0]?.stressColour ?? 'green'
  const overallMeta = getColour(overallColour)

  // ── Shell ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      {/* Ambient orbs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[130px] rounded-full pointer-events-none" />

      <AuthNavbar backTo="/dashboard" backLabel="Dashboard" />

      <div className="max-w-2xl w-full mx-auto px-6 pb-16 relative z-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-violet-700 mb-4 border border-violet-100/60">
            <Sparkles className="w-3.5 h-3.5" />
            Today's Wellness Check
          </div>
          <h1 className="text-h1 text-heading mb-1">Your Wellbeing Status</h1>
          <p className="text-body text-body max-w-md mx-auto">
            Understanding your stress levels helps you make better decisions for your mental health.
          </p>
        </motion.div>

        {/* Error */}
        {error && <ErrorMessage message={error} onClose={() => setError('')} className="mb-5" />}

        {/* Loading */}
        {(authLoading || loading) ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : wellbeingData.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-14 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-lg font-montserrat font-bold text-heading mb-2">No Wellness Data Yet</h3>
            <p className="text-sm text-body max-w-xs mx-auto mb-6">
              Your wellbeing assessment will appear here once it's available. Check back later!
            </p>
            <button
              onClick={() => fetchWellbeing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-semibold transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── Overall stress card ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="glass-card p-6 mb-5"
            >
              <div className="flex items-center gap-5">
                {/* Ring */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <StressRing pct={overallStress} colour={overallColour} />
                  <div className="absolute text-center">
                    <p className="text-xl font-montserrat font-bold text-heading leading-none">{overallStress}%</p>
                    <p className="text-[10px] text-label font-semibold">{getStressLabel(overallStress)}</p>
                  </div>
                </div>

                {/* Text + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${overallMeta.gradient} flex items-center justify-center shadow-sm text-white`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-bold text-heading">Overall Stress Level</p>
                  </div>
                  <p className="text-xs text-label mb-3">Based on today's assessment</p>
                  <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallStress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${overallMeta.gradient}`}
                    />
                  </div>
                </div>

                {/* Refresh */}
                <button
                  onClick={() => fetchWellbeing(true)}
                  title="Refresh"
                  className="w-9 h-9 rounded-xl bg-white/70 hover:bg-violet-50 border border-white/60 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 text-violet-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* ── Individual wellbeing cards ── */}
            <div className="space-y-3 mb-5">
              {wellbeingData.map((w, i) => {
                const m = getColour(w.stressColour)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 + i * 0.08 }}
                    className={`glass-card p-5 border-l-4 ${m.border}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-sm`}>
                        {getStressIcon(w.stressPercentage)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-bold ${m.text}`}>
                            Stress Level: {getStressLabel(w.stressPercentage)}
                          </p>
                          <span className={`text-xl font-bold ${m.text}`}>{w.stressPercentage}%</span>
                        </div>

                        <div className="w-full bg-white/60 rounded-full h-2 mb-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${w.stressPercentage}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 + i * 0.08 }}
                            className={`h-full rounded-full bg-gradient-to-r ${m.gradient}`}
                          />
                        </div>

                        <p className="text-xs text-body leading-relaxed">{w.wellbeingGist}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Footer banner ── */}
            <AnimatePresence mode="wait">
              {overallStress <= 30 ? (
                <motion.div
                  key="great"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-7 text-center"
                >
                  <div className="text-4xl mb-3">🌟</div>
                  <h3 className="text-base font-montserrat font-bold text-heading mb-1">You're Doing Great!</h3>
                  <p className="text-sm text-body">Your stress levels are low. Keep up the positive habits!</p>
                </motion.div>
              ) : overallStress > 50 ? (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-heading mb-2">Tips to Reduce Stress</p>
                      <ul className="space-y-1">
                        {[
                          'Take short breaks throughout the day',
                          'Practice deep breathing exercises',
                          'Get enough sleep tonight',
                          'Talk to someone you trust',
                        ].map(tip => (
                          <li key={tip} className="flex items-start gap-1.5 text-xs text-body">
                            <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}

export default WellnessPage
