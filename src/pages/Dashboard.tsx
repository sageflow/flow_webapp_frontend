import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, LogOut, Heart, Shield, FileText, Calendar, BarChart3, ClipboardList, User, ChevronDown, Settings, AlertCircle, CheckCircle, ArrowRight, Dumbbell, Bed, Utensils, Monitor, Eye, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { StudentInterestDTO, PhysicalProfileResponse } from '../services/types'

interface ProfileSummary {
  interests: StudentInterestDTO | null
  physicalProfile: PhysicalProfileResponse | null
}

const Dashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [profileSummary, setProfileSummary] = useState<ProfileSummary>({
    interests: null,
    physicalProfile: null,
  })
  const [profileLoading, setProfileLoading] = useState(true)

  const isProfileCompleted = user?.holisticProfileCompleted === true

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

  // Load profile summary data if profile is completed
  useEffect(() => {
    const loadProfileSummary = async () => {
      if (!user?.id) {
        setProfileLoading(false)
        return
      }

      try {
        const [interests, physicalProfile] = await Promise.allSettled([
          apiService.getStudentInterest(user.id),
          apiService.getPhysicalProfileByStudentId(user.id),
        ])

        const resolvedInterests = interests.status === 'fulfilled' ? interests.value : null
        const resolvedPhysicalProfile = physicalProfile.status === 'fulfilled' ? physicalProfile.value : null

        setProfileSummary({
          interests: resolvedInterests,
          physicalProfile: resolvedPhysicalProfile,
        })

        // Re-sync holistic profile completion status from backend data.
        // This handles the case where the user completed their profile in a
        // previous session and the locally-persisted flag was cleared on logout.
        if (resolvedInterests && resolvedPhysicalProfile && !user?.holisticProfileCompleted) {
          updateUser({ holisticProfileCompleted: true })
        }
      } catch (error) {
        console.error('Failed to load profile summary:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfileSummary()
  }, [user?.id])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ROLE_STUDENT': return 'Student'
      case 'ROLE_TEACHER': return 'Teacher'
      case 'ROLE_GUARDIAN': return 'Parent'
      case 'ROLE_PSYCHOLOGIST': return 'Psychologist'
      default: return 'Student'
    }
  }

  const renderProfileCompletionBanner = () => {
    if (isProfileCompleted) return null

    return (
      <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-montserrat font-semibold text-heading">Complete Your Holistic Profile</h3>
              <p className="text-sm text-body mt-1">
                Help us understand you better by completing your profile. This enables personalized wellness recommendations, habit tracking, and tailored support.
              </p>
            </div>
          </div>
          <Link
            to="/holistic-profile"
            className="btn-primary flex items-center space-x-2 whitespace-nowrap flex-shrink-0"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const renderProfileSummaryCard = () => {
    if (!isProfileCompleted) return null

    const { interests, physicalProfile } = profileSummary
    const hobbyCount = interests?.hobbies?.length || 0
    const professionCount = interests?.professions?.length || 0
    const accoladeCount = interests?.accolades?.length || 0

    return (
      <div className="mb-8 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-white">Your Holistic Profile</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-white/80">Profile completed</span>
                </div>
              </div>
            </div>
            <Link
              to="/holistic-profile"
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {profileLoading ? (
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-label">Loading profile...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Interests */}
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-heading">{hobbyCount}</p>
                <p className="text-xs text-label mt-1">Hobbies</p>
              </div>

              {/* Aspirations */}
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-heading">{professionCount}</p>
                <p className="text-xs text-label mt-1">Aspirations</p>
              </div>

              {/* Accolades */}
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-heading">{accoladeCount}</p>
                <p className="text-xs text-label mt-1">Achievements</p>
              </div>

              {/* Physical */}
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Dumbbell className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-heading">
                  {physicalProfile ? (
                    physicalProfile.heightFeet ? `${physicalProfile.heightFeet}'${physicalProfile.heightInches || 0}"` : '--'
                  ) : '--'}
                </p>
                <p className="text-xs text-label mt-1">Height</p>
              </div>
            </div>

            {/* Quick profile details */}
            {(physicalProfile || interests) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {physicalProfile?.bodyWeightKg && (
                    <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      <Dumbbell className="w-3 h-3" />
                      <span>{physicalProfile.bodyWeightKg} kg</span>
                    </span>
                  )}
                  {physicalProfile?.medicalCondition && physicalProfile.medicalCondition !== 'NONE' && (
                    <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span>{physicalProfile.medicalCondition.replace(/_/g, ' ')}</span>
                    </span>
                  )}
                  {physicalProfile?.textToSpeechNeeded && (
                    <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      <Eye className="w-3 h-3" />
                      <span>Text-to-Speech</span>
                    </span>
                  )}
                  {physicalProfile?.motorSupportNeeded && (
                    <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      <Eye className="w-3 h-3" />
                      <span>Motor Support</span>
                    </span>
                  )}
                  {interests?.hobbies?.slice(0, 3).map(hobby => (
                    <span key={hobby} className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      {hobby.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  ))}
                  {(interests?.hobbies?.length || 0) > 3 && (
                    <span className="inline-flex items-center bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full">
                      +{(interests?.hobbies?.length || 0) - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
                <div className="w-9 h-9 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(user?.username || 'U')}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-heading">{user?.username || 'User'}</p>
                  <p className="text-xs text-label">{getRoleLabel(user?.role)}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {/* Profile Header in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(user?.username || 'U')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">{user?.username || 'User'}</p>
                        <p className="text-xs text-label">{getRoleLabel(user?.role)} Account</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/holistic-profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>View Profile</span>
                      {!isProfileCompleted && (
                        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/holistic-profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Edit Profile</span>
                    </Link>
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
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">Welcome back, {user?.username || 'User'}!</h1>
          <p className="text-body text-body">Manage your mental health, habits, and academic progress</p>
        </div>

        {/* Profile Completion Banner (if not completed) */}
        {renderProfileCompletionBanner()}

        {/* Profile Summary Card (if completed) */}
        {renderProfileSummaryCard()}

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-montserrat font-semibold text-heading mb-4">Quick Actions</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Holistic Profile Card */}
          <Link to="/holistic-profile" className="card hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${isProfileCompleted ? 'from-primary to-accent' : 'from-amber-400 to-orange-500'} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-montserrat font-semibold text-heading">Holistic Profile</h3>
                  {isProfileCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-label">
                  {isProfileCompleted ? 'View & update your profile' : 'Complete your profile to get started'}
                </p>
              </div>
            </div>
            {!isProfileCompleted && (
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-amber-400">
                <AlertCircle className="w-4 h-4 text-white absolute -top-[34px] right-[2px]" />
              </div>
            )}
          </Link>

          <Link to="/weekly-pulse-check" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-positive to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-heading">Weekly Pulse</h3>
                <p className="text-sm text-label">Take your weekly wellness pulse check</p>
              </div>
            </div>
          </Link>

          <Link to="/daily-routine" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-heading">Daily Routine</h3>
                <p className="text-sm text-label">Your personalized daily activities</p>
              </div>
            </div>
          </Link>

          <Link to="/anonymous-complaint" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-alert to-action rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-heading">Report Issue</h3>
                <p className="text-sm text-label">Lodge anonymous complaints safely</p>
              </div>
            </div>
          </Link>

          <Link to="/complaints" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-heading">Track Issue</h3>
                <p className="text-sm text-label">Track your submitted complaints</p>
              </div>
            </div>
          </Link>

          <Link to="/wellness" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-heading">Wellness Report</h3>
                <p className="text-sm text-label">View your stress levels & wellbeing</p>
              </div>
            </div>
          </Link>

          <Link to="/assessment-suite" className="card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-action to-positive rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-montserrat font-semibold text-heading">Tests</h3>
                <p className="text-sm text-label">Take IQ, EQ & personality tests</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
