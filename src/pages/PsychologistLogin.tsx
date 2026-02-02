import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, User, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const PsychologistLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error, clearError } = useAuth()

  // Get the intended destination from location state, or default to psychologist dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/psychologist-dashboard'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(formData)
      // Redirect to intended destination or dashboard
      navigate(from, { replace: true })
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex flex-col">
      {/* Back Button */}
      <div className="p-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-soft p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center border-2 border-accent/40">
                <div className="w-10 h-10 border-3 border-accent rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-accent rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-montserrat font-bold text-heading text-center mb-2">
              Psychologist Portal
            </h1>
            <p className="text-body text-center mb-8">
              Sign in to manage sessions & students
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
                    <User className="w-5 h-5 text-gray-400" />
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
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-heading placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-heading tracking-wider mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-heading placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-montserrat font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-body mt-6">
              Not a user?{' '}
              <Link to="/signup/psychologist" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PsychologistLogin
