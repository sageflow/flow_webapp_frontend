import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, Shield, Search, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, FileText, Flag, Plus, Gavel, Loader2, Hash, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiService, ComplaintResponse, IssueCategory, SeverityLevel, ComplaintStatus } from '../services/api'
import AuthNavbar from '../components/common/AuthNavbar'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ── helpers ──────────────────────────────────────────────────────
const formatCategory = (c: IssueCategory) =>
  c.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
const formatSeverity = (s: SeverityLevel) => s.charAt(0) + s.slice(1).toLowerCase()
const formatStatus = (s: ComplaintStatus) =>
  s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const getStatusMeta = (s: ComplaintStatus) => {
  switch (s) {
    case 'SUBMITTED': return { cls: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" /> }
    case 'UNDER_REVIEW': return { cls: 'bg-blue-100 text-blue-800', icon: <Eye className="w-3 h-3" /> }
    case 'INVESTIGATING': return { cls: 'bg-indigo-100 text-indigo-800', icon: <Eye className="w-3 h-3" /> }
    case 'RESOLVED': return { cls: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-3 h-3" /> }
    case 'DISMISSED': return { cls: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> }
    case 'ESCALATED': return { cls: 'bg-purple-100 text-purple-800', icon: <AlertTriangle className="w-3 h-3" /> }
    default: return { cls: 'bg-gray-100 text-gray-700', icon: <AlertCircle className="w-3 h-3" /> }
  }
}

const getSeverityMeta = (s: SeverityLevel) => {
  switch (s) {
    case 'LOW': return 'bg-emerald-100 text-emerald-800'
    case 'MEDIUM': return 'bg-amber-100 text-amber-800'
    case 'HIGH': return 'bg-orange-100 text-orange-800'
    case 'CRITICAL': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getCategoryIcon = (c: IssueCategory) => {
  switch (c) {
    case 'BULLYING': case 'CYBERBULLYING': return <AlertTriangle className="w-4 h-4" />
    case 'HARASSMENT': case 'SEXUAL_HARASSMENT': return <Shield className="w-4 h-4" />
    case 'DISCRIMINATION': return <Flag className="w-4 h-4" />
    case 'ACADEMIC_MISCONDUCT': return <FileText className="w-4 h-4" />
    case 'VIOLENCE': return <Gavel className="w-4 h-4" />
    default: return <AlertCircle className="w-4 h-4" />
  }
}

// shared glass input/select style
const gInput = 'w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/40 transition-all'

// ── Complaint card ────────────────────────────────────────────────
const ComplaintCard: React.FC<{ complaint: ComplaintResponse; index: number }> = ({ complaint, index }) => {
  const status = getStatusMeta(complaint.status)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="glass-card p-5 hover:shadow-lg transition-all duration-300"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            {getCategoryIcon(complaint.issueCategory)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-heading truncate">{formatCategory(complaint.issueCategory)} Issue</p>
            <p className="text-[11px] text-label font-mono truncate">#{complaint.trackingCode}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${status.cls}`}>
            {status.icon}{formatStatus(complaint.status)}
          </span>
          {complaint.anonymous && (
            <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Anonymous</span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-body leading-relaxed mb-4 line-clamp-3">{complaint.description}</p>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getSeverityMeta(complaint.severityLevel)}`}>
          {formatSeverity(complaint.severityLevel)} Severity
        </span>
        <span className="text-[11px] font-semibold text-label bg-white/60 px-2.5 py-1 rounded-full">
          {complaint.accusedStudentIds.length} Accused
        </span>
        <span className="text-[11px] font-semibold text-label bg-white/60 px-2.5 py-1 rounded-full">
          {formatDate(complaint.createdAt)}
        </span>
      </div>

      {/* Evidence */}
      {complaint.additionalEvidence && (
        <div className="bg-white/50 border border-white/60 rounded-xl p-3 mb-4">
          <p className="text-[10px] font-semibold text-label uppercase tracking-wider mb-1">Evidence</p>
          <p className="text-xs text-body">{complaint.additionalEvidence}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/40">
        <Link
          to={`/complaints/${complaint.id}`}
          className="text-xs font-semibold text-violet-700 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-violet-50 border border-violet-200/40 transition-all"
        >
          View Details
        </Link>
        <Link
          to={`/complaints/track/${complaint.trackingCode}`}
          className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 shadow-sm transition-all"
        >
          Track Progress
        </Link>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────
const ComplaintsList: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [trackingCode, setTrackingCode] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackedComplaint, setTrackedComplaint] = useState<ComplaintResponse | null>(null)
  const [trackingError, setTrackingError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true); setError('')
        const data = await apiService.getMyComplaints()
        setComplaints(data)
      } catch {
        setError('Failed to load complaints. Please try again.')
        setComplaints([])
      } finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handleTrackByCode = async () => {
    if (!trackingCode.trim()) { setTrackingError('Please enter a tracking code'); return }
    try {
      setTrackingLoading(true); setTrackingError(''); setTrackedComplaint(null)
      const c = await apiService.getComplaintByTrackingCode(trackingCode.trim())
      setTrackedComplaint(c)
    } catch {
      setTrackingError('Complaint not found. Please check the tracking code and try again.')
    } finally { setTrackingLoading(false) }
  }

  const clearTracked = () => { setTrackedComplaint(null); setTrackingCode(''); setTrackingError('') }

  const filtered = complaints.filter(c => {
    const q = searchTerm.toLowerCase()
    const matchSearch = c.description.toLowerCase().includes(q) || c.trackingCode.toLowerCase().includes(q)
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchCategory = !categoryFilter || c.issueCategory === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      {/* Ambient orbs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Navbar — with an extra "New Complaint" CTA */}
      <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[#5f269e] bg-white/60 backdrop-blur-md hover:bg-white/85 border border-white/50 hover:border-purple-200 shadow-soft transition-all duration-200 text-sm font-semibold"
        >
          ← Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/anonymous-complaint"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Complaint
          </Link>
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="SageFlow" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="text-xl font-montserrat font-bold text-heading group-hover:text-primary transition-colors duration-200">SageFlow</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 pb-16 relative z-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7"
        >
          <h1 className="text-h1 text-heading mb-1">My Complaints</h1>
          <p className="text-body text-body">Track the progress of your submitted complaints and issues</p>
        </motion.div>

        {/* Error */}
        {error && <ErrorMessage message={error} onClose={() => setError('')} className="mb-5" />}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* ── Track by code ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="glass-card p-5 mb-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-heading">Track Anonymous Complaint</p>
                  <p className="text-xs text-label">Have a tracking code? Enter it below to check the status.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter tracking code (e.g., abc123-def456-ghi789)"
                  value={trackingCode}
                  onChange={e => { setTrackingCode(e.target.value); setTrackingError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleTrackByCode()}
                  className={`${gInput} flex-1 font-mono`}
                />
                <motion.button
                  onClick={handleTrackByCode}
                  disabled={trackingLoading || !trackingCode.trim()}
                  whileHover={trackingCode.trim() ? { scale: 1.02 } : {}}
                  whileTap={trackingCode.trim() ? { scale: 0.97 } : {}}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-glow hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0 transition-all"
                >
                  {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Track
                </motion.button>
              </div>
              {trackingError && <p className="text-xs text-red-600 mt-2">{trackingError}</p>}
            </motion.div>

            {/* ── Tracked result ── */}
            <AnimatePresence>
              {trackedComplaint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="glass-card p-5 mb-5 border-2 border-violet-300/40"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-violet-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Tracked Complaint Found
                    </p>
                    <button onClick={clearTracked} className="w-7 h-7 rounded-lg bg-white/60 hover:bg-red-50 flex items-center justify-center transition-all">
                      <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                  <ComplaintCard complaint={trackedComplaint} index={0} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Search + Filters ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="glass-card p-4 mb-5"
            >
              <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by description or tracking code…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`${gInput} pl-9`}
                  />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${gInput} w-auto`}>
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="INVESTIGATING">Investigating</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={`${gInput} w-auto`}>
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
            </motion.div>

            {/* Count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-label font-semibold mb-4"
            >
              Found {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
              {(searchTerm || statusFilter || categoryFilter) && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter(''); setCategoryFilter('') }}
                  className="ml-3 text-violet-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </motion.p>

            {/* ── List ── */}
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((c, i) => <ComplaintCard key={c.id} complaint={c} index={i} />)}
              </div>
            ) : (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-14 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Shield className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-base font-montserrat font-bold text-heading mb-2">No Complaints Found</h3>
                <p className="text-sm text-body max-w-xs mx-auto mb-6">
                  {complaints.length === 0
                    ? "You haven't submitted any complaints yet."
                    : "Try adjusting your search criteria or filters."}
                </p>
                {complaints.length === 0 ? (
                  <Link
                    to="/anonymous-complaint"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-glow hover:opacity-90 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Submit Your First Complaint
                  </Link>
                ) : (
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter(''); setCategoryFilter('') }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-semibold rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ComplaintsList
