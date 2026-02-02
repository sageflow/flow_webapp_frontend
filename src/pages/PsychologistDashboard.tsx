import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Brain,
  MapPin, 
  User, 
  Clock, 
  Sparkles, 
  Settings, 
  LogOut,
  Calendar,
  CheckCircle,
  XCircle,
  GraduationCap,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface BookingRequest {
  id: number
  studentName: string
  studentInitials: string
  age: number
  grade: string
  appointmentTime: string
  issue: string
  isAffiliate: boolean
}

const PsychologistDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mock data for psychologist profile
  const psychologistProfile = {
    name: user?.username || 'Dr. Anderson',
    title: 'Clinical Psychologist',
    licenseNumber: '#88291',
    location: 'California, US',
    yearsOfExperience: 38,
    specialization: 'Child Well-being'
  }

  // Mock booking requests
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: 1,
      studentName: 'Alex M.',
      studentInitials: 'AM',
      age: 12,
      grade: '10th',
      appointmentTime: 'Today, 2:00 PM',
      issue: 'Exam Anxiety',
      isAffiliate: true
    },
    {
      id: 2,
      studentName: 'Jordan T.',
      studentInitials: 'JT',
      age: 11,
      grade: '9th',
      appointmentTime: 'Tomorrow, 10:00 AM',
      issue: 'Peer Conflict',
      isAffiliate: false
    },
    {
      id: 3,
      studentName: 'Casey R.',
      studentInitials: 'CR',
      age: 14,
      grade: '11th',
      appointmentTime: 'Tomorrow, 2:00 PM',
      issue: 'Academic Stress',
      isAffiliate: true
    }
  ])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleApprove = (id: number) => {
    setBookingRequests(prev => prev.filter(req => req.id !== id))
    // TODO: Call API to approve booking
    console.log('Approved booking:', id)
  }

  const handleDecline = (id: number) => {
    setBookingRequests(prev => prev.filter(req => req.id !== id))
    // TODO: Call API to decline booking
    console.log('Declined booking:', id)
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <nav className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-montserrat font-bold text-heading">SageFlow</span>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(psychologistProfile.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-heading">{psychologistProfile.name}</p>
                  <p className="text-xs text-label">Psychologist</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {/* Profile Header in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getInitials(psychologistProfile.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">{psychologistProfile.name}</p>
                        <p className="text-xs text-label">{psychologistProfile.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                    <div className="flex items-center space-x-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-body">License {psychologistProfile.licenseNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-body">{psychologistProfile.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-body">{psychologistProfile.yearsOfExperience} Years Experience</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Sparkles className="w-4 h-4 text-gray-400" />
                      <span className="text-body">{psychologistProfile.specialization}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors w-full"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors w-full"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">
            Welcome back, {psychologistProfile.name}
          </h1>
          <p className="text-body">
            {psychologistProfile.title} • License {psychologistProfile.licenseNumber}
          </p>
        </div>

        {/* Booking Requests Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-montserrat font-semibold text-primary uppercase tracking-wide">
              Booking Requests
            </h2>
          </div>

          {bookingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-body">No pending booking requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Student Info */}
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center text-primary font-semibold text-lg">
                      {request.studentInitials}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-heading">{request.studentName}</h3>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                          Age: {request.age}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-body">
                        <span className="flex items-center space-x-1">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span>Grade {request.grade}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{request.appointmentTime}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
                          <Sparkles className="w-3 h-3" />
                          <span>{request.issue}</span>
                        </span>
                        {request.isAffiliate && (
                          <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200">
                            AFFILIATE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PsychologistDashboard
