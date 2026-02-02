import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Sun,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { GuidanceResponse } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const DailyRoutinePage: React.FC = () => {
  const { loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guidances, setGuidances] = useState<GuidanceResponse[]>([])
  const [completingId, setCompletingId] = useState<number | null>(null)

  const fetchTodaysGuidances = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Fetching today\'s guidances...')
      const data = await apiService.getTodaysGuidances()
      console.log('Guidances received:', data)
      setGuidances(data)
    } catch (error) {
      console.error('Failed to fetch today\'s guidances:', error)
      setError('Failed to load today\'s guidance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const markAsComplete = async (guidanceId: number) => {
    try {
      setCompletingId(guidanceId)
      setError('')
      const updatedGuidance = await apiService.markGuidanceAsComplete(guidanceId)
      // Update the local state with the completed guidance
      setGuidances(prev => 
        prev.map(g => g.id === guidanceId ? updatedGuidance : g)
      )
    } catch (error) {
      console.error('Failed to mark guidance as complete:', error)
      setError('Failed to mark as complete. Please try again.')
    } finally {
      setCompletingId(null)
    }
  }

  useEffect(() => {
    // Only fetch once auth is done loading
    if (!authLoading) {
      fetchTodaysGuidances()
    }
  }, [authLoading])

  const completedCount = guidances.filter(g => g.isCompleted).length
  const totalCount = guidances.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your daily guidance..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Daily Guidance
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchTodaysGuidances}
                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-orange-700 mb-4">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(new Date().toISOString())}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Your Daily Guidance
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Personalized activities to help you thrive today. Complete each one to build positive habits.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Progress Card */}
        {guidances.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl shadow-orange-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Today's Progress</h2>
                  <p className="text-sm text-gray-500">{completedCount} of {totalCount} completed</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-emerald-600">{completionPercentage}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Guidance List */}
        {guidances.length > 0 ? (
          <div className="space-y-4">
            {guidances.map((guidance, index) => (
              <div 
                key={guidance.id}
                className={`group bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  guidance.isCompleted 
                    ? 'ring-2 ring-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50' 
                    : 'hover:scale-[1.01]'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Number Badge */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      guidance.isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                    }`}>
                      {guidance.isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg leading-relaxed ${
                        guidance.isCompleted 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-800'
                      }`}>
                        {guidance.guidanceText}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Added {formatTime(guidance.createdAt)}</span>
                        </div>
                        {guidance.isCompleted && guidance.completedAt && (
                          <div className="flex items-center space-x-1 text-emerald-500">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed at {formatTime(guidance.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {guidance.isCompleted ? (
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                      ) : (
                        <button
                          onClick={() => markAsComplete(guidance.id)}
                          disabled={completingId === guidance.id}
                          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all duration-200 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark as complete"
                        >
                          {completingId === guidance.id ? (
                            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 group-hover/btn:text-white transition-colors" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-xl shadow-orange-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sun className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Guidance for Today</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Check back later! Your personalized daily guidance will appear here once it's ready.
            </p>
          </div>
        )}

        {/* Motivational Footer */}
        {guidances.length > 0 && completionPercentage < 100 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 italic">
              "Small steps every day lead to big changes over time."
            </p>
          </div>
        )}

        {guidances.length > 0 && completionPercentage === 100 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-center text-white">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold mb-1">Amazing Work!</h3>
            <p className="text-emerald-100">You've completed all your guidance for today. Keep up the great momentum!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyRoutinePage
