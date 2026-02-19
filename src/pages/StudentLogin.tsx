import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, User, Lock, GraduationCap, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const StudentLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error, clearError } = useAuth()

  // Get the intended destination from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(formData, 'role_student')
      // Redirect to intended destination or dashboard
      navigate(from, { replace: true })
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">

      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-violet-500 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-pink-400 to-purple-500 blur-[130px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-400 to-purple-400 blur-[100px] rounded-full pointer-events-none"
      />

      {/* Top Header: Back on left, Logo on right */}
      <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        {/* Back Button — left side */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[#5f269e] bg-white/60 backdrop-blur-md hover:bg-white/85 border border-white/50 hover:border-purple-200 shadow-soft transition-all duration-200 text-sm font-semibold font-jakarta"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Logo + Brand name — right side */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotateY: 360, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ transformPerspective: 600 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 16px rgba(139, 92, 246, 0.25)',
                  '0 0 32px rgba(139, 92, 246, 0.45)',
                  '0 0 16px rgba(139, 92, 246, 0.25)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="rounded-full"
            >
              <img
                src="/logo.png"
                alt="SageFlow"
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            </motion.div>
          </motion.div>
          <span className="text-xl font-montserrat font-bold text-heading group-hover:text-primary transition-colors duration-200">
            SageFlow
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Login Card — glassmorphism */}
          <div className="glass-card p-8">

            {/* Graduation cap badge */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-glow">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-montserrat font-bold text-heading text-center mb-1">
              Sign in as Student
            </h1>
            <p className="text-sm text-body text-center mb-7">
              Welcome back! Enter your credentials to continue.
            </p>

            {/* Error Message */}
            {error && (
              <ErrorMessage
                message={error}
                onClose={clearError}
                className="mb-6"
              />
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-heading tracking-wider mb-2">
                  USERNAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-heading tracking-wider">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors duration-150"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7C3AED] hover:text-primary-dark transition-colors duration-150"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-purple text-white font-montserrat font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-glow hover:shadow-glow-lg"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  'Sign In to continue'
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-body mt-6">
              Not a Registered Student?{' '}
              <Link to="/signup/student" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentLogin
