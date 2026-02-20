import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiService, StudentSignupRequest } from '../services/api'
import FormField from '../components/common/FormField'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import AuthPageBackground from '../components/common/AuthPageBackground'
import AuthNavbar from '../components/common/AuthNavbar'
import {
  GENDER_CONSTANTS,
  GRADE_LEVEL_CONSTANTS,
  ACADEMIC_STATUS_CONSTANTS,
  LANGUAGE_CONSTANTS,
  VALIDATION_CONSTANTS
} from '../constants'
import { getConstantOptions, isValidEmail, isValidPassword, isValidPhone, validateRequired } from '../utils'

interface FormErrors {
  [key: string]: string
}

const StudentSignup: React.FC = () => {
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
    enrollmentDate: '',
    currentGradeLevel: '',
    academicStatus: '',
    gpa: '',
    guardianName: '',
    guardianRelationship: '',
    medicalConditions: '',
    preferredLanguage: '',
    nationality: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Clear general error
    if (error) setError('')
  }

  const validateStep1 = (): boolean => {
    const errors: FormErrors = {}

    // Username validation
    if (!validateRequired(formData.username)) {
      errors.username = 'Username is required'
    } else if (formData.username.length < VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH) {
      errors.username = `Username must be at least ${VALIDATION_CONSTANTS.MIN_USERNAME_LENGTH} characters`
    } else if (formData.username.length > VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH) {
      errors.username = `Username must be at most ${VALIDATION_CONSTANTS.MAX_USERNAME_LENGTH} characters`
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!validateRequired(formData.email)) {
      errors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!validateRequired(formData.password)) {
      errors.password = 'Password is required'
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm password validation
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

    // First name validation
    if (!validateRequired(formData.firstName)) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.firstName = `First name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    } else if (formData.firstName.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      errors.firstName = `First name must be at most ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }

    // Last name validation
    if (!validateRequired(formData.lastName)) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.lastName = `Last name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    } else if (formData.lastName.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      errors.lastName = `Last name must be at most ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }

    // Date of birth validation
    if (!validateRequired(formData.dateOfBirth)) {
      errors.dateOfBirth = 'Date of birth is required'
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0)

      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future'
      } else if (age < 5) {
        errors.dateOfBirth = 'Student must be at least 5 years old'
      } else if (age > 25) {
        errors.dateOfBirth = 'Student must be at most 25 years old'
      }
    }

    // Gender validation
    if (!validateRequired(formData.gender)) {
      errors.gender = 'Gender is required'
    }

    // Phone number validation (Indian format: starts with 6-9, 10 digits)
    if (!validateRequired(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!isValidPhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)'
    }

    // Address validation
    if (!validateRequired(formData.address)) {
      errors.address = 'Address is required'
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters'
    } else if (formData.address.trim().length > 200) {
      errors.address = 'Address must be at most 200 characters'
    }

    // Emergency contact name validation
    if (!validateRequired(formData.emergencyContact)) {
      errors.emergencyContact = 'Emergency contact name is required'
    } else if (formData.emergencyContact.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.emergencyContact = `Emergency contact name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    }

    // Emergency contact phone validation (Indian format: starts with 6-9, 10 digits)
    if (!validateRequired(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Emergency contact phone is required'
    } else if (!isValidPhone(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)'
    }

    // Guardian name validation
    if (!validateRequired(formData.guardianName)) {
      errors.guardianName = 'Guardian name is required'
    } else if (formData.guardianName.trim().length < 2) {
      errors.guardianName = 'Guardian name must be at least 2 characters'
    } else if (formData.guardianName.trim().length > 100) {
      errors.guardianName = 'Guardian name must be at most 100 characters'
    }

    // Guardian relationship validation
    if (!validateRequired(formData.guardianRelationship)) {
      errors.guardianRelationship = 'Guardian relationship is required'
    } else if (formData.guardianRelationship.trim().length < 2) {
      errors.guardianRelationship = 'Guardian relationship must be at least 2 characters'
    } else if (formData.guardianRelationship.trim().length > 50) {
      errors.guardianRelationship = 'Guardian relationship must be at most 50 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {}

    // Enrollment date validation
    if (!validateRequired(formData.enrollmentDate)) {
      errors.enrollmentDate = 'Enrollment date is required'
    } else {
      const enrollmentDate = new Date(formData.enrollmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (enrollmentDate < new Date('2000-01-01')) {
        errors.enrollmentDate = 'Enrollment date cannot be before 2000'
      } else if (enrollmentDate > new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)) {
        errors.enrollmentDate = 'Enrollment date cannot be more than 1 year in the future'
      }
    }

    // Current grade level validation
    if (!validateRequired(formData.currentGradeLevel)) {
      errors.currentGradeLevel = 'Current grade level is required'
    }

    // Academic status validation (optional, but must be valid if provided)
    if (formData.academicStatus && formData.academicStatus.trim() !== '') {
      const validStatuses = ['Good Standing', 'Probation', 'Suspended', 'Warning', 'Honors']
      if (!validStatuses.includes(formData.academicStatus)) {
        errors.academicStatus = 'Academic status must be one of: Good Standing, Probation, Suspended, Warning, Honors'
      }
    }

    // GPA validation (required)
    if (!validateRequired(formData.gpa)) {
      errors.gpa = 'GPA is required'
    } else {
      const gpaValue = parseFloat(formData.gpa)
      if (isNaN(gpaValue)) {
        errors.gpa = 'GPA must be a valid number'
      } else if (gpaValue < 0 || gpaValue > 5) {
        errors.gpa = 'GPA must be between 0 and 5'
      }
    }

    // Medical conditions validation (optional)
    if (formData.medicalConditions && formData.medicalConditions.trim().length > 500) {
      errors.medicalConditions = 'Medical conditions must be at most 500 characters'
    }

    // Preferred language validation
    if (!validateRequired(formData.preferredLanguage)) {
      errors.preferredLanguage = 'Preferred language is required'
    } else if (formData.preferredLanguage.trim().length < 2) {
      errors.preferredLanguage = 'Preferred language must be at least 2 characters'
    } else if (formData.preferredLanguage.trim().length > 50) {
      errors.preferredLanguage = 'Preferred language must be at most 50 characters'
    }

    // Nationality validation
    if (!validateRequired(formData.nationality)) {
      errors.nationality = 'Nationality is required'
    } else if (formData.nationality.trim().length < 2) {
      errors.nationality = 'Nationality must be at least 2 characters'
    } else if (formData.nationality.trim().length > 50) {
      errors.nationality = 'Nationality must be at most 50 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1()
      case 2:
        return validateStep2()
      case 3:
        return validateStep3()
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    // Clear errors when going back
    setFieldErrors({})
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate all steps before submission
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setError('Please fix all errors before submitting')
      // Go to the first step with errors
      if (!validateStep1()) {
        setCurrentStep(1)
      } else if (!validateStep2()) {
        setCurrentStep(2)
      } else {
        setCurrentStep(3)
      }
      return
    }

    setIsLoading(true)

    try {
      // Transform form data to match API requirements
      const signupData: StudentSignupRequest = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender.toUpperCase(), // MALE|FEMALE|OTHER
        phoneNumber: formData.phoneNumber.trim().replace(/[\s\-\(\)]/g, ''), // Clean phone number
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim().replace(/[\s\-\(\)]/g, ''), // Clean phone number
        enrollmentDate: formData.enrollmentDate,
        currentGradeLevel: formData.currentGradeLevel, // Already in correct format (Kindergarten, 1st, etc.)
        academicStatus: formData.academicStatus || undefined, // Optional field
        gpa: parseFloat(formData.gpa), // Convert to number (required)
        guardianName: formData.guardianName.trim(),
        guardianRelationship: formData.guardianRelationship.trim(),
        medicalConditions: formData.medicalConditions && formData.medicalConditions.trim() !== ''
          ? formData.medicalConditions.trim()
          : undefined, // Optional field
        preferredLanguage: formData.preferredLanguage.trim(),
        nationality: formData.nationality.trim(),
      }

      await apiService.studentSignup(signupData)
      setIsSubmitted(true)
    } catch (error: unknown) {
      let errorMessage = 'Signup failed. Please try again.'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Account Information</h3>

      <FormField
        label="Username *"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.username}
        placeholder="Enter your username"
      />

      <FormField
        label="Email Address *"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.email}
        placeholder="Enter your email address"
      />

      <FormField
        label="Password *"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.password}
        placeholder="Enter your password"
      />

      <FormField
        label="Confirm Password *"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.confirmPassword}
        placeholder="Confirm your password"
      />
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Personal Information</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="First Name *"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.firstName}
          placeholder="Enter your first name"
        />

        <FormField
          label="Last Name *"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.lastName}
          placeholder="Enter your last name"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Date of Birth *"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.dateOfBirth}
        />

        <FormField
          label="Gender *"
          name="gender"
          type="select"
          value={formData.gender}
          onChange={handleInputChange}
          options={getConstantOptions(GENDER_CONSTANTS.filter(g => g !== 'PREFER_NOT_TO_SAY'))}
          required
          disabled={isLoading}
          error={fieldErrors.gender}
        />
      </div>

      <FormField
        label="Phone Number *"
        name="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.phoneNumber}
        placeholder="Enter your phone number"
      />

      <FormField
        label="Address *"
        name="address"
        type="textarea"
        value={formData.address}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.address}
        placeholder="Enter your full address"
        rows={5}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Emergency Contact Name *"
          name="emergencyContact"
          type="text"
          value={formData.emergencyContact}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.emergencyContact}
          placeholder="Enter emergency contact name"
        />

        <FormField
          label="Emergency Contact Phone *"
          name="emergencyPhone"
          type="tel"
          value={formData.emergencyPhone}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.emergencyPhone}
          placeholder="Enter emergency contact phone"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Guardian Name *"
          name="guardianName"
          type="text"
          value={formData.guardianName}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.guardianName}
          placeholder="Enter guardian name"
        />

        <FormField
          label="Guardian Relationship *"
          name="guardianRelationship"
          type="text"
          value={formData.guardianRelationship}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.guardianRelationship}
          placeholder="e.g., Parent, Guardian, Grandparent"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Academic Information</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Enrollment Date *"
          name="enrollmentDate"
          type="date"
          value={formData.enrollmentDate}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.enrollmentDate}
        />

        <FormField
          label="Current Grade Level *"
          name="currentGradeLevel"
          type="select"
          value={formData.currentGradeLevel}
          onChange={handleInputChange}
          options={getConstantOptions(GRADE_LEVEL_CONSTANTS)}
          required
          disabled={isLoading}
          error={fieldErrors.currentGradeLevel}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Academic Status"
          name="academicStatus"
          type="select"
          value={formData.academicStatus}
          onChange={handleInputChange}
          options={getConstantOptions(ACADEMIC_STATUS_CONSTANTS)}
          disabled={isLoading}
          error={fieldErrors.academicStatus}
        />

        <FormField
          label="GPA *"
          name="gpa"
          type="text"
          value={formData.gpa}
          onChange={handleInputChange}
          placeholder="e.g., 3.8"
          required
          disabled={isLoading}
          error={fieldErrors.gpa}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Preferred Language *"
          name="preferredLanguage"
          type="select"
          value={formData.preferredLanguage}
          onChange={handleInputChange}
          options={getConstantOptions(LANGUAGE_CONSTANTS)}
          required
          disabled={isLoading}
          error={fieldErrors.preferredLanguage}
        />

        <FormField
          label="Nationality *"
          name="nationality"
          type="text"
          value={formData.nationality}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.nationality}
          placeholder="Enter your nationality"
        />
      </div>

      <FormField
        label="Medical Conditions"
        name="medicalConditions"
        type="textarea"
        value={formData.medicalConditions}
        onChange={handleInputChange}
        disabled={isLoading}
        error={fieldErrors.medicalConditions}
        placeholder="Enter any medical conditions (optional)"
        rows={3}
      />
    </div>
  )

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">
        <motion.div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-violet-500 blur-[120px] rounded-full pointer-events-none" animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-pink-400 to-purple-500 blur-[130px] rounded-full pointer-events-none" animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md mx-auto px-6"
        >
          <div className="glass-card p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-montserrat font-bold text-heading mb-3">Account Created Successfully!</h1>
            <p className="text-body mb-2">Welcome to SageFlow! Your account has been created successfully.</p>
            <p className="text-sm text-gray-500 mb-7">
              Please sign in with your credentials to continue. After signing in, you'll be prompted to complete your holistic profile.
            </p>
            <Link
              to="/login/student"
              className="inline-flex items-center justify-center w-full bg-gradient-purple text-white font-montserrat font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-glow"
            >
              Sign In to Continue
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">

      {/* Animated Background Orbs */}
      <AuthPageBackground />

      {/* Top Header */}
      <AuthNavbar />

      {/* Page Title */}
      <div className="relative z-10 text-center pt-4 pb-6 px-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-glow mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-montserrat font-bold text-heading mb-2">Student Registration</h2>
        <p className="text-sm text-body max-w-xs mx-auto leading-relaxed">Join our community and start your journey to better mental health and academic success</p>
      </div>

      {/* Progress Steps */}
      <div className="relative z-10 flex justify-center mb-8">
        <div className="flex items-start">
          {[
            { step: 1, label: 'Account' },
            { step: 2, label: 'Personal' },
            { step: 3, label: 'Academic' },
          ].map(({ step, label }, idx) => (
            <div key={step} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step < currentStep
                  ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-glow'
                  : step === currentStep
                    ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-glow ring-4 ring-purple-200'
                    : 'bg-white/60 backdrop-blur-sm border border-white/60 text-gray-400'
                  }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                <span className={`mt-1.5 text-xs font-medium ${step <= currentStep ? 'text-[#7C3AED]' : 'text-gray-400'
                  }`}>{label}</span>
              </div>
              {idx < 2 && (
                <div className={`w-20 h-1 mt-5 mx-1 rounded-full transition-all duration-300 ${step < currentStep ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-white/50'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}

          {/* Form Card */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#5f269e] bg-white/70 hover:bg-white/90 border border-white/60 hover:border-purple-200 font-semibold text-sm font-jakarta transition-all duration-200 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
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
                    className="bg-gradient-purple text-white font-montserrat font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-glow"
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-purple text-white font-montserrat font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-5">
            <p className="text-sm text-body">
              Already have an account?{' '}
              <Link to="/login/student" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentSignup
