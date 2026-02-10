import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Brain, ArrowLeft, ArrowRight, Timer, CheckCircle, Sparkles } from 'lucide-react'
import { apiService } from '../services/api'
import { OceanQuestion, CompleteTestRequest } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const QUESTIONS_PER_PAGE = 10

// Maps to backend QuestionResponseType enum: A(1), B(2), C(3), D(4), E(5)
const LIKERT_OPTIONS = [
  { value: 'A', display: 1, label: 'Strongly Disagree', color: 'bg-red-500' },
  { value: 'B', display: 2, label: 'Disagree', color: 'bg-orange-400' },
  { value: 'C', display: 3, label: 'Neutral', color: 'bg-yellow-400' },
  { value: 'D', display: 4, label: 'Agree', color: 'bg-lime-400' },
  { value: 'E', display: 5, label: 'Strongly Agree', color: 'bg-green-500' },
]

const OceanTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<OceanQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({}) // questionNumber -> A/B/C/D/E
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await apiService.getOceanQuestions()
        setQuestions(data)
        setStartTime(new Date())
      } catch (error) {
        console.error('Failed to fetch OCEAN questions:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        setError(`Failed to load personality test: ${message}`)
      } finally {
        setLoading(false)
      }
    }

    if (testId) {
      fetchQuestions()
    }
  }, [testId])

  // Timer effect
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  )
  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  const handleAnswerSelect = (questionNumber: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: value
    }))
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (!testId) {
      setError('Test ID is missing.')
      return
    }

    if (answeredCount < questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    try {
      setIsSubmitting(true)
      
      const request: CompleteTestRequest = {
        testType: 'Big5',
        testId: parseInt(testId),
        answers // Already in format: { questionNumber: 'A'/'B'/'C'/'D'/'E' }
      }

      const result = await apiService.completeTest(request)
      
      if (result.success) {
        navigate('/assessment-suite', { 
          state: { message: result.message || 'Personality test completed successfully!' } 
        })
      } else {
        setError(result.message || 'Failed to submit test. Please try again.')
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

  const isPageComplete = () => {
    return currentQuestions.every(q => answers[q.questionNumber] !== undefined)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading personality test..." />
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-montserrat font-semibold text-heading mb-2">Error Loading Test</h2>
          <p className="text-body text-body mb-4">{error}</p>
          <Link to="/assessment-suite" className="btn-primary">
            Back to Assessment Suite
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-soft sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-montserrat font-bold text-heading">
                Big Five Personality Test
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-montserrat font-semibold text-heading">Your Progress</h2>
              <p className="text-sm text-label">
                {answeredCount} of {questions.length} questions answered
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</span>
              <p className="text-xs text-label">Complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex items-start space-x-3">
            <Brain className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-heading mb-1">Instructions</h3>
              <p className="text-sm text-body">
                Rate how accurately each statement describes you on a scale from 
                <span className="font-medium text-red-600"> Strongly Disagree (1)</span> to 
                <span className="font-medium text-green-600"> Strongly Agree (5)</span>. 
                There are no right or wrong answers—just be honest!
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {currentQuestions.map((question) => {
            const isAnswered = answers[question.questionNumber] !== undefined
            return (
              <div 
                key={question.questionNumber} 
                className={`card transition-all duration-300 ${
                  isAnswered ? 'ring-2 ring-purple-200 bg-purple-50/30' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                    isAnswered 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isAnswered ? <CheckCircle className="w-4 h-4" /> : question.questionNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-medium mb-4">
                      {question.questionText}
                    </p>
                    
                    {/* Likert Scale */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs text-gray-500 sm:w-24 text-center sm:text-right">Disagree</span>
                      <div className="flex justify-center gap-2 sm:gap-3 flex-1">
                        {LIKERT_OPTIONS.map((option) => {
                          const isSelected = answers[question.questionNumber] === option.value
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleAnswerSelect(question.questionNumber, option.value)}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                                isSelected
                                  ? `${option.color} text-white scale-110 shadow-lg`
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                              }`}
                              title={option.label}
                            >
                              {option.display}
                            </button>
                          )
                        })}
                      </div>
                      <span className="text-xs text-gray-500 sm:w-24 text-center sm:text-left">Agree</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentPage(i)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  i === currentPage
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div>
            {currentPage < totalPages - 1 ? (
              <button
                onClick={handleNextPage}
                disabled={!isPageComplete()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isPageComplete() ? 'Please answer all questions on this page' : ''}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || answeredCount < questions.length}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Test</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Submit reminder */}
        {currentPage === totalPages - 1 && answeredCount < questions.length && (
          <p className="text-center text-sm text-label mt-4">
            Please answer all {questions.length - answeredCount} remaining questions before submitting.
          </p>
        )}
      </div>
    </div>
  )
}

export default OceanTest

