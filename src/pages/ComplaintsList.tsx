import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Shield, Search, Eye, Clock, CheckCircle, XCircle, AlertCircle, FileText, Flag, Plus, Gavel, Loader2, Hash } from 'lucide-react'

import { apiService, ComplaintResponse, IssueCategory, SeverityLevel, ComplaintStatus } from '../services/api'

const ComplaintsList: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  
  // Track by code states
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackedComplaint, setTrackedComplaint] = useState<ComplaintResponse | null>(null)
  const [trackingError, setTrackingError] = useState('')
  
  // Fetch user's complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await apiService.getMyComplaints()
        setComplaints(data)
      } catch (error) {
        console.error('Failed to fetch complaints:', error)
        setError('Failed to load complaints. Please try again.')
        setComplaints([])
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  // Track complaint by tracking code
  const handleTrackByCode = async () => {
    if (!trackingCode.trim()) {
      setTrackingError('Please enter a tracking code')
      return
    }

    try {
      setTrackingLoading(true)
      setTrackingError('')
      setTrackedComplaint(null)
      const complaint = await apiService.getComplaintByTrackingCode(trackingCode.trim())
      setTrackedComplaint(complaint)
    } catch (error) {
      console.error('Failed to track complaint:', error)
      setTrackingError('Complaint not found. Please check the tracking code and try again.')
    } finally {
      setTrackingLoading(false)
    }
  }

  // Clear tracked complaint
  const clearTrackedComplaint = () => {
    setTrackedComplaint(null)
    setTrackingCode('')
    setTrackingError('')
  }

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || complaint.status === statusFilter
    const matchesCategory = !categoryFilter || complaint.issueCategory === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get status color
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'INVESTIGATING': return 'bg-indigo-100 text-indigo-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'DISMISSED': return 'bg-red-100 text-red-800'
      case 'ESCALATED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get severity color
  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get category icon
  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case 'BULLYING': return <AlertTriangle className="w-4 h-4" />
      case 'CYBERBULLYING': return <AlertTriangle className="w-4 h-4" />
      case 'HARASSMENT': return <Shield className="w-4 h-4" />
      case 'SEXUAL_HARASSMENT': return <Shield className="w-4 h-4" />
      case 'DISCRIMINATION': return <Flag className="w-4 h-4" />
      case 'ACADEMIC_MISCONDUCT': return <FileText className="w-4 h-4" />
      case 'VIOLENCE': return <Gavel className="w-4 h-4" />
      case 'SUBSTANCE_ABUSE': return <AlertCircle className="w-4 h-4" />
      case 'THEFT': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Get status icon
  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED': return <Clock className="w-4 h-4" />
      case 'UNDER_REVIEW': return <Eye className="w-4 h-4" />
      case 'INVESTIGATING': return <Eye className="w-4 h-4" />
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />
      case 'DISMISSED': return <XCircle className="w-4 h-4" />
      case 'ESCALATED': return <AlertTriangle className="w-4 h-4" />
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

  // Format status for display
  const formatStatus = (status: ComplaintStatus) => {
    return status.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body text-body">Loading Complaints...</p>
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
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/anonymous-complaint" 
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Complaint</span>
              </Link>
              <Link 
                to="/dashboard" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">My Complaints</h1>
          <p className="text-body text-body">Track the progress of your submitted complaints and issues</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-input flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Track by Code Section */}
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-montserrat font-semibold text-heading mb-2">Track Anonymous Complaint</h3>
              <p className="text-sm text-body mb-4">
                Have a tracking code? Enter it below to check the status of your complaint.
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Enter tracking code (e.g., abc123-def456-ghi789)"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value)
                      setTrackingError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrackByCode()}
                    className="input-field w-full font-mono"
                  />
                </div>
                <button
                  onClick={handleTrackByCode}
                  disabled={trackingLoading || !trackingCode.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {trackingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Track</span>
                </button>
              </div>
              {trackingError && (
                <p className="text-sm text-red-600 mt-2">{trackingError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tracked Complaint Result */}
        {trackedComplaint && (
          <div className="card mb-8 border-2 border-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-montserrat font-semibold text-heading">Tracked Complaint</h3>
              <button
                onClick={clearTrackedComplaint}
                className="text-sm text-primary hover:text-primary/80"
              >
                Clear
              </button>
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white">
                  {getCategoryIcon(trackedComplaint.issueCategory)}
                </div>
                <div>
                  <h4 className="text-lg font-montserrat font-semibold text-heading">
                    {formatCategory(trackedComplaint.issueCategory)} Issue
                  </h4>
                  <p className="text-sm text-label font-mono break-all">Code: {trackedComplaint.trackingCode}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(trackedComplaint.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trackedComplaint.status)}`}>
                    {formatStatus(trackedComplaint.status)}
                  </span>
                </div>
                <p className="text-xs text-label">
                  {trackedComplaint.anonymous ? 'Anonymous' : 'Named'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-body text-body">{trackedComplaint.description}</p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-label">Severity:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(trackedComplaint.severityLevel)}`}>
                    {formatSeverity(trackedComplaint.severityLevel)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-label">Accused Students:</span>
                  <span className="text-body">{trackedComplaint.accusedStudentIds.length}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-label">Submitted:</span>
                  <span className="text-body">{formatDate(trackedComplaint.createdAt)}</span>
                </div>
              </div>

              {trackedComplaint.additionalEvidence && (
                <div className="bg-gray-50 p-3 rounded-input">
                  <p className="text-sm font-medium text-label mb-2">Additional Evidence:</p>
                  <p className="text-sm text-body">{trackedComplaint.additionalEvidence}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search complaints by description or tracking code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
                <option value="ESCALATED">Escalated</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-body text-body">
            Found {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Complaints List */}
        <div className="space-y-6">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="card hover:shadow-lg transition-all duration-300">
              {/* Complaint Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white">
                    {getCategoryIcon(complaint.issueCategory)}
                  </div>
                  <div>
                    <h3 className="text-lg font-montserrat font-semibold text-heading">
                      {formatCategory(complaint.issueCategory)} Issue
                    </h3>
                    <p className="text-sm text-label">Tracking Code: {complaint.trackingCode}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(complaint.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {formatStatus(complaint.status)}
                    </span>
                  </div>
                  <p className="text-xs text-label">
                    {complaint.anonymous ? 'Anonymous' : 'Named'}
                  </p>
                </div>
              </div>

              {/* Complaint Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-body text-body">{complaint.description}</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-label">Severity:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(complaint.severityLevel)}`}>
                      {formatSeverity(complaint.severityLevel)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-label">Accused Students:</span>
                    <span className="text-body">{complaint.accusedStudentIds.length}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-label">Submitted:</span>
                    <span className="text-body">{formatDate(complaint.createdAt)}</span>
                  </div>
                </div>

                {/* Additional Evidence */}
                {complaint.additionalEvidence && (
                  <div className="bg-gray-50 p-3 rounded-input">
                    <p className="text-sm font-medium text-label mb-2">Additional Evidence:</p>
                    <p className="text-sm text-body">{complaint.additionalEvidence}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-label">
                  Submitted: {formatDate(complaint.createdAt)}
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="btn-outline text-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/complaints/track/${complaint.trackingCode}`}
                    className="btn-primary text-sm"
                  >
                    Track Progress
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredComplaints.length === 0 && (
          <div className="card text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-montserrat font-semibold text-heading mb-2">No Complaints Found</h3>
            <p className="text-body text-body mb-4">
              {complaints.length === 0 
                ? "You haven't submitted any complaints yet."
                : "Try adjusting your search criteria or filters to find more complaints."
              }
            </p>
            {complaints.length === 0 ? (
              <Link to="/anonymous-complaint" className="btn-primary">
                Submit Your First Complaint
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setCategoryFilter('')
                }}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintsList
