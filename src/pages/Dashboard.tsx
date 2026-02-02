import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, LogOut, Heart, Shield, FileText, Calendar, BarChart3, ClipboardList, User, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
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
                  <p className="text-xs text-label">Student</p>
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
                        <p className="text-xs text-label">Student Account</p>
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
          <h1 className="text-h1 text-heading mb-2">Welcome to Your Dashboard</h1>
          <p className="text-body text-body">Manage your mental health, habits, and academic progress</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
