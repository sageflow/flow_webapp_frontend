import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Clock, DollarSign, Calendar, Users, Heart, Brain, Award, Mail } from 'lucide-react'

import { apiService } from '../services/api'
import { Therapist } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const TherapistProfile: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>()

  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock data for development (remove when backend is ready)
  const getMockTherapist = (id: number): Therapist => ({
    id: id,
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialization: 'Cognitive Behavioral Therapy',
    yearsOfExperience: 8,
    biography: 'Dr. Sarah Johnson is a licensed clinical psychologist with over 8 years of experience specializing in Cognitive Behavioral Therapy (CBT) for adolescents and young adults. She has helped hundreds of students overcome anxiety, depression, academic stress, and social challenges.\n\nDr. Johnson received her Ph.D. in Clinical Psychology from Stanford University and completed her postdoctoral training at the renowned Child Mind Institute in New York. Her approach combines evidence-based CBT techniques with a warm, empathetic style that helps students feel comfortable and supported.\n\nShe specializes in treating:\n• Anxiety disorders and panic attacks\n• Depression and mood disorders\n• Academic stress and performance anxiety\n• Social anxiety and peer relationship issues\n• Trauma and PTSD\n• ADHD and executive functioning challenges\n\nDr. Johnson believes in empowering students with practical tools and strategies they can use in their daily lives. She works collaboratively with families and schools to ensure comprehensive support for her clients.',
    licenseNumber: 'PSY-1234',
    rating: 4.8,
    reviewCount: 450,
    hourlyRate: 120,
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
    ]
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
        setError('Failed to load therapist profile. Please try again.')
        // Fallback to mock data for development
        setTherapist(getMockTherapist(parseInt(therapistId || '1')))
      } finally {
        setLoading(false)
      }
    }

    fetchTherapist()
  }, [therapistId])

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isTherapistAvailable = (therapist: Therapist) => {
    return therapist.availability.some(avail => avail.isAvailable)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading Therapist Profile..." />
      </div>
    )
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Therapist Not Found</h2>
          <p className="text-body text-body mb-4">The therapist you're looking for doesn't exist.</p>
          <Link to="/therapist-marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
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
              to="/therapist-marketplace" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Therapist Header */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-montserrat font-bold text-heading mb-2">
                    Dr. {therapist.firstName} {therapist.lastName}
                  </h1>
                  <p className="text-xl text-body mb-3">{therapist.specialization}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className={`w-5 h-5 ${getRatingColor(therapist.rating)} fill-current`} />
                      <span className={`text-lg font-semibold ${getRatingColor(therapist.rating)}`}>
                        {therapist.rating}
                      </span>
                    </div>
                    <span className="text-label">({therapist.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span className={`inline-block px-3 py-2 rounded-full text-sm font-medium ${
                    isTherapistAvailable(therapist)
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isTherapistAvailable(therapist) ? 'Available for Sessions' : 'Currently Unavailable'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-input">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-lg font-semibold text-primary">{therapist.yearsOfExperience}</div>
                  <p className="text-xs text-label">Years Experience</p>
                </div>
                
                <div className="text-center p-3 bg-positive/10 rounded-input">
                  <DollarSign className="w-6 h-6 text-positive mx-auto mb-2" />
                  <div className="text-lg font-semibold text-positive">${therapist.hourlyRate}</div>
                  <p className="text-xs text-label">Per Hour</p>
                </div>
                
                <div className="text-center p-3 bg-accent/10 rounded-input">
                  <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-lg font-semibold text-accent">
                    {therapist.availability.filter(avail => avail.isAvailable).length}
                  </div>
                  <p className="text-xs text-label">Available Days</p>
                </div>
                
                <div className="text-center p-3 bg-action/10 rounded-input">
                  <Award className="w-6 h-6 text-action mx-auto mb-2" />
                  <div className="text-lg font-semibold text-action">{therapist.licenseNumber}</div>
                  <p className="text-xs text-label">License</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <div className="card">
              <h2 className="text-2xl font-montserrat font-semibold text-heading mb-4">About Dr. {therapist.lastName}</h2>
              <div className="prose prose-sm max-w-none">
                {therapist.biography.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-body text-body mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="card">
              <h2 className="text-2xl font-montserrat font-semibold text-heading mb-4">Weekly Schedule</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {therapist.availability.map((slot, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-input ${
                    slot.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-heading">{slot.dayOfWeek}</span>
                    </div>
                    <div className="text-sm text-label">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      slot.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="card">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-body">License: {therapist.licenseNumber}</span>
                </div>
              </div>
            </div>

            {/* Session Booking */}
            <div className="card">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-4">Book a Session</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-input">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">${therapist.hourlyRate}</div>
                  <p className="text-sm text-label">per hour</p>
                </div>
                
                <Link
                  to={`/schedule-session/${therapist.id}`}
                  className={`btn-primary w-full text-center ${
                    !isTherapistAvailable(therapist) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    if (!isTherapistAvailable(therapist)) {
                      e.preventDefault()
                    }
                  }}
                >
                  {isTherapistAvailable(therapist) ? 'Schedule Session' : 'Currently Unavailable'}
                </Link>
                
                {!isTherapistAvailable(therapist) && (
                  <p className="text-xs text-label text-center">
                    Dr. {therapist.lastName} is not currently accepting new sessions. Please check back later.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapistProfile
