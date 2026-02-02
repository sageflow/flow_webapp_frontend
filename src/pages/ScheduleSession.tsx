import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Brain, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiService, Therapist, SessionRequest, SessionResponse } from '../services/api'

const ScheduleSession: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Form states
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Mock data for development (remove when backend is ready)
  const getMockTherapist = (id: number): Therapist => ({
    id: id,
    username: 'dr_sarah',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@therapy.com',
    specialization: 'Cognitive Behavioral Therapy',
    yearsOfExperience: 8,
    biography: 'Dr. Sarah Johnson is a licensed clinical psychologist specializing in CBT for adolescents and young adults. She has helped hundreds of students overcome anxiety, depression, academic stress, and social challenges through evidence-based therapeutic approaches.',
    licenseNumber: 'PSY-1234',
    rating: 4.8,
    totalSessions: 450,
    hourlyRate: 120,
    languages: ['English', 'Spanish'],
    certifications: ['Licensed Clinical Psychologist', 'CBT Specialist', 'Trauma-Informed Care'],
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' }
    ],
    isAvailable: true
  })

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        setLoading(true)
        if (therapistId) {
          let data: Therapist
          try {
            // Try to fetch from psychologist endpoint first (which exists in your backend)
            data = await apiService.getPsychologist(parseInt(therapistId))
          } catch (error) {
            // Fallback to generic therapist endpoint
            data = await apiService.getTherapist(parseInt(therapistId))
          }
          setTherapist(data)
        }
      } catch (error) {
        console.error('Failed to fetch therapist:', error)
        setError('Failed to load therapist information. Please try again.')
        // Fallback to mock data for development
        setTherapist(getMockTherapist(parseInt(therapistId || '1')))
      } finally {
        setLoading(false)
      }
    }

    fetchTherapist()
  }, [therapistId])

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3) // Allow booking up to 3 months ahead
  const maxDateStr = maxDate.toISOString().split('T')[0]

  // Generate time slots based on therapist availability
  const generateTimeSlots = () => {
    if (!therapist) return []
    
    const slots = []
    const startHour = 9 // 9 AM
    const endHour = 17 // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!therapist || !user?.id) return

    try {
      setIsSubmitting(true)
      
      const sessionRequest: SessionRequest = {
        therapistId: therapist.id,
        studentId: user.id,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        duration,
        reason,
        urgency,
      }

      let response: SessionResponse
      try {
        // Try to use psychologist booking endpoint first (which exists in your backend)
        response = await apiService.bookPsychologistSession(sessionRequest)
      } catch (error) {
        // Fallback to generic session endpoint
        response = await apiService.requestSession(sessionRequest)
      }
      
      if (response.status === 'accepted') {
        setIsSuccess(true)
        // Redirect to success page or dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      } else {
        setError(response.message || 'Session request was not accepted. Please try a different time.')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule session. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotalCost = () => {
    if (!therapist) return 0
    return (therapist.hourlyRate * duration) / 60
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body text-body">Loading Session Scheduler...</p>
        </div>
      </div>
    )
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Therapist Not Found</h2>
          <p className="text-body text-body mb-4">The therapist you're looking for doesn't exist.</p>
          <Link to="/therapist-marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-montserrat font-semibold text-heading mb-2">Session Scheduled!</h2>
          <p className="text-body text-body mb-6">
            Your therapy session with Dr. {therapist.lastName} has been successfully scheduled. 
            You'll receive a confirmation email with meeting details shortly.
          </p>
          <div className="space-y-2 text-sm text-label">
            <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Duration:</strong> {duration} minutes</p>
            <p><strong>Total Cost:</strong> ${calculateTotalCost().toFixed(2)}</p>
          </div>
          <div className="mt-6">
            <Link to="/dashboard" className="btn-primary">
              Return to Dashboard
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
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-montserrat font-bold text-heading">SageFlow</span>
            </div>
            
            <Link 
              to={`/therapist/${therapist.id}`} 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Back to Therapist Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">Schedule Therapy Session</h1>
          <p className="text-body text-body">Book a session with Dr. {therapist.firstName} {therapist.lastName}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-input flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Session Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Time Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-label mb-2">Preferred Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      max={maxDateStr}
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-label mt-1">Available up to 3 months ahead</p>
                  </div>
                  
                  <div>
                    <label className="block text-label text-label mb-2">Preferred Time *</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-label text-label mb-2">Session Duration *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="input-field"
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes (1 hour)</option>
                    <option value={90}>90 minutes (1.5 hours)</option>
                    <option value={120}>120 minutes (2 hours)</option>
                  </select>
                </div>

                {/* Reason for Session */}
                <div>
                  <label className="block text-label text-label mb-2">Reason for Session *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field w-full h-24 resize-none"
                    placeholder="Please describe what you'd like to work on during this session..."
                    required
                  />
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-label text-label mb-2">Urgency Level *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <label key={level} className="cursor-pointer">
                        <input
                          type="radio"
                          name="urgency"
                          value={level}
                          checked={urgency === level}
                          onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                          className="sr-only"
                        />
                        <div className={`p-3 border-2 rounded-input text-center transition-all ${
                          urgency === level 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <span className={`text-sm font-medium capitalize ${
                            urgency === level ? 'text-primary' : 'text-label'
                          }`}>
                            {level}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-label">
                    <span className="text-green-600">Low:</span> General support, routine check-in<br/>
                    <span className="text-yellow-600">Medium:</span> Moderate concerns, ongoing issues<br/>
                    <span className="text-red-600">High:</span> Urgent concerns, crisis support
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-label text-label mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDate || !selectedTime || !reason}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Scheduling Session...
                    </>
                  ) : (
                    'Schedule Session'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Therapist Summary */}
            <div className="card">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-4">Therapist Details</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-heading">Dr. {therapist.firstName} {therapist.lastName}</h4>
                  <p className="text-sm text-label">{therapist.specialization}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-label">Experience:</span>
                  <span className="text-body">{therapist.yearsOfExperience} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-label">Rating:</span>
                  <span className="text-body">{therapist.rating} ⭐</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-label">Sessions:</span>
                  <span className="text-body">{therapist.totalSessions}+</span>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            <div className="card">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-4">Session Summary</h3>
              <div className="space-y-3">
                {selectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-label">Date:</span>
                    <span className="text-body">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-label">Time:</span>
                    <span className="text-body">{selectedTime}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-label">Duration:</span>
                  <span className="text-body">{duration} minutes</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-label">Rate:</span>
                  <span className="text-body">${therapist.hourlyRate}/hour</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-heading">Total Cost:</span>
                  <span className="text-primary">${calculateTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-3">Important Information</h3>
              <div className="space-y-2 text-sm text-body">
                <p>• Sessions are conducted online via secure video call</p>
                <p>• You'll receive meeting details 24 hours before</p>
                <p>• Cancellations must be made 24 hours in advance</p>
                <p>• Payment is processed after session completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleSession
