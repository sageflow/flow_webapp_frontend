import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react'
import { apiService, GuardianSignupRequest } from '../services/api'
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

const RELATIONSHIP_TYPE_OPTIONS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GUARDIAN', label: 'Guardian' },
  { value: 'GRANDPARENT', label: 'Grandparent' },
  { value: 'UNCLE', label: 'Uncle' },
  { value: 'AUNT', label: 'Aunt' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'OTHER', label: 'Other' }
]

const GuardianSignup: React.FC = () => {
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
    childrenIds: '',
    jobTitle: '',
    company: '',
    relationshipType: ''
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
    }

    // Last name validation
    if (!validateRequired(formData.lastName)) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.lastName = `Last name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`
    } else if (formData.lastName.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      errors.lastName = `Last name must be at most ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`
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
      } else if (age < 18) {
        errors.dateOfBirth = 'Guardian must be at least 18 years old'
      } else if (age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth'
      }
    }

    // Gender validation
    if (!validateRequired(formData.gender)) {
      errors.gender = 'Gender is required'
    }

    // Phone number validation
    if (!validateRequired(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!isValidPhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number'
    }

    // Address validation
    if (!validateRequired(formData.address)) {
      errors.address = 'Address is required'
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters'
    }

    // Emergency contact name validation
    if (!validateRequired(formData.emergencyContact)) {
      errors.emergencyContact = 'Emergency contact name is required'
    }

    // Emergency contact phone validation
    if (!validateRequired(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Emergency contact phone is required'
    } else if (!isValidPhone(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Please enter a valid 10-digit phone number'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = (): boolean => {
    const errors: FormErrors = {}

    // Children IDs validation
    if (!validateRequired(formData.childrenIds)) {
      errors.childrenIds = 'At least one child ID is required'
    } else {
      const ids = formData.childrenIds.split(',').map(id => id.trim())
      for (const id of ids) {
        if (isNaN(parseInt(id, 10))) {
          errors.childrenIds = 'Please enter valid student IDs separated by commas'
          break
        }
      }
    }

    // Job title validation
    if (!validateRequired(formData.jobTitle)) {
      errors.jobTitle = 'Job title is required'
    }

    // Company validation
    if (!validateRequired(formData.company)) {
      errors.company = 'Company is required'
    }

    // Relationship type validation
    if (!validateRequired(formData.relationshipType)) {
      errors.relationshipType = 'Relationship type is required'
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
      // Parse children IDs from comma-separated string
      const childrenIds = formData.childrenIds
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id))

      const signupData: GuardianSignupRequest = {
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
        childrenIds: childrenIds,
        jobTitle: formData.jobTitle.trim(),
        company: formData.company.trim(),
        relationshipType: formData.relationshipType
      }

      await apiService.guardianSignup(signupData)
      setIsSubmitted(true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.'
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
      <h3 className="text-xl font-montserrat font-semibold text-heading">Family & Work Information</h3>
      
      <FormField
        label="Children IDs *"
        name="childrenIds"
        type="text"
        value={formData.childrenIds}
        onChange={handleInputChange}
        required
        disabled={isLoading}
        error={fieldErrors.childrenIds}
        placeholder="Enter student IDs separated by commas (e.g., 4, 5, 6)"
      />
      <p className="text-sm text-label -mt-4">Enter the student IDs of your children who are registered in the system</p>

      <FormField
        label="Relationship Type *"
        name="relationshipType"
        type="select"
        value={formData.relationshipType}
        onChange={handleInputChange}
        options={RELATIONSHIP_TYPE_OPTIONS}
        required
        disabled={isLoading}
        error={fieldErrors.relationshipType}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Job Title *"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.jobTitle}
          placeholder="e.g., Accountant, Engineer"
        />

        <FormField
          label="Company *"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          error={fieldErrors.company}
          placeholder="e.g., EY, Google"
        />
      </div>
    </div>
  )

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-montserrat font-bold text-heading mb-4">Account Created Successfully!</h1>
            <p className="text-body text-body mb-6">Welcome to SageFlow! Your parent account has been created successfully.</p>
            <Link to="/login/parent" className="btn-primary w-full">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-teal-600" />
            <h1 className="text-4xl font-montserrat font-bold text-heading">SageFlow</h1>
          </div>
          <h2 className="text-2xl font-montserrat font-semibold text-heading">Parent Registration</h2>
          <p className="text-body text-body mt-2">Join our community to support your child's mental health and academic success</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-teal-600' : 'bg-gray-200'
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
            <Link to="/login/parent" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default GuardianSignup
