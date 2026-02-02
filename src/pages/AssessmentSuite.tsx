import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Play, Target, Heart, AlertCircle, Sparkles } from 'lucide-react'
import { apiService } from '../services/api'
import { PendingTests } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AssessmentSuite: React.FC = () => {
  const [pendingTests, setPendingTests] = useState<PendingTests[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const tests = await apiService.getPendingTests()
        setPendingTests(tests)
      } catch (error) {
        console.error('Failed to fetch assessment data:', error)
        setError('Failed to load assessments. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getAssessmentIcon = (testType: string) => {
    switch (testType.toUpperCase()) {
      case 'IQ':
        return <Brain className="w-6 h-6 text-primary" />
      case 'EQ':
        return <Heart className="w-6 h-6 text-positive" />
      case 'BIG5':
        return <Sparkles className="w-6 h-6 text-purple-500" />
      default:
        return <Target className="w-6 h-6 text-action" />
    }
  }

  const getAssessmentColor = (testType: string) => {
    switch (testType.toUpperCase()) {
      case 'IQ':
        return 'from-primary/10 to-primary/20 border-primary/30'
      case 'EQ':
        return 'from-positive/10 to-positive/20 border-positive/30'
      case 'BIG5':
        return 'from-purple-100 to-pink-100 border-purple-300'
      default:
        return 'from-action/10 to-action/20 border-action/30'
    }
  }

  const getTestLink = (test: PendingTests) => {
    // Big5 tests use the OCEAN test page with Likert scale
    if (test.testType.toUpperCase() === 'BIG5') {
      return `/ocean-test/${test.testId}`
    }
    // IQ and EQ tests use the standard assessment page
    return `/assessment/${test.testType}/${test.testId}`
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading assessments..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Error Loading Assessments</h2>
          <p className="text-body text-body mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
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
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-montserrat font-bold text-heading">SageFlow</span>
            </div>
            
            <Link 
              to="/dashboard" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">Tests</h1>
          <p className="text-body text-body">Take IQ, EQ, and OCEAN/Big5 personality tests to understand your abilities and traits</p>
        </div>

        {/* Pending Tests */}
        <div className="mb-12">
          <h2 className="text-h2 text-heading mb-6">Pending Tests</h2>
          {pendingTests.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-body text-body">No pending tests at this time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingTests.map((test) => (
                <div key={`${test.testType}-${test.testId}`} className="card hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r rounded-full flex items-center justify-center ${getAssessmentColor(test.testType)}`}>
                      {getAssessmentIcon(test.testType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-montserrat font-semibold text-heading">{test.testName}</h3>
                      <p className="text-sm text-label">{test.testType} Test</p>
                    </div>
                  </div>
                  
                  {test.overdueDays > 0 && (
                    <div className="mb-4 flex items-center space-x-2 text-warning">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {test.overdueDays} {test.overdueDays === 1 ? 'day' : 'days'} overdue
                      </span>
                    </div>
                  )}
                  
                  <Link
                    to={getTestLink(test)}
                    className="btn-primary w-full flex items-center justify-center group-hover:scale-105 transition-transform"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AssessmentSuite
