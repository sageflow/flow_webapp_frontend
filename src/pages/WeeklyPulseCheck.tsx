import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, CheckCircle, Smile, Frown, Meh } from 'lucide-react'

import { apiService } from '../services/api'
import { WeeklyPulseRequest } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

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
        
        // Check if user can submit
        // 403 = user is not a student (e.g. admin/teacher) → treat as "cannot submit"
        try {
          const canSubmitResult = await apiService.canSubmitPulse()
          setCanSubmit(canSubmitResult)
        } catch (err: any) {
          const status = err?.status
          if (status === 403) {
            // Non-student user – they simply can't submit pulses
            setCanSubmit(false)
          } else {
            throw err // re-throw unexpected errors
          }
        }

        // Try to get current week's pulse
        // 404 = no pulse submitted this week (normal)
        // 403 = non-student user (already handled above, just skip)
        try {
          const pulse = await apiService.getCurrentWeekPulse()
          setCurrentPulse(pulse)
          if (pulse?.rating) {
            setRating(pulse.rating)
          }
        } catch (err: any) {
          const status = err?.status
          if (status === 404 || status === 403) {
            // No pulse for this week or not a student – that's okay
            console.log('No current pulse found')
          } else {
            throw err
          }
        }
      } catch (error) {
        console.error('Failed to fetch pulse check data:', error)
        setError('Failed to load pulse check. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle rating selection
  const handleRatingChange = (value: number) => {
    setRating(value)
    setError('')
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      setError('Please select a rating before submitting.')
      return
    }

    if (!canSubmit) {
      setError('You have already submitted your weekly pulse check for this week.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const request: WeeklyPulseRequest = {
        rating: rating
      }

      await apiService.submitWeeklyPulse(request)
      
      setSuccess(true)
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit pulse check. Please try again.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Get rating emoji
  const getRatingEmoji = (value: number) => {
    if (value >= 4) return <Smile className="w-8 h-8 text-green-500" />
    if (value >= 3) return <Meh className="w-8 h-8 text-yellow-500" />
    return <Frown className="w-8 h-8 text-red-500" />
  }

  // Get rating label
  const getRatingLabel = (value: number) => {
    const labels: Record<number, string> = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Neutral',
      4: 'Good',
      5: 'Excellent'
    }
    return labels[value] || ''
  }

  // Get rating color
  const getRatingColor = (value: number) => {
    if (value >= 4) return 'text-green-600 border-green-500'
    if (value >= 3) return 'text-yellow-600 border-yellow-500'
    return 'text-red-600 border-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-montserrat font-semibold text-heading mb-2">Check-in Complete!</h2>
          <p className="text-body text-body mb-6">
            Thank you for taking the time to check in with us. Your response helps us understand your well-being 
            and provide better support throughout your academic journey.
          </p>
          
          <div className="bg-white p-6 rounded-input border-2 border-green-200 mb-6">
            <p className="text-sm text-label mb-2">Your Rating:</p>
            <div className="flex items-center justify-center space-x-2">
              {rating && getRatingEmoji(rating)}
              <p className="text-lg font-montserrat font-semibold text-green-600">
                {rating}/5 - {getRatingLabel(rating)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-input border-2 border-blue-200 mb-6">
            <p className="text-sm text-label mb-2">Next Check-in:</p>
            <p className="text-lg font-montserrat font-semibold text-blue-600">
              Next week
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/dashboard" className="btn-primary w-full block text-center">
              Return to Dashboard
            </Link>
            <Link to="/wellness" className="btn-outline w-full block text-center">
              View My Wellness
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If user cannot submit or already has a pulse for this week, show the "Already Submitted" view
  if (!canSubmit || currentPulse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Already Submitted</h2>
          <p className="text-body text-body mb-4">
            You have already submitted your weekly pulse check for this week. Please check back next week.
          </p>
          
          {currentPulse && (
            <div className="bg-white p-6 rounded-input border-2 border-green-200 mb-6">
              <p className="text-sm text-label mb-2">Your Rating This Week:</p>
              <div className="flex items-center justify-center space-x-2">
                {getRatingEmoji(currentPulse.rating)}
                <p className="text-lg font-montserrat font-semibold text-green-600">
                  {currentPulse.rating}/5 - {getRatingLabel(currentPulse.rating)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Submitted on {new Date(currentPulse.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Link to="/dashboard" className="btn-primary w-full block text-center">
              Return to Dashboard
            </Link>
            <Link to="/wellness" className="btn-outline w-full block text-center">
              View My Wellness
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-positive to-accent rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-montserrat font-bold text-heading">SageFlow</span>
            </div>
            
            <Link 
              to="/dashboard" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">Weekly Wellness Check-in</h1>
          <p className="text-body text-body">
            Take a moment to reflect on how you're feeling this week. Your response helps us understand your well-being and provide better support.
          </p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Rating Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-montserrat font-semibold text-heading mb-4">
                  How would you rate your overall well-being this week?
                </h2>
                <p className="text-body text-body">
                  Select a rating from 1 (Very Poor) to 5 (Excellent)
                </p>
              </div>

              {/* Rating Scale Labels */}
              <div className="flex justify-between text-sm text-label mb-6">
                <span>Very Poor</span>
                <span>Excellent</span>
              </div>

              {/* Rating Buttons */}
              <div className="flex justify-center items-center space-x-4 mb-6">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isSelected = rating === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingChange(value)}
                      className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? `${getRatingColor(value)} bg-white shadow-lg scale-110`
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {getRatingEmoji(value)}
                      <span className={`text-xs font-semibold mt-1 ${isSelected ? getRatingColor(value).split(' ')[0] : 'text-gray-500'}`}>
                        {value}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Selected Rating Display */}
              {rating && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 rounded-full">
                    {getRatingEmoji(rating)}
                    <span className={`text-lg font-semibold ${getRatingColor(rating).split(' ')[0]}`}>
                      {rating}/5 - {getRatingLabel(rating)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting || !rating}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Check-in'
                )}
              </button>
              
              {!rating && (
                <p className="text-sm text-label text-center mt-3">
                  Please select a rating before submitting
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-montserrat font-semibold text-heading mb-3">Why We Check In</h3>
            <div className="space-y-2 text-sm text-body">
              <p>• Monitor your emotional well-being over time</p>
              <p>• Identify patterns in your overall wellness</p>
              <p>• Provide personalized support and resources</p>
              <p>• Help you develop healthy coping strategies</p>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-montserrat font-semibold text-heading mb-3">Your Privacy</h3>
            <div className="space-y-2 text-sm text-body">
              <p>• All responses are kept confidential</p>
              <p>• Only you and authorized staff can see your data</p>
              <p>• Used solely for your well-being and support</p>
              <p>• One submission per week to track your progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyPulseCheck
