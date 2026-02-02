import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  ArrowLeft, 
  RefreshCw,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { StudentWellbeing } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const WellnessPage: React.FC = () => {
  const { loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wellbeingData, setWellbeingData] = useState<StudentWellbeing[]>([])

  const fetchTodaysWellbeing = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Fetching today\'s wellbeing...')
      const data = await apiService.getTodaysWellbeing()
      console.log('Wellbeing received:', data)
      setWellbeingData(data)
    } catch (error) {
      console.error('Failed to fetch today\'s wellbeing:', error)
      setError('Failed to load wellbeing data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchTodaysWellbeing()
    }
  }, [authLoading])

  const getStressLevel = (percentage: number): string => {
    if (percentage <= 30) return 'Low'
    if (percentage <= 60) return 'Moderate'
    if (percentage <= 80) return 'High'
    return 'Very High'
  }

  const getStressIcon = (percentage: number) => {
    if (percentage <= 30) return <CheckCircle className="w-6 h-6" />
    if (percentage <= 60) return <Activity className="w-6 h-6" />
    return <AlertTriangle className="w-6 h-6" />
  }

  const getGradientByColor = (color: string): string => {
    const colorLower = color?.toLowerCase() || 'green'
    switch (colorLower) {
      case 'green':
        return 'from-emerald-400 to-green-500'
      case 'yellow':
        return 'from-amber-400 to-yellow-500'
      case 'orange':
        return 'from-orange-400 to-amber-500'
      case 'red':
        return 'from-red-400 to-rose-500'
      default:
        return 'from-emerald-400 to-green-500'
    }
  }

  const getBgByColor = (color: string): string => {
    const colorLower = color?.toLowerCase() || 'green'
    switch (colorLower) {
      case 'green':
        return 'bg-emerald-50 border-emerald-200'
      case 'yellow':
        return 'bg-amber-50 border-amber-200'
      case 'orange':
        return 'bg-orange-50 border-orange-200'
      case 'red':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-emerald-50 border-emerald-200'
    }
  }

  const getTextByColor = (color: string): string => {
    const colorLower = color?.toLowerCase() || 'green'
    switch (colorLower) {
      case 'green':
        return 'text-emerald-700'
      case 'yellow':
        return 'text-amber-700'
      case 'orange':
        return 'text-orange-700'
      case 'red':
        return 'text-red-700'
      default:
        return 'text-emerald-700'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your wellness data..." />
      </div>
    )
  }

  // Calculate overall stress if we have data
  const overallStress = wellbeingData.length > 0 
    ? Math.round(wellbeingData.reduce((sum, w) => sum + w.stressPercentage, 0) / wellbeingData.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wellness
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchTodaysWellbeing}
                className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 font-medium transition-colors"
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
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-purple-700 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Today's Wellness Check</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Your Wellbeing Status
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Understanding your stress levels helps you make better decisions for your mental health.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Overall Stress Indicator */}
        {wellbeingData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradientByColor(wellbeingData[0]?.stressColour)} flex items-center justify-center shadow-lg`}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Overall Stress Level</h2>
                  <p className="text-gray-500">Based on today's assessment</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(overallStress / 100) * 352} 352`}
                      strokeLinecap="round"
                      className={getTextByColor(wellbeingData[0]?.stressColour)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{overallStress}%</span>
                    <span className="text-sm text-gray-500">{getStressLevel(overallStress)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wellbeing Cards */}
        {wellbeingData.length > 0 ? (
          <div className="space-y-4">
            {wellbeingData.map((wellbeing, index) => (
              <div 
                key={index}
                className={`rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${getBgByColor(wellbeing.stressColour)}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Stress Indicator */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${getGradientByColor(wellbeing.stressColour)} flex items-center justify-center text-white shadow-lg`}>
                    {getStressIcon(wellbeing.stressPercentage)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${getTextByColor(wellbeing.stressColour)}`}>
                        Stress Level: {getStressLevel(wellbeing.stressPercentage)}
                      </h3>
                      <span className={`text-2xl font-bold ${getTextByColor(wellbeing.stressColour)}`}>
                        {wellbeing.stressPercentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/50 rounded-full h-3 mb-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getGradientByColor(wellbeing.stressColour)} transition-all duration-500`}
                        style={{ width: `${wellbeing.stressPercentage}%` }}
                      />
                    </div>

                    {/* Gist */}
                    <p className="text-gray-700 leading-relaxed">
                      {wellbeing.wellbeingGist}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Wellness Data Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Your wellbeing assessment will appear here once it's available. Check back later!
            </p>
          </div>
        )}

        {/* Tips Section */}
        {wellbeingData.length > 0 && overallStress > 50 && (
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Tips to Reduce Stress</h3>
                <ul className="space-y-1 text-purple-100">
                  <li>• Take short breaks throughout the day</li>
                  <li>• Practice deep breathing exercises</li>
                  <li>• Get enough sleep tonight</li>
                  <li>• Talk to someone you trust</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {wellbeingData.length > 0 && overallStress <= 30 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white text-center">
            <div className="text-4xl mb-2">🌟</div>
            <h3 className="text-xl font-bold mb-1">You're Doing Great!</h3>
            <p className="text-emerald-100">Your stress levels are low. Keep up the positive habits!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WellnessPage

