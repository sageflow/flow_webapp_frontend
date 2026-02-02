import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Target, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import FormField from '../components/common/FormField'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const DailyHabitsTracker: React.FC = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [habitsData, setHabitsData] = useState({
    sleep: {
      bedtime: '',
      wakeTime: '',
      sleepQuality: 5,
      totalHours: 8,
      notes: ''
    },
    diet: {
      waterIntake: 8,
      meals: 3,
      fruitsConsumed: 2,
      vegetablesConsumed: 3,
      junkFoodFrequency: 1,
      notes: ''
    },
    exercise: {
      exerciseType: '',
      duration: 30,
      intensity: 'MODERATE',
      caloriesBurned: 0,
      notes: ''
    },
    screenTime: {
      totalScreenTime: 4,
      educationalScreenTime: 2,
      entertainmentScreenTime: 1,
      socialMediaTime: 1,
      notes: ''
    }
  })

  useEffect(() => {
    if (user) {
      loadHabitsForDate(currentDate)
    }
  }, [user, currentDate])

  const loadHabitsForDate = async (date: string) => {
    if (!user) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Load existing habits data for the selected date
      // This would typically call an API to get existing data
      console.log('Loading habits for date:', date)
    } catch (error) {
      console.error('Failed to load habits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: string | number) => {
    setHabitsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
    
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Submit habits data using the API
      // This would typically call an API to save the data
      console.log('Submitting habits data:', habitsData)
      
      setSuccess('Habits tracked successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save habits. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getSleepQualityLabel = (quality: number) => {
    if (quality >= 8) return 'Excellent'
    if (quality >= 6) return 'Good'
    if (quality >= 4) return 'Fair'
    return 'Poor'
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'LOW': return 'Low'
      case 'MODERATE': return 'Moderate'
      case 'HIGH': return 'High'
      default: return intensity
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-montserrat font-bold text-heading">SageFlow</span>
          </div>
          
          <h1 className="text-h1 text-heading mb-2">Daily Habits Tracker</h1>
          <p className="text-body text-body">Track your daily habits to build a healthier lifestyle</p>
        </div>

        {/* Date Selector */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-label font-medium">Track habits for:</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-positive" />
              <span className="text-sm text-positive font-medium">Progress Tracking Active</span>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <ErrorMessage
            message={error}
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            <span>{success}</span>
          </div>
        )}

        {/* Habits Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sleep Habits */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-montserrat font-semibold text-heading">Sleep Habits</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Bedtime"
                name="sleep.bedtime"
                type="time"
                value={habitsData.sleep.bedtime}
                onChange={(e) => handleInputChange('sleep', 'bedtime', e.target.value)}
                disabled={isLoading}
              />

              <FormField
                label="Wake Time"
                name="sleep.wakeTime"
                type="time"
                value={habitsData.sleep.wakeTime}
                onChange={(e) => handleInputChange('sleep', 'wakeTime', e.target.value)}
                disabled={isLoading}
              />

              <div>
                <label className="block text-label text-label mb-2">Sleep Quality (1-10)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={habitsData.sleep.sleepQuality}
                    onChange={(e) => handleInputChange('sleep', 'sleepQuality', parseInt(e.target.value))}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-primary min-w-[80px]">
                    {habitsData.sleep.sleepQuality} - {getSleepQualityLabel(habitsData.sleep.sleepQuality)}
                  </span>
                </div>
              </div>

              <FormField
                label="Total Sleep Hours"
                name="sleep.totalHours"
                type="number"
                value={habitsData.sleep.totalHours}
                onChange={(e) => handleInputChange('sleep', 'totalHours', parseFloat(e.target.value))}
                min="0"
                max="24"
                step="0.5"
                disabled={isLoading}
              />
            </div>

            <FormField
              label="Notes"
              name="sleep.notes"
              type="textarea"
              value={habitsData.sleep.notes}
              onChange={(e) => handleInputChange('sleep', 'notes', e.target.value)}
              placeholder="Any notes about your sleep..."
              disabled={isLoading}
            />
          </div>

          {/* Diet Habits */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-montserrat font-semibold text-heading">Diet Habits</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Water Intake (glasses)"
                name="diet.waterIntake"
                type="number"
                value={habitsData.diet.waterIntake}
                onChange={(e) => handleInputChange('diet', 'waterIntake', parseInt(e.target.value))}
                min="0"
                max="20"
                disabled={isLoading}
              />

              <FormField
                label="Meals Consumed"
                name="diet.meals"
                type="number"
                value={habitsData.diet.meals}
                onChange={(e) => handleInputChange('diet', 'meals', parseInt(e.target.value))}
                min="0"
                max="6"
                disabled={isLoading}
              />

              <FormField
                label="Fruits Consumed"
                name="diet.fruitsConsumed"
                type="number"
                value={habitsData.diet.fruitsConsumed}
                onChange={(e) => handleInputChange('diet', 'fruitsConsumed', parseInt(e.target.value))}
                min="0"
                max="10"
                disabled={isLoading}
              />

              <FormField
                label="Vegetables Consumed"
                name="diet.vegetablesConsumed"
                type="number"
                value={habitsData.diet.vegetablesConsumed}
                onChange={(e) => handleInputChange('diet', 'vegetablesConsumed', parseInt(e.target.value))}
                min="0"
                max="10"
                disabled={isLoading}
              />

              <div>
                <label className="block text-label text-label mb-2">Junk Food Frequency</label>
                <select
                  value={habitsData.diet.junkFoodFrequency}
                  onChange={(e) => handleInputChange('diet', 'junkFoodFrequency', parseInt(e.target.value))}
                  className="input-field"
                  disabled={isLoading}
                >
                  <option value={0}>None</option>
                  <option value={1}>1 time</option>
                  <option value={2}>2 times</option>
                  <option value={3}>3+ times</option>
                </select>
              </div>
            </div>

            <FormField
              label="Notes"
              name="diet.notes"
              type="textarea"
              value={habitsData.diet.notes}
              onChange={(e) => handleInputChange('diet', 'notes', e.target.value)}
              placeholder="Any notes about your diet..."
              disabled={isLoading}
            />
          </div>

          {/* Exercise Habits */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-montserrat font-semibold text-heading">Exercise Habits</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Exercise Type"
                name="exercise.exerciseType"
                type="text"
                value={habitsData.exercise.exerciseType}
                onChange={(e) => handleInputChange('exercise', 'exerciseType', e.target.value)}
                placeholder="e.g., Running, Yoga, Swimming"
                disabled={isLoading}
              />

              <FormField
                label="Duration (minutes)"
                name="exercise.duration"
                type="number"
                value={habitsData.exercise.duration}
                onChange={(e) => handleInputChange('exercise', 'duration', parseInt(e.target.value))}
                min="0"
                max="300"
                disabled={isLoading}
              />

              <div>
                <label className="block text-label text-label mb-2">Intensity Level</label>
                <select
                  value={habitsData.exercise.intensity}
                  onChange={(e) => handleInputChange('exercise', 'intensity', e.target.value)}
                  className="input-field"
                  disabled={isLoading}
                >
                  <option value="LOW">Low</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <FormField
                label="Calories Burned"
                name="exercise.caloriesBurned"
                type="number"
                value={habitsData.exercise.caloriesBurned}
                onChange={(e) => handleInputChange('exercise', 'caloriesBurned', parseInt(e.target.value))}
                min="0"
                max="2000"
                disabled={isLoading}
              />
            </div>

            <FormField
              label="Notes"
              name="exercise.notes"
              type="textarea"
              value={habitsData.exercise.notes}
              onChange={(e) => handleInputChange('exercise', 'notes', e.target.value)}
              placeholder="Any notes about your exercise..."
              disabled={isLoading}
            />
          </div>

          {/* Screen Time Habits */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-montserrat font-semibold text-heading">Screen Time Habits</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Total Screen Time (hours)"
                name="screenTime.totalScreenTime"
                type="number"
                value={habitsData.screenTime.totalScreenTime}
                onChange={(e) => handleInputChange('screenTime', 'totalScreenTime', parseFloat(e.target.value))}
                min="0"
                max="24"
                step="0.5"
                disabled={isLoading}
              />

              <FormField
                label="Educational Screen Time (hours)"
                name="screenTime.educationalScreenTime"
                type="number"
                value={habitsData.screenTime.educationalScreenTime}
                onChange={(e) => handleInputChange('screenTime', 'educationalScreenTime', parseFloat(e.target.value))}
                min="0"
                max="24"
                step="0.5"
                disabled={isLoading}
              />

              <FormField
                label="Entertainment Screen Time (hours)"
                name="screenTime.entertainmentScreenTime"
                type="number"
                value={habitsData.screenTime.entertainmentScreenTime}
                onChange={(e) => handleInputChange('screenTime', 'entertainmentScreenTime', parseFloat(e.target.value))}
                min="0"
                max="24"
                step="0.5"
                disabled={isLoading}
              />

              <FormField
                label="Social Media Time (hours)"
                name="screenTime.socialMediaTime"
                type="number"
                value={habitsData.screenTime.socialMediaTime}
                onChange={(e) => handleInputChange('screenTime', 'socialMediaTime', parseFloat(e.target.value))}
                min="0"
                max="24"
                step="0.5"
                disabled={isLoading}
              />
            </div>

            <FormField
              label="Notes"
              name="screenTime.notes"
              type="textarea"
              value={habitsData.screenTime.notes}
              onChange={(e) => handleInputChange('screenTime', 'notes', e.target.value)}
              placeholder="Any notes about your screen time..."
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Save Habits</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Summary */}
        <div className="card mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-montserrat font-semibold text-heading">Today's Progress Summary</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-input">
              <div className="text-2xl font-bold text-blue-600">{habitsData.sleep.totalHours}h</div>
              <div className="text-sm text-blue-600">Sleep</div>
              <div className="text-xs text-gray-500">{getSleepQualityLabel(habitsData.sleep.sleepQuality)}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-input">
              <div className="text-2xl font-bold text-green-600">{habitsData.diet.waterIntake}</div>
              <div className="text-sm text-green-600">Water Glasses</div>
              <div className="text-xs text-gray-500">{habitsData.diet.meals} meals</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-input">
              <div className="text-2xl font-bold text-orange-600">{habitsData.exercise.duration}m</div>
              <div className="text-sm text-orange-600">Exercise</div>
              <div className="text-xs text-gray-500">{getIntensityLabel(habitsData.exercise.intensity)}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-input">
              <div className="text-2xl font-bold text-purple-600">{habitsData.screenTime.totalScreenTime}h</div>
              <div className="text-sm text-purple-600">Screen Time</div>
              <div className="text-xs text-gray-500">{habitsData.screenTime.educationalScreenTime}h educational</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyHabitsTracker
