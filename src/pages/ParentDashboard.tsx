import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Brain,
  Heart,
  Activity,
  Smile,
  Users,
  Download,
  Calendar,
  CheckCircle,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Child {
  id: number
  name: string
  initials: string
  class: string
  rollNo: number
  age: number
}

interface ChildStats {
  iqScore: number
  iqLabel: string
  eqScore: number
  eqLabel: string
  wellbeing: number
  wellbeingLabel: string
  averageMood: number
  moodLabel: string
  nextAssessment: string
}

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedChildId, setSelectedChildId] = useState<number>(1)
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

  // Mock data - will be replaced with API data
  const parentName = user?.username || 'Mrs. Miller'

  const children: Child[] = [
    {
      id: 1,
      name: 'Alex Miller',
      initials: 'AL',
      class: '5A',
      rollNo: 12,
      age: 10
    },
    {
      id: 2,
      name: 'Sarah Miller',
      initials: 'SA',
      class: '8B',
      rollNo: 8,
      age: 13
    }
  ]

  // Mock stats per child - will come from API
  const childStats: Record<number, ChildStats> = {
    1: {
      iqScore: 125,
      iqLabel: 'High Average',
      eqScore: 110,
      eqLabel: 'Above Average',
      wellbeing: 88,
      wellbeingLabel: 'Stable',
      averageMood: 8.2,
      moodLabel: 'Stable',
      nextAssessment: 'Nov 15, 2025'
    },
    2: {
      iqScore: 118,
      iqLabel: 'Above Average',
      eqScore: 122,
      eqLabel: 'High Average',
      wellbeing: 92,
      wellbeingLabel: 'Excellent',
      averageMood: 8.5,
      moodLabel: 'Stable',
      nextAssessment: 'Nov 20, 2025'
    }
  }

  const selectedChild = children.find(c => c.id === selectedChildId)!
  const stats = childStats[selectedChildId]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
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
                <div className="w-9 h-9 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(parentName)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-heading">{parentName}</p>
                  <p className="text-xs text-label">Parent</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-heading">{parentName}</p>
                    <p className="text-xs text-label">Parent Account</p>
                  </div>
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-h1 text-heading mb-1">Parent Dashboard</h1>
            <p className="text-body">Welcome back, {parentName}</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors">
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Book a Psychologist</span>
            </button>
          </div>
        </div>

        {/* My Family Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-heading" />
            <h2 className="text-lg font-montserrat font-semibold text-heading">My Family</h2>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedChildId === child.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                  selectedChildId === child.id
                    ? 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {child.initials}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-heading">{child.name}</p>
                  <p className="text-sm text-label">Class {child.class} • Age {child.age}</p>
                </div>
                {selectedChildId === child.id && (
                  <CheckCircle className="w-5 h-5 text-primary ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Child Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-semibold text-2xl border-2 border-gray-200">
                {selectedChild.initials}
              </div>
              <div>
                <h3 className="text-xl font-montserrat font-semibold text-heading">{selectedChild.name}</h3>
                <p className="text-body">
                  Class {selectedChild.class} • Roll No. {selectedChild.rollNo} • Age {selectedChild.age}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <p className="text-sm text-label">Next Assessment</p>
              <p className="text-lg font-semibold text-primary">{stats.nextAssessment}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* IQ Score Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-teal-500" />
            </div>
            <p className="text-4xl font-montserrat font-bold text-heading mb-1">{stats.iqScore}</p>
            <p className="text-sm font-medium text-label uppercase tracking-wide mb-1">IQ Score</p>
            <p className="text-sm text-teal-600 font-medium">{stats.iqLabel}</p>
          </div>

          {/* EQ Score Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <p className="text-4xl font-montserrat font-bold text-heading mb-1">{stats.eqScore}</p>
            <p className="text-sm font-medium text-label uppercase tracking-wide mb-1">EQ Score</p>
            <p className="text-sm text-pink-600 font-medium">{stats.eqLabel}</p>
          </div>

          {/* Wellbeing Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-4xl font-montserrat font-bold text-heading mb-1">{stats.wellbeing}%</p>
            <p className="text-sm font-medium text-label uppercase tracking-wide mb-1">Wellbeing</p>
            <p className="text-sm text-amber-600 font-medium">{stats.wellbeingLabel}</p>
          </div>

          {/* Average Mood Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smile className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-4xl font-montserrat font-bold text-heading mb-1">{stats.averageMood}</p>
            <p className="text-sm font-medium text-label uppercase tracking-wide mb-1">Average Mood</p>
            <p className="text-sm text-green-600 font-medium">{stats.moodLabel}</p>
          </div>
        </div>

        {/* Placeholder for API integration */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This dashboard is using mock data. API integration is in progress.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard
