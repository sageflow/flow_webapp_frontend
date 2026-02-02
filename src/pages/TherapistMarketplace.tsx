import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, DollarSign, MapPin, Users, Heart, Brain } from 'lucide-react'

import { apiService } from '../services/api'
import { Therapist } from '../services/types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

const TherapistMarketplace: React.FC = () => {

  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  // Mock data for development (remove when backend is ready)
  const getMockTherapists = (): Therapist[] => [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'Cognitive Behavioral Therapy',
      yearsOfExperience: 8,
      biography: 'Dr. Sarah Johnson is a licensed clinical psychologist specializing in CBT for adolescents and young adults. She has helped hundreds of students overcome anxiety, depression, academic stress, and social challenges.',
      licenseNumber: 'PSY-1234',
      hourlyRate: 120,
      availability: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
      ],
      rating: 4.8,
      reviewCount: 450
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      specialization: 'Mindfulness & Stress Management',
      yearsOfExperience: 12,
      biography: 'Dr. Michael Chen is a mindfulness expert who helps students develop healthy coping mechanisms for academic pressure and social challenges.',
      licenseNumber: 'PSY-5678',
      hourlyRate: 140,
      availability: [
        { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '15:00', isAvailable: true }
      ],
      rating: 4.9,
      reviewCount: 680
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      specialization: 'Family Therapy & Adolescent Issues',
      yearsOfExperience: 6,
      biography: 'Dr. Emily Rodriguez specializes in family dynamics and helps adolescents navigate complex family relationships while building healthy communication skills.',
      licenseNumber: 'PSY-9012',
      hourlyRate: 110,
      availability: [
        { dayOfWeek: 'Monday', startTime: '14:00', endTime: '20:00', isAvailable: false },
        { dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '20:00', isAvailable: false },
        { dayOfWeek: 'Friday', startTime: '14:00', endTime: '20:00', isAvailable: false }
      ],
      rating: 4.7,
      reviewCount: 320
    },
    {
      id: 4,
      firstName: 'John',
      lastName: 'Joe',
      specialization: 'Cognitive Behavioral Therapy',
      yearsOfExperience: 12,
      biography: 'Dr. John Joe is a licensed clinical psychologist with extensive experience in treating adolescents and young adults. He specializes in evidence-based therapeutic approaches.',
      licenseNumber: 'PSY-1245',
      hourlyRate: 130,
      availability: [
        { dayOfWeek: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true }
      ],
      rating: 4.6,
      reviewCount: 520
    }
  ]

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true)
        // Try to fetch from psychologist endpoint first (which exists in your backend)
        let data: Therapist[]
        try {
          data = await apiService.getPsychologists()
        } catch (error) {
          // Fallback to generic therapists endpoint
          data = await apiService.getTherapists()
        }
        setTherapists(data)
        setFilteredTherapists(data)
      } catch (error) {
        console.error('Failed to fetch therapists:', error)
        setError('Failed to load therapists. Please try again.')
        // Fallback to mock data for development
        const mockData = getMockTherapists()
        setTherapists(mockData)
        setFilteredTherapists(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchTherapists()
  }, [])

  // Filter therapists based on search and filter criteria
  useEffect(() => {
    let filtered = therapists

    // Search by name or specialization
    if (searchTerm) {
      filtered = filtered.filter(therapist =>
        `${therapist.firstName} ${therapist.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter(therapist =>
        therapist.specialization === selectedSpecialization
      )
    }

    // Filter by rating
    if (selectedRating) {
      const minRating = parseFloat(selectedRating)
      filtered = filtered.filter(therapist => therapist.rating >= minRating)
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(therapist => {
        if (max) {
          return therapist.hourlyRate >= min && therapist.hourlyRate <= max
        }
        return therapist.hourlyRate >= min
      })
    }

    // Filter by availability
    if (showAvailableOnly) {
      filtered = filtered.filter(therapist => 
        therapist.availability.some(avail => avail.isAvailable)
      )
    }

    setFilteredTherapists(filtered)
  }, [therapists, searchTerm, selectedSpecialization, selectedRating, priceRange, showAvailableOnly])

  const specializations = Array.from(new Set(therapists.map(t => t.specialization)))

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const formatAvailability = (availability: Therapist['availability']) => {
    const availableDays = availability.filter(a => a.isAvailable).map(a => a.dayOfWeek.slice(0, 3))
    return availableDays.join(', ')
  }

  const isTherapistAvailable = (therapist: Therapist) => {
    return therapist.availability.some(avail => avail.isAvailable)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading Therapist Marketplace..." />
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
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-h1 text-heading mb-2">Therapist Marketplace</h1>
          <p className="text-body text-body">Find the right therapist to support your mental health and academic journey</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search therapists by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            {/* Specialization Filter */}
            <div>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="input-field"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="input-field"
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="input-field"
              >
                <option value="">All Prices</option>
                <option value="0-100">Under $100</option>
                <option value="100-150">$100 - $150</option>
                <option value="150-200">$150 - $200</option>
                <option value="200-999">$200+</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm text-label">Show available therapists only</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-body text-body">
            Found {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Therapists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <div key={therapist.id} className="card hover:shadow-lg transition-all duration-300">
              {/* Therapist Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-montserrat font-semibold text-heading">
                      Dr. {therapist.firstName} {therapist.lastName}
                    </h3>
                    <p className="text-sm text-label">{therapist.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className={`w-4 h-4 ${getRatingColor(therapist.rating)} fill-current`} />
                    <span className={`text-sm font-semibold ${getRatingColor(therapist.rating)}`}>
                      {therapist.rating}
                    </span>
                  </div>
                  <p className="text-xs text-label">({therapist.reviewCount} reviews)</p>
                </div>
              </div>

              {/* Therapist Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-label">
                  <Clock className="w-4 h-4" />
                  <span>{therapist.yearsOfExperience} years experience</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-label">
                  <DollarSign className="w-4 h-4" />
                  <span>${therapist.hourlyRate}/hour</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-label">
                  <Users className="w-4 h-4" />
                  <span>{formatAvailability(therapist.availability)}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  isTherapistAvailable(therapist)
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isTherapistAvailable(therapist) ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link
                  to={`/therapist/${therapist.id}`}
                  className="btn-outline flex-1 text-center"
                >
                  View Profile
                </Link>
                <Link
                  to={`/schedule-session/${therapist.id}`}
                  className={`btn-primary flex-1 text-center ${
                    !isTherapistAvailable(therapist) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    if (!isTherapistAvailable(therapist)) {
                      e.preventDefault()
                    }
                  }}
                >
                  Schedule Session
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTherapists.length === 0 && (
          <div className="card text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-montserrat font-semibold text-heading mb-2">No Therapists Found</h3>
            <p className="text-body text-body mb-4">
              Try adjusting your search criteria or filters to find more therapists.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedSpecialization('')
                setSelectedRating('')
                setPriceRange('')
                setShowAvailableOnly(false)
              }}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TherapistMarketplace
