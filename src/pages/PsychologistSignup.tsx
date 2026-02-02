import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react'
import { apiService, PsychologistSignupRequest } from '../services/api'
import FormField from '../components/common/FormField'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { 
  GENDER_CONSTANTS, 
  VALIDATION_CONSTANTS
} from '../constants'
import { getConstantOptions, isValidEmail, isValidPassword, isValidPhone, validateRequired } from '../utils'

interface FormErrors {
  [key: string]: string
}

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
      } else if (age < 21) {
        errors.dateOfBirth = 'Psychologist must be at least 21 years old'
      } else if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth'
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

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {}

    // License number validation
    if (!validateRequired(formData.licenseNumber)) {
      errors.licenseNumber = 'License number is required'
    } else if (formData.licenseNumber.trim().length < 3) {
      errors.licenseNumber = 'License number must be at least 3 characters'
    } else if (formData.licenseNumber.trim().length > 50) {
      errors.licenseNumber = 'License number must be at most 50 characters'
    }

    // Specialization validation
    if (!validateRequired(formData.specialization)) {
      errors.specialization = 'Specialization is required'
    } else if (formData.specialization.trim().length > 100) {
      errors.specialization = 'Specialization cannot exceed 100 characters'
    }

    // Years of experience validation
    if (!validateRequired(formData.yearsOfExperience)) {
      errors.yearsOfExperience = 'Years of experience is required'
    } else {
      const yearsValue = parseInt(formData.yearsOfExperience, 10)
      if (isNaN(yearsValue)) {
        errors.yearsOfExperience = 'Years of experience must be a valid number'
      } else if (yearsValue < 0) {
        errors.yearsOfExperience = 'Years of experience cannot be negative'
      } else if (yearsValue > 60) {
        errors.yearsOfExperience = 'Years of experience cannot exceed 60'
      }
    }

    // Biography validation
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
      const signupData: PsychologistSignupRequest = {
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
        licenseNumber: formData.licenseNumber.trim(),
        specialization: formData.specialization.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        biography: formData.biography.trim()
      }

      await apiService.psychologistSignup(signupData)
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
        rows={3}
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
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Professional Information</h3>
      
      <FormField
        label="License Number *"
        name="licenseNumber"
        type="text"
        value={formData.licenseNumber}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.licenseNumber}
        placeholder="e.g., PSY-2024-12345"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Specialization *"
          name="specialization"
          type="text"
          value={formData.specialization}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.specialization}
          placeholder="e.g., Child Psychology, Clinical Psychology"
        />

        <FormField
          label="Years of Experience *"
          name="yearsOfExperience"
          type="text"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.yearsOfExperience}
          placeholder="e.g., 5"
        />
      </div>

      <FormField
        label="Biography *"
        name="biography"
        type="textarea"
        value={formData.biography}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.biography}
        placeholder="Tell us about your background, approach to therapy, and areas of expertise..."
        rows={6}
      />
    </div>
  )

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-montserrat font-bold text-heading mb-4">Account Created Successfully!</h1>
            <p className="text-body text-body mb-6">Welcome to SageFlow! Your psychologist account has been created successfully. You can now help students with their mental health journey.</p>
            <Link to="/signin" className="btn-primary w-full">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-montserrat font-bold text-heading">SageFlow</h1>
          </div>
          <h2 className="text-2xl font-montserrat font-semibold text-heading">Psychologist Registration</h2>
          <p className="text-body text-body mt-2">Join our platform and provide expert mental health support to students</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-amber-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                  disabled={isLoading}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary ml-auto flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-body text-body">
            Already have an account?{' '}
            <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PsychologistSignup
