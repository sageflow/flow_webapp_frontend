import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Heart, Shield, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { apiService } from '../services/api'
import { WeeklyPulseRequest } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import AuthNavbar from '../components/common/AuthNavbar'

// ── Rating metadata ──────────────────────────────────────────────
const RATINGS = [
  { value: 1, emoji: '😞', label: 'Very Poor', gradient: 'from-red-500 to-rose-600', ring: 'ring-red-400', text: 'text-red-600', bg: 'bg-red-50' },
  { value: 2, emoji: '😕', label: 'Poor', gradient: 'from-orange-400 to-amber-500', ring: 'ring-orange-400', text: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 3, emoji: '😐', label: 'Neutral', gradient: 'from-amber-400 to-yellow-500', ring: 'ring-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 4, emoji: '🙂', label: 'Good', gradient: 'from-teal-400 to-emerald-500', ring: 'ring-teal-400', text: 'text-teal-700', bg: 'bg-teal-50' },
  { value: 5, emoji: '😄', label: 'Excellent', gradient: 'from-violet-500 to-purple-600', ring: 'ring-violet-400', text: 'text-violet-700', bg: 'bg-violet-50' },
]

const WeeklyPulseCheck: React.FC = () => {
  const navigate = useNavigate()

  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [currentPulse, setCurrentPulse] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        try {
          const canSubmitResult = await apiService.canSubmitPulse()
          setCanSubmit(canSubmitResult)
        } catch (err: any) {
          if (err?.status === 403) setCanSubmit(false)
          else throw err
        }
        try {
          const pulse = await apiService.getCurrentWeekPulse()
          setCurrentPulse(pulse)
          if (pulse?.rating) setRating(pulse.rating)
        } catch (err: any) {
          if (err?.status !== 404 && err?.status !== 403) throw err
        }
      } catch {
        setError('Failed to load pulse check. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleRatingChange = (value: number) => {
    setRating(value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { setError('Please select a rating before submitting.'); return }
    if (!canSubmit) { setError('You have already submitted your weekly pulse check for this week.'); return }
    try {
      setSubmitting(true)
      setError('')
      const request: WeeklyPulseRequest = { rating }
      await apiService.submitWeeklyPulse(request)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMeta = RATINGS.find(r => r.value === rating)

  // ── Page shell (shared) ──────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      {/* Ambient orbs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[130px] rounded-full pointer-events-none" />
      <AuthNavbar backTo="/dashboard" backLabel="Dashboard" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        {children}
      </div>
    </div>
  )

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) return (
    <Shell>
      <LoadingSpinner size="lg" />
    </Shell>
  )

  // ── Success ──────────────────────────────────────────────────────
  if (success) return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-montserrat font-bold text-heading mb-2">Check-in Complete!</h2>
        <p className="text-sm text-body mb-6 leading-relaxed">
          Thank you for checking in. We'll use this to better support you throughout your week.
        </p>
        {selectedMeta && (
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl ${selectedMeta.bg} mb-6`}>
            <span className="text-3xl">{selectedMeta.emoji}</span>
            <span className={`text-base font-bold ${selectedMeta.text}`}>{rating}/5 — {selectedMeta.label}</span>
          </div>
        )}
        <p className="text-xs text-label">Redirecting to dashboard in a moment…</p>
      </motion.div>
    </Shell>
  )

  // ── Already submitted ────────────────────────────────────────────
  if (!canSubmit || currentPulse) {
    const pulseMeta = RATINGS.find(r => r.value === currentPulse?.rating)
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-montserrat font-bold text-heading mb-2">Already Submitted</h2>
          <p className="text-sm text-body mb-6 leading-relaxed">
            You've already shared your pulse this week. Come back next week!
          </p>
          {currentPulse && pulseMeta && (
            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl ${pulseMeta.bg} mb-6`}>
              <span className="text-3xl">{pulseMeta.emoji}</span>
              <div className="text-left">
                <p className={`text-base font-bold ${pulseMeta.text}`}>{currentPulse.rating}/5 — {pulseMeta.label}</p>
                <p className="text-xs text-label">Submitted {new Date(currentPulse.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold py-3 rounded-xl shadow-glow hover:opacity-90 transition-all duration-200"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </Shell>
    )
  }

  // ── Main form ────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="w-full max-w-2xl">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h1 className="text-h1 text-heading mb-1">Weekly Wellness Check-in</h1>
          <p className="text-body text-body max-w-lg mx-auto">
            Take a moment to reflect on how you're feeling this week. Your response helps us understand your well-being and provide better support.
          </p>
        </motion.div>

        {/* Error */}
        {error && <ErrorMessage message={error} onClose={() => setError('')} className="mb-5" />}

        {/* Rating card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-8 mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="text-center">
              <h2 className="text-xl font-montserrat font-bold text-heading mb-1">
                How would you rate your overall well-being this week?
              </h2>
              <p className="text-sm text-label">Tap a face to select your rating</p>
            </div>

            {/* Rating buttons */}
            <div className="flex justify-center items-end gap-3 sm:gap-5">
              {RATINGS.map((r, idx) => {
                const isSelected = rating === r.value
                return (
                  <motion.button
                    key={r.value}
                    type="button"
                    onClick={() => handleRatingChange(r.value)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.06 }}
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${isSelected
                        ? `bg-gradient-to-br ${r.gradient} border-transparent shadow-glow`
                        : 'bg-white/60 border-white/60 hover:border-violet-200 hover:bg-white/80'
                      }`}
                  >
                    <span className={`text-4xl transition-all duration-200 ${isSelected ? 'filter-none' : 'grayscale opacity-70'}`}>
                      {r.emoji}
                    </span>
                    <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {r.value}
                    </span>
                    <span className={`text-[10px] font-semibold leading-tight text-center transition-colors ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                      {r.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="selectedDot"
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow"
                      >
                        <div className="w-2 h-2 rounded-full bg-violet-600" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Selection feedback */}
            <AnimatePresence mode="wait">
              {selectedMeta ? (
                <motion.div
                  key={selectedMeta.value}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`flex items-center justify-center gap-3 py-3 px-6 rounded-2xl ${selectedMeta.bg}`}
                >
                  <span className="text-2xl">{selectedMeta.emoji}</span>
                  <p className={`text-sm font-bold ${selectedMeta.text}`}>
                    {selectedMeta.value}/5 — {selectedMeta.label}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-label"
                >
                  Please select a rating to continue
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || !rating}
              whileHover={rating ? { scale: 1.02 } : {}}
              whileTap={rating ? { scale: 0.98 } : {}}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold py-3.5 rounded-xl shadow-glow hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit Check-in
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="text-sm font-montserrat font-bold text-heading">Why We Check In</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-body">
              {[
                'Monitor your emotional well-being over time',
                'Identify patterns in your overall wellness',
                'Provide personalised support and resources',
                'Help you develop healthy coping strategies',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="text-sm font-montserrat font-bold text-heading">Your Privacy</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-body">
              {[
                'All responses are kept confidential',
                'Only you and authorised staff can see your data',
                'Used solely for your well-being and support',
                'One submission per week to track your progress',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </Shell>
  )
}

export default WeeklyPulseCheck
