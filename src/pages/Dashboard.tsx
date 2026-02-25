import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Brain, LogOut, Heart, Shield, FileText, Calendar,
  BarChart3, ClipboardList, User, ChevronDown, Settings,
  AlertCircle, CheckCircle, ArrowRight, Dumbbell, Eye, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { StudentInterestDTO, PhysicalProfileResponse } from '../services/types'

interface ProfileSummary {
  interests: StudentInterestDTO | null
  physicalProfile: PhysicalProfileResponse | null
}

// ─── Quick-action card data ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    to: '/weekly-pulse-check',
    gradient: 'from-emerald-400 to-teal-500',
    icon: <Heart className="w-6 h-6 text-white" />,
    title: 'Weekly Pulse',
    desc: 'Take your weekly wellness pulse check',
  },
  {
    to: '/daily-routine',
    gradient: 'from-blue-400 to-indigo-500',
    icon: <Calendar className="w-6 h-6 text-white" />,
    title: 'Daily Routine',
    desc: 'Your personalized daily activities',
  },
  {
    to: '/anonymous-complaint',
    gradient: 'from-rose-400 to-red-500',
    icon: <Shield className="w-6 h-6 text-white" />,
    title: 'Report Issue',
    desc: 'Lodge anonymous complaints safely',
  },
  {
    to: '/complaints',
    gradient: 'from-violet-400 to-purple-600',
    icon: <FileText className="w-6 h-6 text-white" />,
    title: 'Track Issue',
    desc: 'Track your submitted complaints',
  },
  {
    to: '/wellness',
    gradient: 'from-pink-400 to-fuchsia-500',
    icon: <BarChart3 className="w-6 h-6 text-white" />,
    title: 'Wellness Report',
    desc: 'View your stress levels & wellbeing',
  },
  {
    to: '/assessment-suite',
    gradient: 'from-amber-400 to-orange-500',
    icon: <ClipboardList className="w-6 h-6 text-white" />,
    title: 'Tests',
    desc: 'Take IQ, EQ & personality tests',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
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

  // ─── Profile completion banner ──────────────────────────────────────────────
  const renderProfileCompletionBanner = () => {
    if (isProfileCompleted) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500/90 to-purple-600/90 backdrop-blur-sm p-6 shadow-glow border border-violet-400/30">
          {/* Decorative orb */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-montserrat font-semibold text-white">Complete Your Holistic Profile</h3>
                <p className="text-sm text-white/80 mt-0.5 leading-relaxed max-w-xl">
                  Help us understand you better by completing your profile. This enables personalized wellness recommendations, habit tracking, and tailored support.
                </p>
              </div>
            </div>
            <Link
              to="/holistic-profile"
              className="flex items-center gap-2 bg-white text-violet-600 font-montserrat font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-all duration-200 whitespace-nowrap flex-shrink-0 shadow-sm"
            >
              Complete Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Profile summary card ───────────────────────────────────────────────────
  const renderProfileSummaryCard = () => {
    if (!isProfileCompleted) return null

    const { interests, physicalProfile } = profileSummary
    const hobbyCount = interests?.hobbies?.length || 0
    const professionCount = interests?.professions?.length || 0
    const accoladeCount = interests?.accolades?.length || 0

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <div className="glass-card overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-montserrat font-semibold text-white">Your Holistic Profile</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                    <span className="text-xs text-white/75">Profile completed</span>
                  </div>
                </div>
              </div>
              <Link
                to="/holistic-profile"
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all duration-200"
              >
                <Settings className="w-3.5 h-3.5" />
                Edit Profile
              </Link>
            </div>
          </div>

          {profileLoading ? (
            <div className="p-6 text-center">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-label">Loading profile…</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50/70 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-heading">{hobbyCount}</p>
                  <p className="text-xs text-label mt-1">Hobbies</p>
                </div>

                <div className="bg-purple-50/70 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-heading">{professionCount}</p>
                  <p className="text-xs text-label mt-1">Aspirations</p>
                </div>

                <div className="bg-amber-50/70 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-heading">{accoladeCount}</p>
                  <p className="text-xs text-label mt-1">Achievements</p>
                </div>

                <div className="bg-green-50/70 rounded-xl p-4 text-center">
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

              {(physicalProfile || interests) && (
                <div className="mt-4 pt-4 border-t border-white/40">
                  <div className="flex flex-wrap gap-2">
                    {physicalProfile?.bodyWeightKg && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                        <Dumbbell className="w-3 h-3" />
                        {physicalProfile.bodyWeightKg} kg
                      </span>
                    )}
                    {physicalProfile?.medicalCondition && physicalProfile.medicalCondition !== 'NONE' && (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        {physicalProfile.medicalCondition.replace(/_/g, ' ')}
                      </span>
                    )}
                    {physicalProfile?.textToSpeechNeeded && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                        <Eye className="w-3 h-3" />
                        Text-to-Speech
                      </span>
                    )}
                    {physicalProfile?.motorSupportNeeded && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                        <Eye className="w-3 h-3" />
                        Motor Support
                      </span>
                    )}
                    {interests?.hobbies?.slice(0, 3).map(hobby => (
                      <span key={hobby} className="inline-flex items-center bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full">
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
      </motion.div>
    )
  }

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 relative overflow-x-hidden">

      {/* Subtle ambient orbs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[130px] rounded-full pointer-events-none" />

      {/* ── Header ── */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img src="/logo.png" alt="SageFlow" className="w-9 h-9 object-contain drop-shadow-sm" />
              </motion.div>
              <span className="text-xl font-montserrat font-bold text-heading group-hover:text-primary transition-colors duration-200">
                SageFlow
              </span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 hover:bg-white/80 rounded-xl px-3 py-2 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-glow">
                  {getInitials(user?.username || 'U')}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-heading leading-tight">{user?.username || 'User'}</p>
                  <p className="text-xs text-label">{getRoleLabel(user?.role)}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                  >
                    {/* Profile header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-violet-50 to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
                          {getInitials(user?.username || 'U')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.username || 'User'}</p>
                          <p className="text-xs text-violet-600 font-medium">{getRoleLabel(user?.role)} Account</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <Link
                        to="/holistic-profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <span className="font-medium">View Profile</span>
                        {!isProfileCompleted && (
                          <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            Incomplete
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/holistic-profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors flex-shrink-0">
                          <Settings className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <span className="font-medium">Edit Profile</span>
                      </Link>
                    </div>

                    {/* Logout — clearly separated */}
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-150"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <span>Log out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">

        {/* Welcome heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-h1 text-heading mb-1">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">{user?.username || 'User'}</span>!
          </h1>
          <p className="text-body text-body">Manage your mental health, habits, and academic progress</p>
        </motion.div>

        {/* Profile completion banner / summary card */}
        {renderProfileCompletionBanner()}
        {renderProfileSummaryCard()}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-lg font-montserrat font-semibold text-heading mb-5">Quick Actions</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

            {/* Holistic Profile card — rendered separately for conditional badge */}
            <Link to="/holistic-profile" className="group">
              <motion.div
                whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(139, 92, 246, 0.18)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-card p-5 h-full relative overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-glow ${isProfileCompleted ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-montserrat font-semibold text-heading">Holistic Profile</h3>
                      {isProfileCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-label mt-0.5">
                      {isProfileCompleted ? 'View & update your profile' : 'Complete your profile to get started'}
                    </p>
                  </div>
                </div>
                {/* Decorative corner */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/10 to-white/0 rounded-full" />
              </motion.div>
            </Link>

            {/* All other quick-action cards */}
            {QUICK_ACTIONS.map((action, idx) => (
              <Link key={action.to} to={action.to} className="group">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * (idx + 1) }}
                  whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(139, 92, 246, 0.18)' }}
                  className="glass-card p-5 h-full relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-glow`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-montserrat font-semibold text-heading">{action.title}</h3>
                      <p className="text-sm text-label mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/10 to-white/0 rounded-full" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
