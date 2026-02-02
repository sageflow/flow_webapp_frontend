import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, TrendingUp, Calendar, BarChart3, Target, Activity } from 'lucide-react'
import { apiService } from '../services/api'
import { HabitsSummary, SleepHabits, DietHabits, ExerciseHabits, ScreenTimeHabits, MediaConsumptionHabits } from '../services/types'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const HabitsDashboard: React.FC = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [habitsSummary, setHabitsSummary] = useState<HabitsSummary | null>(null)
  const [recentHabits, setRecentHabits] = useState<{
    sleep: SleepHabits[]
    diet: DietHabits[]
    exercise: ExerciseHabits[]
    screen: ScreenTimeHabits[]
    media: MediaConsumptionHabits[]
  }>({
    sleep: [],
    diet: [],
    exercise: [],
    screen: [],
    media: []
  })

  useEffect(() => {
    if (user?.id) {
      loadHabitsData()
    }
  }, [user?.id, timeRange])

  const loadHabitsData = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      let summary: HabitsSummary
      
      switch (timeRange) {
        case 'week':
          summary = await apiService.getWeeklyHabitsSummary(user!.id)
          break
        case 'month':
          summary = await apiService.getMonthlyHabitsSummary(user!.id)
          break
        case 'quarter':
          // For quarter, we'll use custom date range
          const endDate = new Date().toISOString().split('T')[0]
          const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          summary = await apiService.getHabitsSummary(user!.id, startDate, endDate)
          break
        default:
          summary = await apiService.getWeeklyHabitsSummary(user!.id)
      }
      
      setHabitsSummary(summary)

      // Load recent habits for the selected time range
      const endDate = new Date().toISOString().split('T')[0]
      let startDate: string
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'month':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case 'quarter':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        default:
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      const [sleep, diet, exercise, screen, media] = await Promise.all([
        apiService.getSleepHabitsByDateRange(user!.id, startDate, endDate),
        apiService.getDietHabitsByDateRange(user!.id, startDate, endDate),
        apiService.getExerciseHabitsByDateRange(user!.id, startDate, endDate),
        apiService.getScreenTimeHabitsByDateRange(user!.id, startDate, endDate),
        apiService.getMediaConsumptionHabitsByDateRange(user!.id, startDate, endDate)
      ])

      setRecentHabits({ sleep, diet, exercise, screen, media })
      
    } catch (error) {
      console.error('Failed to load habits data:', error)
      setError('Failed to load habits data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string = 'text-primary') => (
    <div className="bg-white p-6 rounded-input shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')} bg-opacity-10`}>
          {icon}
        </div>
        <span className="text-sm text-label">Last {timeRange}</span>
      </div>
      <h3 className="text-2xl font-bold text-heading mb-1">{value}</h3>
      <p className="text-sm text-label">{subtitle}</p>
      <p className="text-lg font-semibold text-heading">{title}</p>
    </div>
  )

  const renderTrendChart = (data: any[], title: string, valueKey: string, color: string) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d[valueKey] || 0))
    const minValue = Math.min(...data.map(d => d[valueKey] || 0))
    const range = maxValue - minValue || 1

    return (
      <div className="bg-white p-6 rounded-input shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-heading mb-4">{title}</h3>
        <div className="flex items-end justify-between h-32 space-x-1">
          {data.slice(-7).map((item, index) => {
            const value = item[valueKey] || 0
            const height = ((value - minValue) / range) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${color} rounded-t-sm transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <span className="text-xs text-label mt-2 text-center">
                  {formatDate(item.date)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="lg" message="Loading habits dashboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-montserrat font-bold text-heading">SageFlow</span>
          </div>
          
          <h1 className="text-h1 text-heading mb-2">Habits Dashboard</h1>
          <p className="text-body text-body">Monitor your habits and track your progress over time</p>
        </div>

        {/* Time Range Selector */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-label font-medium">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {(['week', 'month', 'quarter'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-input font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-label hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Health Score */}
        {habitsSummary && (
          <div className="card mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-montserrat font-semibold text-heading mb-4">Overall Health Score</h2>
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getHealthScoreBg(habitsSummary.overallHealthScore)} mb-4`}>
                <span className={`text-4xl font-bold ${getHealthScoreColor(habitsSummary.overallHealthScore)}`}>
                  {habitsSummary.overallHealthScore}
                </span>
              </div>
              <p className="text-body text-body">out of 100</p>
              <div className="mt-4">
                <Link to="/daily-habits" className="btn-primary">
                  Track Today's Habits
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {habitsSummary && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {renderMetricCard(
              'Sleep Quality',
              `${habitsSummary.sleep.averageQualityScore.toFixed(1)}/5`,
              `${habitsSummary.sleep.averageSleepHours.toFixed(1)}h avg`,
              <Target className="w-5 h-5 text-blue-600" />,
              'text-blue-600'
            )}
            
            {renderMetricCard(
              'Water Intake',
              `${habitsSummary.diet.averageWaterIntake.toFixed(0)}ml`,
              `${habitsSummary.diet.averageMealsConsumed.toFixed(1)} meals`,
              <Activity className="w-5 h-5 text-cyan-600" />,
              'text-cyan-600'
            )}
            
            {renderMetricCard(
              'Exercise',
              `${habitsSummary.exercise.averageExerciseHours.toFixed(1)}h`,
              `${habitsSummary.exercise.totalCaloriesBurned.toFixed(0)} cal`,
              <TrendingUp className="w-5 h-5 text-green-600" />,
              'text-green-600'
            )}
            
            {renderMetricCard(
              'Screen Time',
              `${habitsSummary.screen.averageScreenTimeHours.toFixed(1)}h`,
              `${habitsSummary.screen.averagePreSleepScreenTime.toFixed(0)}min pre-sleep`,
              <BarChart3 className="w-5 h-5 text-purple-600" />,
              'text-purple-600'
            )}
          </div>
        )}

        {/* Trend Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {renderTrendChart(
            recentHabits.sleep,
            'Sleep Quality Trend',
            'sleepQuality',
            'bg-blue-500'
          )}
          
          {renderTrendChart(
            recentHabits.diet,
            'Water Intake Trend',
            'waterIntake',
            'bg-cyan-500'
          )}
          
          {renderTrendChart(
            recentHabits.exercise,
            'Exercise Hours Trend',
            'duration',
            'bg-green-500'
          )}
          
          {renderTrendChart(
            recentHabits.screen,
            'Screen Time Trend',
            'totalScreenTime',
            'bg-purple-500'
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentHabits.sleep.slice(-5).reverse().map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-input">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-heading">Sleep</p>
                    <p className="text-sm text-label">
                      {habit.bedtime} - {habit.wakeTime} ({habit.totalHours}h)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-heading">Quality: {habit.sleepQuality}/5</p>
                  <p className="text-sm text-label">{formatDate(habit.date)}</p>
                </div>
              </div>
            ))}
            
            {recentHabits.exercise.slice(-5).reverse().map((habit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-input">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-heading">Exercise</p>
                    <p className="text-sm text-label">
                      {habit.exerciseType} ({habit.duration}h)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-heading">{habit.caloriesBurned} cal</p>
                  <p className="text-sm text-label">{formatDate(habit.date)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/daily-habits" className="btn-outline">
              View All Habits
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HabitsDashboard
