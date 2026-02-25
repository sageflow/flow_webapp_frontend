import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, CheckCircle, User, Mail, Lock, Phone,
  MapPin, FileText, Clock, Eye, EyeOff, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiService, PsychologistSignupRequest } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import AuthPageBackground from '../components/common/AuthPageBackground'
import AuthNavbar from '../components/common/AuthNavbar'
import {
  GENDER_CONSTANTS,
  VALIDATION_CONSTANTS
} from '../constants'
import { getConstantOptions, isValidEmail, isValidPassword, isValidPhone, validateRequired } from '../utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormErrors {
  [key: string]: string
}

// ─── Small helpers ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Personal' },
  { id: 3, label: 'Professional' },
]

/** Base class for every glass-style input / select */
const glassInput = (hasError?: boolean) =>
  `w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border ${hasError ? 'border-red-400/70' : 'border-white/60'
  } rounded-xl text-heading placeholder-gray-400 text-sm focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-300/40 focus:border-red-400/60' : 'focus:ring-primary/30 focus:border-primary/40'
  } transition-all disabled:opacity-50 disabled:cursor-not-allowed`

/** Labelled field wrapper with leading icon + error hint */
const Field: React.FC<{
  label: string
  error?: string
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ label, error, icon, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7C3AED]">
        {icon}
      </span>
      {children}
    </div>
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────
const PsychologistSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    biography: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ─── Handlers (unchanged logic) ─────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    if (error) setError('')
  }

  const validateStep1 = (): boolean => {
    const errors: FormErrors = {}
    if (!validateRequired(formData.username)) {
      errors.username = 'Username is required'
    } else if (formData.username.length < VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH) {
      errors.username = `Username must be at least ${VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH} characters`
    } else if (formData.username.length > VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH) {
      errors.username = `Username must be at most ${VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH} characters`
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }
    if (!validateRequired(formData.email)) {
      errors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!validateRequired(formData.password)) {
      errors.password = 'Password is required'
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number'
    }
    if (!validateRequired(formData.confirmPassword)) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: FormErrors = {}
    if (!validateRequired(formData.firstName)) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.firstName = `First name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    } else if (formData.firstName.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      errors.firstName = `First name must be at most ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }
    if (!validateRequired(formData.lastName)) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.lastName = `Last name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    } else if (formData.lastName.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      errors.lastName = `Last name must be at most ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }
    if (!validateRequired(formData.dateOfBirth)) {
      errors.dateOfBirth = 'Date of birth is required'
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0)
      if (dob > today) errors.dateOfBirth = 'Date of birth cannot be in the future'
      else if (age < 21) errors.dateOfBirth = 'Psychologist must be at least 21 years old'
      else if (age > 100) errors.dateOfBirth = 'Please enter a valid date of birth'
    }
    if (!validateRequired(formData.gender)) errors.gender = 'Gender is required'
    if (!validateRequired(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!isValidPhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)'
    }
    if (!validateRequired(formData.address)) {
      errors.address = 'Address is required'
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters'
    } else if (formData.address.trim().length > 200) {
      errors.address = 'Address must be at most 200 characters'
    }
    if (!validateRequired(formData.emergencyContact)) {
      errors.emergencyContact = 'Emergency contact name is required'
    } else if (formData.emergencyContact.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.emergencyContact = `Emergency contact name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    }
    if (!validateRequired(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Emergency contact phone is required'
    } else if (!isValidPhone(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {}
    if (!validateRequired(formData.licenseNumber)) {
      errors.licenseNumber = 'License number is required'
    } else if (formData.licenseNumber.trim().length < 3) {
      errors.licenseNumber = 'License number must be at least 3 characters'
    } else if (formData.licenseNumber.trim().length > 50) {
      errors.licenseNumber = 'License number must be at most 50 characters'
    }
    if (!validateRequired(formData.specialization)) {
      errors.specialization = 'Specialization is required'
    } else if (formData.specialization.trim().length > 100) {
      errors.specialization = 'Specialization cannot exceed 100 characters'
    }
    if (!validateRequired(formData.yearsOfExperience)) {
      errors.yearsOfExperience = 'Years of experience is required'
    } else {
      const yearsValue = parseInt(formData.yearsOfExperience, 10)
      if (isNaN(yearsValue)) errors.yearsOfExperience = 'Years of experience must be a valid number'
      else if (yearsValue < 0) errors.yearsOfExperience = 'Years of experience cannot be negative'
      else if (yearsValue > 60) errors.yearsOfExperience = 'Years of experience cannot exceed 60'
    }
    if (!validateRequired(formData.biography)) {
      errors.biography = 'Biography is required'
    } else if (formData.biography.trim().length < 50) {
      errors.biography = 'Biography must be at least 50 characters'
    } else if (formData.biography.trim().length > 2000) {
      errors.biography = 'Biography cannot exceed 2000 characters'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: return validateStep1()
      case 2: return validateStep2()
      case 3: return validateStep3()
      default: return false
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setFieldErrors({})
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setError('Please fix all errors before submitting')
      if (!validateStep1()) setCurrentStep(1)
      else if (!validateStep2()) setCurrentStep(2)
      else setCurrentStep(3)
      return
    }
    setIsLoading(true)
    try {
      const signupData: PsychologistSignupRequest = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender.toUpperCase(),
        phoneNumber: formData.phoneNumber.trim().replace(/[\s\-\(\)]/g, ''),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim().replace(/[\s\-\(\)]/g, ''),
        licenseNumber: formData.licenseNumber.trim(),
        specialization: formData.specialization.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        biography: formData.biography.trim()
      }
      await apiService.psychologistSignup(signupData)
      setIsSubmitted(true)
    } catch (err: unknown) {
      let errorMessage = 'Signup failed. Please try again.'
      if (err instanceof Error) errorMessage = err.message
      else if (typeof err === 'string') errorMessage = err
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step panels ─────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      <Field label="Username *" error={fieldErrors.username} icon={<User className="w-[18px] h-[18px]" />}>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Enter your username"
          required
          disabled={isLoading}
          className={glassInput(!!fieldErrors.username)}
        />
      </Field>

      <Field label="Email Address *" error={fieldErrors.email} icon={<Mail className="w-[18px] h-[18px]" />}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          required
          disabled={isLoading}
          className={glassInput(!!fieldErrors.email)}
        />
      </Field>

      <Field label="Password *" error={fieldErrors.password} icon={<Lock className="w-[18px] h-[18px]" />}>
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          required
          disabled={isLoading}
          className={`${glassInput(!!fieldErrors.password)} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(p => !p)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7C3AED] hover:text-primary-dark transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </Field>

      <Field label="Confirm Password *" error={fieldErrors.confirmPassword} icon={<Lock className="w-[18px] h-[18px]" />}>
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm your password"
          required
          disabled={isLoading}
          className={`${glassInput(!!fieldErrors.confirmPassword)} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(p => !p)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7C3AED] hover:text-primary-dark transition-colors"
          tabIndex={-1}
          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
        >
          {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      </Field>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name *" error={fieldErrors.firstName} icon={<User className="w-[18px] h-[18px]" />}>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First name"
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.firstName)}
          />
        </Field>
        <Field label="Last Name *" error={fieldErrors.lastName} icon={<User className="w-[18px] h-[18px]" />}>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last name"
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.lastName)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of Birth *" error={fieldErrors.dateOfBirth} icon={<Clock className="w-[18px] h-[18px]" />}>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.dateOfBirth)}
          />
        </Field>
        <Field label="Gender *" error={fieldErrors.gender} icon={<User className="w-[18px] h-[18px]" />}>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.gender)}
          >
            <option value="">Select gender</option>
            {getConstantOptions(GENDER_CONSTANTS.filter(g => g !== 'PREFER_NOT_TO_SAY')).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Phone Number *" error={fieldErrors.phoneNumber} icon={<Phone className="w-[18px] h-[18px]" />}>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          required
          disabled={isLoading}
          className={glassInput(!!fieldErrors.phoneNumber)}
        />
      </Field>

      <Field label="Address *" error={fieldErrors.address} icon={<MapPin className="w-[18px] h-[18px]" />}>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter your full address"
          required
          disabled={isLoading}
          rows={2}
          className={`${glassInput(!!fieldErrors.address)} resize-none pt-2.5`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Emergency Contact *" error={fieldErrors.emergencyContact} icon={<User className="w-[18px] h-[18px]" />}>
          <input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            placeholder="Contact name"
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.emergencyContact)}
          />
        </Field>
        <Field label="Emergency Phone *" error={fieldErrors.emergencyPhone} icon={<Phone className="w-[18px] h-[18px]" />}>
          <input
            type="tel"
            name="emergencyPhone"
            value={formData.emergencyPhone}
            onChange={handleInputChange}
            placeholder="Contact phone"
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.emergencyPhone)}
          />
        </Field>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
      className="space-y-4"
    >
      <Field label="License Number *" error={fieldErrors.licenseNumber} icon={<FileText className="w-[18px] h-[18px]" />}>
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          placeholder="e.g., PSY-2024-12345"
          required
          disabled={isLoading}
          className={glassInput(!!fieldErrors.licenseNumber)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Specialization *" error={fieldErrors.specialization} icon={<Brain className="w-[18px] h-[18px]" />}>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            placeholder="e.g., Child Psychology"
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.specialization)}
          />
        </Field>
        <Field label="Years of Experience *" error={fieldErrors.yearsOfExperience} icon={<Clock className="w-[18px] h-[18px]" />}>
          <input
            type="text"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleInputChange}
            placeholder="e.g., 5"
            required
            disabled={isLoading}
            className={glassInput(!!fieldErrors.yearsOfExperience)}
          />
        </Field>
      </div>

      <Field label="Biography *" error={fieldErrors.biography} icon={<FileText className="w-[18px] h-[18px]" />}>
        <textarea
          name="biography"
          value={formData.biography}
          onChange={handleInputChange}
          placeholder="Tell us about your background, approach to therapy, and areas of expertise... (min. 50 characters)"
          required
          disabled={isLoading}
          rows={5}
          className={`${glassInput(!!fieldErrors.biography)} resize-none pt-2.5`}
        />
      </Field>

      {formData.biography.length > 0 && (
        <p className={`text-xs text-right -mt-1 ${formData.biography.length < 50 ? 'text-red-500' : 'text-gray-400'}`}>
          {formData.biography.length} / 2000
        </p>
      )}
    </motion.div>
  )

  // ─── Success screen ───────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
        <AuthPageBackground />
        <AuthNavbar />
        <div className="flex-1 flex items-center justify-center px-6 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="glass-card p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-montserrat font-bold text-heading mb-3">
                Account Created!
              </h1>
              <p className="text-sm text-body mb-8 leading-relaxed">
                Welcome to SageFlow! Your psychologist account has been created successfully.
                You can now help students with their mental health journey.
              </p>
              <Link
                to="/signin"
                className="w-full inline-block text-center bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-glow hover:opacity-90"
              >
                Sign In to Your Account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">

      {/* Animated background orbs */}
      <AuthPageBackground />

      {/* Top nav */}
      <AuthNavbar />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12 pt-2 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <div className="glass-card p-8">

            {/* Icon badge */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
                <Brain className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-montserrat font-bold text-heading text-center mb-1">
              Psychologist Registration
            </h1>
            <p className="text-sm text-body text-center mb-6">
              Join our platform and provide expert mental health support to students
            </p>

            {/* Step indicators */}
            <div className="flex items-center justify-center mb-7">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step.id < currentStep
                        ? 'bg-violet-600 text-white'
                        : step.id === currentStep
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow'
                          : 'bg-white/60 border border-white/60 text-gray-400'
                      }`}>
                      {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`text-[10px] mt-1 font-semibold tracking-wide ${step.id === currentStep ? 'text-violet-600' : 'text-gray-400'
                      }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${step.id < currentStep ? 'bg-violet-500' : 'bg-white/60'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <ErrorMessage
                message={error}
                onClose={() => setError('')}
                className="mb-5"
              />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/40">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 text-sm font-semibold text-heading hover:bg-white/85 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold rounded-xl text-sm shadow-glow hover:shadow-glow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold rounded-xl text-sm shadow-glow hover:shadow-glow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Create Account
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-body mt-5">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>

          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PsychologistSignup
