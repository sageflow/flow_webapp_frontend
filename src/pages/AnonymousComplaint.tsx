import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Shield, Users, Search, X, CheckCircle, AlertCircle, FileText, Flag, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiService, CreateComplaintRequest, StudentAutocompleteDTO, IssueCategory, SeverityLevel } from '../services/api'

const AnonymousComplaint: React.FC = () => {
  const navigate = useNavigate()
  const { user: _authUser } = useAuth() // TODO: Use authUser when implementing user-specific features
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  
  // Form states
  const [description, setDescription] = useState('')
  const [accusedStudentIds, setAccusedStudentIds] = useState<number[]>([])
  const [anonymous, setAnonymous] = useState(true)
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>('MEDIUM')
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('BULLYING')
  const [additionalEvidence, setAdditionalEvidence] = useState('')
  
  // Student search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentAutocompleteDTO[]>([])
  const [selectedStudents, setSelectedStudents] = useState<StudentAutocompleteDTO[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search students using the autocomplete API
  const searchStudents = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await apiService.studentAutocomplete(query.trim(), 10)
      setSearchResults(response.results)
      setShowSearchResults(true) // Show dropdown even if no results (for "no results" message)
    } catch (error) {
      console.error('Failed to search students:', error)
      setSearchResults([])
      setShowSearchResults(true) // Show "no results" message on error too
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStudents(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchStudents])

  // Add accused student
  const addAccusedStudent = (student: StudentAutocompleteDTO) => {
    if (!accusedStudentIds.includes(student.id)) {
      setAccusedStudentIds(prev => [...prev, student.id])
      setSelectedStudents(prev => [...prev, student])
    }
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Remove accused student
  const removeAccusedStudent = (studentId: number) => {
    setAccusedStudentIds(prev => prev.filter(id => id !== studentId))
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId))
  }

  // Get student name by ID
  const getStudentName = (studentId: number) => {
    const student = selectedStudents.find(s => s.id === studentId)
    return student ? student.fullName : 'Unknown Student'
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim() || accusedStudentIds.length === 0) {
      setError('Please provide a description and select at least one accused student.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const complaintRequest: CreateComplaintRequest = {
        issueCategory,
        severityLevel,
        accusedStudentIds,
        description: description.trim(),
        additionalEvidence: additionalEvidence.trim() || undefined,
        anonymous
      }

      const response = await apiService.createComplaint(complaintRequest)
      
      setSuccess(true)
      setTrackingCode(response.trackingCode)
      
      // Redirect to success page after a delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 5000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit complaint. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Get severity color
  const getSeverityColor = (level: SeverityLevel) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get category icon
  const getCategoryIcon = (cat: IssueCategory) => {
    switch (cat) {
      case 'BULLYING': return <AlertTriangle className="w-4 h-4" />
      case 'CYBERBULLYING': return <AlertTriangle className="w-4 h-4" />
      case 'HARASSMENT': return <Shield className="w-4 h-4" />
      case 'SEXUAL_HARASSMENT': return <Shield className="w-4 h-4" />
      case 'DISCRIMINATION': return <Flag className="w-4 h-4" />
      case 'ACADEMIC_MISCONDUCT': return <FileText className="w-4 h-4" />
      case 'VIOLENCE': return <AlertCircle className="w-4 h-4" />
      case 'SUBSTANCE_ABUSE': return <AlertCircle className="w-4 h-4" />
      case 'THEFT': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Format category for display
  const formatCategory = (cat: IssueCategory) => {
    return cat.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Format severity for display
  const formatSeverity = (sev: SeverityLevel) => {
    return sev.charAt(0) + sev.slice(1).toLowerCase()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-montserrat font-semibold text-heading mb-2">Complaint Submitted!</h2>
          <p className="text-body text-body mb-6">
            Your complaint has been successfully submitted. You can track its progress using the tracking code below.
          </p>
          
          <div className="bg-white p-6 rounded-input border-2 border-green-200 mb-6 overflow-hidden">
            <p className="text-sm text-label mb-2">Tracking Code:</p>
            <p className="text-lg font-montserrat font-bold text-green-600 font-mono break-all select-all">{trackingCode}</p>
          </div>
          
          <div className="space-y-2 text-sm text-label mb-6">
            <p><strong>Status:</strong> Submitted</p>
            <p><strong>Anonymous:</strong> {anonymous ? 'Yes' : 'No'}</p>
            <p><strong>Category:</strong> {formatCategory(issueCategory)}</p>
            <p><strong>Severity:</strong> {formatSeverity(severityLevel)}</p>
          </div>
          
          <div className="space-y-3">
            <Link to="/dashboard" className="btn-primary w-full">
              Return to Dashboard
            </Link>
            <Link to="/complaints" className="btn-outline w-full">
              View My Complaints
            </Link>
          </div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-alert to-action rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">Report an Issue</h1>
          <p className="text-body text-body">Lodge a complaint against classmates who are bullying or harassing you</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-input flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Complaint Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category and Severity */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label text-label mb-2">Issue Category *</label>
                    <select
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value as IssueCategory)}
                      className="input-field"
                      required
                    >
                      <option value="BULLYING">Bullying</option>
                      <option value="CYBERBULLYING">Cyberbullying</option>
                      <option value="HARASSMENT">Harassment</option>
                      <option value="SEXUAL_HARASSMENT">Sexual Harassment</option>
                      <option value="DISCRIMINATION">Discrimination</option>
                      <option value="ACADEMIC_MISCONDUCT">Academic Misconduct</option>
                      <option value="VIOLENCE">Violence</option>
                      <option value="SUBSTANCE_ABUSE">Substance Abuse</option>
                      <option value="THEFT">Theft</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-label text-label mb-2">Severity Level *</label>
                    <select
                      value={severityLevel}
                      onChange={(e) => setSeverityLevel(e.target.value as SeverityLevel)}
                      className="input-field"
                      required
                    >
                      <option value="LOW">Low - Minor issue</option>
                      <option value="MEDIUM">Medium - Moderate concern</option>
                      <option value="HIGH">High - Serious issue</option>
                      <option value="CRITICAL">Critical - Immediate attention needed</option>
                    </select>
                  </div>
                </div>

                {/* Accused Students */}
                <div>
                  <label className="block text-label text-label mb-2">Accused Students *</label>
                  
                  {/* Search Input */}
                  <div className="relative mb-3" ref={searchContainerRef}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search for students by name (min 2 characters)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                      className="input-field pl-10 pr-10 w-full"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                    )}
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-input shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
                        {searchResults.map((student) => {
                          const isAlreadySelected = accusedStudentIds.includes(student.id)
                          return (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => !isAlreadySelected && addAccusedStudent(student)}
                              disabled={isAlreadySelected}
                              className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 flex items-center justify-between transition-colors ${
                                isAlreadySelected 
                                  ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                                  : 'hover:bg-gray-50 cursor-pointer'
                              }`}
                            >
                              <div>
                                <div className="font-medium text-heading">
                                  {student.fullName}
                                </div>
                                <div className="text-sm text-label">
                                  {student.currentGradeLevel && `Grade ${student.currentGradeLevel}`}
                                  {student.username && ` • @${student.username}`}
                                </div>
                              </div>
                              {isAlreadySelected ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Users className="w-4 h-4 text-primary" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* No Results Message */}
                    {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-input shadow-lg z-10 p-4 mt-1">
                        <p className="text-sm text-label text-center">No students found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Students */}
                  {accusedStudentIds.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-label">Selected students:</p>
                      <div className="flex flex-wrap gap-2">
                        {accusedStudentIds.map((studentId) => (
                          <div
                            key={studentId}
                            className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-2 rounded-full"
                          >
                            <span className="text-sm font-medium">
                              {getStudentName(studentId)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAccusedStudent(studentId)}
                              className="text-primary hover:text-primary/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-label text-label mb-2">Description of the Issue *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field w-full h-32 resize-none"
                    placeholder="Please provide a detailed description of what happened, including dates, times, locations, and any specific incidents..."
                    required
                  />
                  <p className="text-xs text-label mt-1">
                    Be as specific as possible. Include relevant details that will help administrators investigate the issue.
                  </p>
                </div>

                {/* Additional Evidence */}
                <div>
                  <label className="block text-label text-label mb-2">Additional Evidence (Optional)</label>
                  <textarea
                    value={additionalEvidence}
                    onChange={(e) => setAdditionalEvidence(e.target.value)}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Any additional information, witnesses, screenshots, or evidence you can provide..."
                    maxLength={50000}
                  />
                  <p className="text-xs text-label mt-1">
                    This could include names of witnesses, screenshots, or other supporting information. (Max 50,000 characters)
                  </p>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                  />
                  <div>
                    <label htmlFor="anonymous" className="text-body text-body cursor-pointer">
                      <strong>Submit anonymously</strong>
                    </label>
                    <p className="text-sm text-label mt-1">
                      Your identity will be kept confidential. Only administrators will know who submitted this complaint.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !description.trim() || accusedStudentIds.length === 0}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting Complaint...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Information */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-3">Important Information</h3>
              <div className="space-y-2 text-sm text-body">
                <p>• All complaints are taken seriously and investigated thoroughly</p>
                <p>• Your privacy is protected, especially if submitted anonymously</p>
                <p>• False accusations may result in disciplinary action</p>
                <p>• You can track your complaint using the provided tracking code</p>
                <p>• For urgent safety concerns, contact school administration directly</p>
              </div>
            </div>

            {/* Complaint Summary */}
            <div className="card">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-4">Complaint Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-label">Category:</span>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(issueCategory)}
                    <span className="text-body">{formatCategory(issueCategory)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-label">Severity:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severityLevel)}`}>
                    {formatSeverity(severityLevel)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-label">Anonymous:</span>
                  <span className="text-body">{anonymous ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-label">Accused Students:</span>
                  <span className="text-body">{accusedStudentIds.length}</span>
                </div>
                
                {accusedStudentIds.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-label mb-2">Selected:</p>
                    <div className="space-y-1">
                      {accusedStudentIds.map((studentId) => (
                        <div key={studentId} className="text-xs text-body">
                          • {getStudentName(studentId)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Support Resources */}
            <div className="card bg-green-50 border-green-200">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-body">
                <p>• <strong>School Counselor:</strong> Available during school hours</p>
                <p>• <strong>Anti-Bullying Hotline:</strong> 1-800-STOP-BULLY</p>
                <p>• <strong>Emergency:</strong> Contact school administration immediately</p>
                <p>• <strong>Online Resources:</strong> Check our mental health resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnonymousComplaint
