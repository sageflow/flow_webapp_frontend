import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  AlertTriangle, Shield, Users, Search, X, CheckCircle,
  AlertCircle, FileText, Flag, Loader2, Lock, Phone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { apiService, CreateComplaintRequest, StudentAutocompleteDTO, IssueCategory, SeverityLevel } from '../services/api'
import AuthNavbar from '../components/common/AuthNavbar'

// ── helpers ────────────────────────────────────────────────────────
const formatCategory = (cat: IssueCategory) =>
  cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')

const formatSeverity = (sev: SeverityLevel) =>
  sev.charAt(0) + sev.slice(1).toLowerCase()

const getSeverityMeta = (level: SeverityLevel) => {
  switch (level) {
    case 'LOW': return { label: 'Low', cls: 'bg-emerald-100 text-emerald-700' }
    case 'MEDIUM': return { label: 'Medium', cls: 'bg-amber-100 text-amber-700' }
    case 'HIGH': return { label: 'High', cls: 'bg-orange-100 text-orange-700' }
    case 'CRITICAL': return { label: 'Critical', cls: 'bg-red-100 text-red-700' }
    default: return { label: level, cls: 'bg-gray-100 text-gray-700' }
  }
}

const getCategoryIcon = (cat: IssueCategory) => {
  switch (cat) {
    case 'BULLYING':
    case 'CYBERBULLYING': return <AlertTriangle className="w-3.5 h-3.5" />
    case 'HARASSMENT':
    case 'SEXUAL_HARASSMENT': return <Shield className="w-3.5 h-3.5" />
    case 'DISCRIMINATION': return <Flag className="w-3.5 h-3.5" />
    case 'ACADEMIC_MISCONDUCT': return <FileText className="w-3.5 h-3.5" />
    default: return <AlertCircle className="w-3.5 h-3.5" />
  }
}

// ── shared glass input classes ─────────────────────────────────────
const gInput = 'w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/40 transition-all'
const gSelect = `${gInput} cursor-pointer`
const gTextarea = `${gInput} resize-none`

