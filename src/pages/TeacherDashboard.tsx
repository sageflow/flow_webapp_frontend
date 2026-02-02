import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Brain,
  Users,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Student {
  id: number
  name: string
  class: string
  moodScore: number
  riskLevel: 'Low' | 'Medium' | 'High'
}

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const classDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setIsClassDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mock data - will be replaced with API data
  const teacherName = user?.username || 'Mr. Robert Smith'

  const stats = {
    totalStudents: 42,
    needsAttention: 3
  }

  const classes = ['All Classes', '5A', '5B', '6A', '6B', '7A', '7B']

  // Mock student data - will come from API
  const [students] = useState<Student[]>([
    { id: 1, name: 'Alex Miller', class: '5A', moodScore: 8.5, riskLevel: 'Low' },
    { id: 2, name: 'Sarah Jones', class: '5A', moodScore: 6.2, riskLevel: 'Medium' },
    { id: 3, name: 'Mike Ross', class: '5B', moodScore: 9, riskLevel: 'Low' },
    { id: 4, name: 'Emma Watson', class: '5A', moodScore: 4.5, riskLevel: 'High' },
    { id: 5, name: 'John Davis', class: '5B', moodScore: 7.8, riskLevel: 'Low' },
    { id: 6, name: 'Lisa Chen', class: '5A', moodScore: 5.5, riskLevel: 'Medium' },
  ])

  // Filter students based on search and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass
    return matchesSearch && matchesClass
  })

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

  const getMoodScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-500'
    if (score >= 5) return 'bg-amber-500'
    return 'bg-orange-500'
  }

  const getRiskLevelBadge = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
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
                <div className="w-9 h-9 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(teacherName)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-heading">{teacherName}</p>
                  <p className="text-xs text-label">Teacher</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-heading">{teacherName}</p>
                    <p className="text-xs text-label">Teacher Account</p>
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
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-1">Teacher Dashboard</h1>
          <p className="text-body">Overview for {teacherName}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Total Students Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-montserrat font-bold text-heading">{stats.totalStudents}</p>
                <p className="text-sm text-label">Total Students</p>
              </div>
            </div>
          </div>

          {/* Needs Attention Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-montserrat font-bold text-heading">{stats.needsAttention}</p>
                <p className="text-sm text-label">Needs Attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Roster Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-soft">
          {/* Roster Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-montserrat font-semibold text-heading">Student Roster</h2>
              <p className="text-sm text-label">Showing {filteredStudents.length} students</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-heading placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Class Filter Dropdown */}
              <div className="relative" ref={classDropdownRef}>
                <button
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="flex items-center justify-between w-full sm:w-40 px-4 py-3 bg-white border border-gray-200 rounded-xl text-heading hover:border-gray-300 transition-colors"
                >
                  <span>{selectedClass}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isClassDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40">
                    {classes.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          setSelectedClass(cls)
                          setIsClassDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                          selectedClass === cls ? 'text-primary font-medium bg-primary/5' : 'text-body'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-heading">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-heading">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-heading">Mood Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-heading">Risk Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-body">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-heading">{student.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-body">{student.class}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-2 rounded-full ${getMoodScoreColor(student.moodScore)}`} />
                          <span className="text-body font-medium">{student.moodScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRiskLevelBadge(student.riskLevel)}`}>
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Placeholder for API integration */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This dashboard is using mock data. Student listing API filtered by class is in progress.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
