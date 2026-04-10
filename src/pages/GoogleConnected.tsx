import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'

const GoogleConnected: React.FC = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/psychologist-dashboard', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center border border-gray-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Google Calendar Connected</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Your Google account has been linked successfully. You can now manage session bookings
          and your schedule will sync automatically.
        </p>

        <div className="flex items-center justify-center gap-3 bg-violet-50 rounded-xl px-4 py-3 mb-8">
          <Calendar className="w-5 h-5 text-violet-600" />
          <span className="text-sm font-medium text-violet-700">Calendar sync is active</span>
        </div>

        <button
          onClick={() => navigate('/psychologist-dashboard', { replace: true })}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}…
        </p>
      </motion.div>
    </div>
  )
}

export default GoogleConnected
