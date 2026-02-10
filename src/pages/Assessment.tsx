import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Brain, Heart, ArrowLeft, ArrowRight, AlertCircle, Save, Timer, CheckCircle } from 'lucide-react'
import { apiService } from '../services/api'
import { TestQuestions, TestQuestion, CompleteTestRequest } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

interface ParsedOptions {
  [key: string]: string
}

const AssessmentPage: React.FC = () => {
  const { testType, testId } = useParams<{ testType: string; testId: string }>()
  const navigate = useNavigate()
  
  const [testData, setTestData] = useState<TestQuestions | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({}) // questionNumber -> selected option key (A, B, C, etc.)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true)
        if (testType && testId) {
          const data = await apiService.getPendingSpecificTest(testType, parseInt(testId))
          setTestData(data)
          setStartTime(new Date())
        }
      } catch (error) {
        console.error('Failed to fetch test:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        setError(`Failed to load test: ${message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testType, testId])

  // Timer effect
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // Parse options JSON string
  const parseOptions = (optionsStr: string): ParsedOptions => {
    try {
      return JSON.parse(optionsStr)
    } catch {
      console.error('Failed to parse options:', optionsStr)
      return {}
    }
  }

  // Get unique sections
  const getSections = (): string[] => {
    if (!testData) return []
    const sections = new Set<string>()
    testData.testQuestions.forEach(q => sections.add(q.sectionName))
    return Array.from(sections)
  }

  // Get questions for current section
  const getQuestionsForSection = (sectionName: string): TestQuestion[] => {
    if (!testData) return []
    return testData.testQuestions.filter(q => q.sectionName === sectionName)
  }

  // Get current question
  const getCurrentQuestion = (): TestQuestion | null => {
    if (!testData || testData.testQuestions.length === 0) return null
    return testData.testQuestions[currentQuestionIndex]
  }

  // Get test icon based on type
  const getTestIcon = () => {
    if (testType?.toUpperCase() === 'IQ') {
      return <Brain className="w-5 h-5 text-white" />
    }
    return <Heart className="w-5 h-5 text-white" />
  }

  // Get test color based on type
  const getTestColor = () => {
    if (testType?.toUpperCase() === 'IQ') {
      return 'from-primary to-accent'
    }
    return 'from-positive to-green-400'
  }

  const currentQuestion = getCurrentQuestion()
  const totalQuestions = testData?.testQuestions.length || 0
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0
  const answeredCount = Object.keys(answers).length

  const handleAnswerSelect = (optionKey: string) => {
    if (!currentQuestion) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex + 1]: optionKey // Using 1-based index as question number
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmit = async () => {
    if (!testData || !testId || !testType) return

    try {
      setIsSubmitting(true)
      
      const request: CompleteTestRequest = {
        testType: testType.toUpperCase(),
        testId: parseInt(testId),
        answers
      }

      const result = await apiService.completeTest(request)
      
      if (result.success) {
        navigate('/assessment-suite', { state: { message: result.message || 'Test completed successfully!' } })
      } else {
        setError(result.message || 'Failed to complete test. Please try again.')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit test. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading test..." />
      </div>
    )
  }

  if (error && !testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Error Loading Test</h2>
          <p className="text-body text-body mb-4">{error}</p>
          <Link to="/assessment-suite" className="btn-primary">
            Back to Assessment Suite
          </Link>
        </div>
      </div>
    )
  }

  if (!testData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Test Not Found</h2>
          <p className="text-body text-body mb-4">The test you're looking for doesn't exist.</p>
          <Link to="/assessment-suite" className="btn-primary">
            Back to Assessment Suite
          </Link>
        </div>
      </div>
    )
  }

  const parsedOptions = parseOptions(currentQuestion.options)
  const sections = getSections()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${getTestColor()} rounded-full flex items-center justify-center`}>
                {getTestIcon()}
              </div>
              <span className="text-xl font-montserrat font-bold text-heading">
                {testType?.toUpperCase()} Test
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-label">
                <Timer className="w-4 h-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <Link 
                to="/assessment-suite" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Suite
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-label">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-sm font-medium text-label">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getTestColor()} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="card mb-6">
              {/* Section Badge */}
              <div className="mb-4">
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {currentQuestion.sectionName}
                </span>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-xl font-montserrat font-semibold text-heading leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(parsedOptions).map(([key, value]) => {
                  const isSelected = answers[currentQuestionIndex + 1] === key
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswerSelect(key)}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 flex items-start space-x-3 ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {key}
                      </span>
                      <span className="text-body pt-1">{value}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage message={error} />}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || answeredCount < totalQuestions}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Submit Test</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:w-80">
            <div className="card sticky top-6">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-4">
                Question Navigator
              </h3>
              
              <div className="mb-4 text-sm text-label">
                <span className="font-medium text-heading">{answeredCount}</span> of {totalQuestions} answered
              </div>

              {/* Questions by Section */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {sections.map((section) => {
                  const sectionQuestions = getQuestionsForSection(section)
                  const startIndex = testData.testQuestions.findIndex(q => q.sectionName === section)
                  
                  return (
                    <div key={section}>
                      <h4 className="text-xs font-semibold text-label uppercase tracking-wide mb-2">
                        {section}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sectionQuestions.map((_, idx) => {
                          const globalIndex = startIndex + idx
                          const isAnswered = !!answers[globalIndex + 1]
                          const isCurrent = globalIndex === currentQuestionIndex
                          
                          return (
                            <button
                              key={globalIndex}
                              onClick={() => handleQuestionJump(globalIndex)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                isCurrent
                                  ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                                  : isAnswered
                                  ? 'bg-positive/20 text-positive border border-positive/30'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {isAnswered && !isCurrent ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                idx + 1
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Submit Button in Sidebar */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount < totalQuestions}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Submit Test ({answeredCount}/{totalQuestions})</span>
                    </>
                  )}
                </button>
                {answeredCount < totalQuestions && (
                  <p className="text-xs text-center text-label mt-2">
                    Please answer all questions before submitting
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

export default AssessmentPage