// ─────────────────────────────────────────────────────────────────
const AnonymousComplaint: React.FC = () => {
  const navigate = useNavigate()
  const { user: _authUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')

  const [description, setDescription] = useState('')
  const [accusedStudentIds, setAccusedStudentIds] = useState<number[]>([])
  const [anonymous, setAnonymous] = useState(true)
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>('MEDIUM')
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('BULLYING')
  const [additionalEvidence, setAdditionalEvidence] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentAutocompleteDTO[]>([])
  const [selectedStudents, setSelectedStudents] = useState<StudentAutocompleteDTO[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSearchResults(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchStudents = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]); setShowSearchResults(false); setSearchError(''); return
    }
    try {
      setIsSearching(true); setSearchError('')
      const response = await apiService.studentAutocomplete(query.trim(), 10)
      setSearchResults(response?.results ?? [])
      setShowSearchResults(true)
    } catch (err: any) {
      setSearchResults([])
      setShowSearchResults(true)
      const status = err?.status
      setSearchError(
        status === 401 || status === 403
          ? 'You do not have permission to search students.'
          : 'Failed to search students. Please try again.'
      )
    } finally { setIsSearching(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchStudents(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery, searchStudents])

  const addStudent = (student: StudentAutocompleteDTO) => {
    if (!accusedStudentIds.includes(student.id)) {
      setAccusedStudentIds(p => [...p, student.id])
      setSelectedStudents(p => [...p, student])
    }
    setSearchQuery(''); setShowSearchResults(false)
  }

  const removeStudent = (id: number) => {
    setAccusedStudentIds(p => p.filter(x => x !== id))
    setSelectedStudents(p => p.filter(s => s.id !== id))
  }

  const getStudentName = (id: number) =>
    selectedStudents.find(s => s.id === id)?.fullName ?? 'Unknown Student'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || accusedStudentIds.length === 0) {
      setError('Please provide a description and select at least one accused student.')
      return
    }
    try {
      setLoading(true); setError('')
      const req: CreateComplaintRequest = {
        issueCategory, severityLevel, accusedStudentIds,
        description: description.trim(),
        additionalEvidence: additionalEvidence.trim() || undefined,
        anonymous
      }
      const response = await apiService.createComplaint(req)
      setSuccess(true); setTrackingCode(response.trackingCode)
      setTimeout(() => navigate('/dashboard'), 5000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint. Please try again.')
    } finally { setLoading(false) }
  }

  const sevMeta = getSeverityMeta(severityLevel)

  // ── Page shell ─────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[130px] rounded-full pointer-events-none" />
      <AuthNavbar backTo="/dashboard" backLabel="Dashboard" />
      <div className="flex-1 relative z-10">{children}</div>
    </div>
  )

  // ── Success screen ──────────────────────────────────────────────
  if (success) return (
    <Shell>
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-montserrat font-bold text-heading mb-2">Complaint Submitted!</h2>
          <p className="text-sm text-body mb-6 leading-relaxed">
            Your complaint has been successfully submitted. Save your tracking code below to monitor progress.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-5">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-1">Tracking Code</p>
            <p className="text-lg font-mono font-bold text-emerald-700 break-all select-all">{trackingCode}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            {[
              ['Category', formatCategory(issueCategory)],
              ['Severity', formatSeverity(severityLevel)],
              ['Anonymous', anonymous ? 'Yes' : 'No'],
              ['Status', 'Submitted'],
            ].map(([k, v]) => (
              <div key={k} className="bg-white/60 rounded-xl px-3 py-2">
                <p className="text-[10px] text-label font-semibold uppercase tracking-wider">{k}</p>
                <p className="text-sm font-bold text-heading">{v}</p>
              </div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-glow hover:opacity-90 transition-all text-sm"
          >
            Back to Dashboard
          </motion.button>
          <p className="text-xs text-label mt-3">Redirecting automatically in 5 seconds…</p>
        </motion.div>
      </div>
    </Shell>
  )

  // ── Main form ───────────────────────────────────────────────────
  return (
    <Shell>
      <div className="max-w-5xl mx-auto px-6 pb-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-h1 text-heading mb-1">Report an Issue</h1>
          <p className="text-body text-body">Lodge a complaint against classmates who are bullying or harassing you</p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-7">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Category + Severity */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Issue Category <span className="text-rose-500">*</span></label>
                    <select value={issueCategory} onChange={e => setIssueCategory(e.target.value as IssueCategory)} className={gSelect} required>
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

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Severity Level <span className="text-rose-500">*</span></label>
                    <select value={severityLevel} onChange={e => setSeverityLevel(e.target.value as SeverityLevel)} className={gSelect} required>
                      <option value="LOW">Low — Minor issue</option>
                      <option value="MEDIUM">Medium — Moderate concern</option>
                      <option value="HIGH">High — Serious issue</option>
                      <option value="CRITICAL">Critical — Immediate attention needed</option>
                    </select>
                  </div>
                </div>

                {/* Student search */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Accused Students <span className="text-rose-500">*</span></label>

                  <div className="relative" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search for students by name (min 2 characters)…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                      className={`${gInput} pl-10 pr-10`}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 w-4 h-4 animate-spin" />
                    )}

                    {/* Dropdown */}
                    <AnimatePresence>
                      {showSearchResults && (searchResults.length > 0 || searchError || (!isSearching && searchQuery.trim().length >= 2)) && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {searchError ? (
                            <p className="text-sm text-red-600 text-center py-4 px-4">{searchError}</p>
                          ) : searchResults.length === 0 ? (
                            <p className="text-sm text-label text-center py-4 px-4">No students found matching "{searchQuery}"</p>
                          ) : (
                            searchResults.map(student => {
                              const already = accusedStudentIds.includes(student.id)
                              return (
                                <button
                                  key={student.id}
                                  type="button"
                                  onClick={() => !already && addStudent(student)}
                                  disabled={already}
                                  className={`w-full px-4 py-3 text-left flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors ${already ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:bg-violet-50 cursor-pointer'}`}
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-heading">{student.fullName}</p>
                                    <p className="text-xs text-label">
                                      {student.currentGradeLevel && `Grade ${student.currentGradeLevel}`}
                                      {student.username && ` · @${student.username}`}
                                    </p>
                                  </div>
                                  {already
                                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    : <Users className="w-4 h-4 text-violet-400" />
                                  }
                                </button>
                              )
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selected pills */}
                  <AnimatePresence>
                    {accusedStudentIds.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 pt-1"
                      >
                        {accusedStudentIds.map(id => (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            className="flex items-center gap-2 bg-violet-100 text-violet-800 px-3 py-1.5 rounded-full text-xs font-semibold"
                          >
                            <span>{getStudentName(id)}</span>
                            <button type="button" onClick={() => removeStudent(id)} className="text-violet-500 hover:text-violet-800 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Description <span className="text-rose-500">*</span></label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={`${gTextarea} h-32`}
                    placeholder="Please provide a detailed description of what happened, including dates, times, locations, and any specific incidents…"
                    required
                  />
                  <p className="text-xs text-label">Be as specific as possible to help administrators investigate.</p>
                </div>

                {/* Evidence */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Additional Evidence <span className="text-label font-normal">(Optional)</span></label>
                  <textarea
                    value={additionalEvidence}
                    onChange={e => setAdditionalEvidence(e.target.value)}
                    className={`${gTextarea} h-20`}
                    placeholder="Witnesses, screenshots, or other supporting information…"
                    maxLength={50000}
                  />
                  <p className="text-xs text-label">Max 50,000 characters · {additionalEvidence.length.toLocaleString()} used</p>
                </div>

                {/* Anonymous toggle */}
                <div
                  onClick={() => setAnonymous(a => !a)}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${anonymous ? 'border-violet-400/40 bg-violet-50/60' : 'border-white/60 bg-white/40'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${anonymous ? 'bg-violet-600 border-violet-600' : 'bg-white border-gray-300'}`}>
                    {anonymous && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-heading flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-violet-500" />
                      Submit anonymously
                    </p>
                    <p className="text-xs text-label mt-0.5">Your identity will be kept confidential. Only administrators will know who submitted this complaint.</p>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || !description.trim() || accusedStudentIds.length === 0}
                  whileHover={!loading && description.trim() && accusedStudentIds.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={!loading && description.trim() && accusedStudentIds.length > 0 ? { scale: 0.98 } : {}}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl shadow-glow hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting…</span></>
                  ) : (
                    <><Flag className="w-4 h-4" /><span>Submit Complaint</span></>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* ── Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="space-y-4"
          >
            {/* Live summary */}
            <div className="glass-card p-5">
              <p className="text-[11px] font-semibold text-heading tracking-widest uppercase mb-4">Complaint Summary</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-label">Category</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-heading">
                    {getCategoryIcon(issueCategory)}
                    {formatCategory(issueCategory)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-label">Severity</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sevMeta.cls}`}>{sevMeta.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-label">Anonymous</span>
                  <span className={`text-xs font-bold ${anonymous ? 'text-violet-700' : 'text-gray-600'}`}>{anonymous ? 'Yes ✓' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-label">Accused</span>
                  <span className="text-xs font-bold text-heading">{accusedStudentIds.length} student{accusedStudentIds.length !== 1 ? 's' : ''}</span>
                </div>

                {accusedStudentIds.length > 0 && (
                  <div className="pt-3 border-t border-white/40 space-y-1">
                    {accusedStudentIds.map(id => (
                      <p key={id} className="text-xs text-body flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                        {getStudentName(id)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Important info */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <p className="text-xs font-bold text-heading">Important Information</p>
              </div>
              <ul className="space-y-1.5">
                {[
                  'All complaints are taken seriously and investigated thoroughly',
                  'Your privacy is protected, especially if submitted anonymously',
                  'False accusations may result in disciplinary action',
                  'You can track your complaint using the provided tracking code',
                  'For urgent safety concerns, contact school administration directly',
                ].map(item => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-body">
                    <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <p className="text-xs font-bold text-heading">Need Help?</p>
              </div>
              <ul className="space-y-1.5 text-xs text-body">
                {[
                  ['School Counselor', 'Available during school hours'],
                  ['Anti-Bullying Hotline', '1-800-STOP-BULLY'],
                  ['Emergency', 'Contact school administration immediately'],
                  ['Online Resources', 'Check our mental health resources'],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-1.5">
                    <span className="text-teal-400 mt-0.5 flex-shrink-0">•</span>
                    <span><strong className="text-heading">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </Shell>
  )
}

export default AnonymousComplaint
