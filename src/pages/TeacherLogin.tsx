import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Lock, BookOpen, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import AuthPageBackground from '../components/common/AuthPageBackground'
import AuthNavbar from '../components/common/AuthNavbar'

const TeacherLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error, clearError } = useAuth()

  // Get the intended destination from location state, or default to teacher dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/teacher-dashboard'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(formData, 'role_teacher')
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
      <AuthPageBackground />

      {/* Top Header */}
      <AuthNavbar />

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

            {/* BookOpen icon badge */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-glow">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-montserrat font-bold text-heading text-center mb-1">
              Sign in as Teacher
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
              Not a Registered Teacher?{' '}
              <Link to="/signup/teacher" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TeacherLogin
