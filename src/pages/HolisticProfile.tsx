import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, CheckCircle, Bed, Utensils, Dumbbell, Monitor, Eye, AlertCircle } from 'lucide-react'
import { apiService } from '../services/api'
import { 
  StudentInterestDTO,
  SleepHabitsRequest,
  DietHabitsRequest,
  ExerciseHabitsRequest,
  ScreenTimeRequest,
  MediaConsumptionRequest,
  PhysicalProfileRequest
} from '../services/types'
import { useAuth } from '../contexts/AuthContext'
import FormField from '../components/common/FormField'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { 
  HOBBY_CONSTANTS, 
  PROFESSION_CONSTANTS, 
  MEDICAL_CONDITION_CONSTANTS,
  DEVICE_TYPE_CONSTANTS,
  MEDIA_PLATFORM_CONSTANTS,
  EXERCISE_CONSTANTS
} from '../constants'
import { getConstantOptions, hobbyDisplayNameToEnum, professionDisplayNameToEnum, hobbyEnumToDisplayName, professionEnumToDisplayName } from '../utils'

const HolisticProfile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  
  const [formData, setFormData] = useState<{
    hobbies: string[]
    aspirations: string[]
    achievements: string[]
    sleep: {
      bedtime: string
      wakeTime: string
      sleepQualityScore: number
      totalSleepHours: number
      notes: string
    }
    diet: {
      waterIntakeMl: number
      junkFoodFrequency: number
      mealsConsumed: number
      notes: string
    }
    exercise: {
      exerciseHours: number
      exerciseType: string
      intensityLevel: 'LIGHT' | 'MODERATE' | 'VIGOROUS' | 'EXTREME'
      caloriesBurned: number
      notes: string
    }
    screen: {
      totalScreenTimeHours: number
      preSleepScreenTimeMinutes: number
      deviceType: 'MOBILE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'TV' | 'GAMING_CONSOLE' | 'SMARTWATCH'
      screenTimeBeforeBed: boolean
      blueLightFilterUsed: boolean
      notes: string
    }
    media: {
      platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'REDDIT' | 'TWITTER' | 'FACEBOOK' | 'SNAPCHAT' | 'PINTEREST' | 'TWITCH' | 'NETFLIX' | 'DISNEY_PLUS' | 'AMAZON_PRIME' | 'VIDEO_GAMES' | 'PODCASTS' | 'AUDIOBOOKS' | 'EBOOKS' | 'ONLINE_NEWS' | 'BLOGS' | 'EDUCATIONAL_APPS' | 'OTHER'
      contentType: string
      durationMinutes: number
      contentCategory: string
      isEducational: boolean
      ageAppropriate: boolean
      notes: string
    }
    accessibility: {
      textToSpeech: boolean
      motorSupport: boolean
    }
    bodyWeightKg: string
    heightFeet: string
    heightInches: string
    medicalCondition: string
    medicalConditionNotes: string
  }>({
    // Hobbies & Aspirations
    hobbies: [],
    aspirations: [],
    achievements: [],
    
    // Habit Profile
    sleep: {
      bedtime: '',
      wakeTime: '',
      sleepQualityScore: 3,
      totalSleepHours: 8,
      notes: ''
    },
    diet: {
      waterIntakeMl: 2000,
      junkFoodFrequency: 1,
      mealsConsumed: 3,
      notes: ''
    },
    exercise: {
      exerciseHours: 1,
      exerciseType: '',
      intensityLevel: 'MODERATE' as 'LIGHT' | 'MODERATE' | 'VIGOROUS' | 'EXTREME',
      caloriesBurned: 200,
      notes: ''
    },
    screen: {
      totalScreenTimeHours: 3,
      preSleepScreenTimeMinutes: 30,
      deviceType: 'MOBILE',
      screenTimeBeforeBed: true,
      blueLightFilterUsed: false,
      notes: ''
    },
    media: {
      platform: 'YOUTUBE',
      contentType: '',
      durationMinutes: 60,
      contentCategory: '',
      isEducational: true,
      ageAppropriate: true,
      notes: ''
    },
    
    // Physical Profile
    accessibility: {
      textToSpeech: false,
      motorSupport: false
    },
    bodyWeightKg: '',
    heightFeet: '',
    heightInches: '',
    medicalCondition: '',
    medicalConditionNotes: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasExistingPhysicalProfile, setHasExistingPhysicalProfile] = useState(false)

  // Track existing habit record IDs for today (null = no record exists, use CREATE; number = exists, use UPDATE)
  const [existingHabitIds, setExistingHabitIds] = useState<{
    sleep: number | null
    diet: number | null
    exercise: number | null
    screenTime: number | null
    mediaConsumption: number | null
  }>({
    sleep: null,
    diet: null,
    exercise: null,
    screenTime: null,
    mediaConsumption: null,
  })

  // Dynamic data from API
  const [hobbies, setHobbies] = useState<string[]>([])
  const [professions, setProfessions] = useState<string[]>([])

  // Fetch hobbies, professions, and existing student interests from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hobbiesData, professionsData] = await Promise.all([
          apiService.getHobbies(),
          apiService.getProfessions()
        ]);
        
        setHobbies(hobbiesData);
        setProfessions(professionsData);

        // Load existing student interests if user is authenticated
        const studentId = user?.id ? (typeof user.id === 'number' ? user.id : Number(user.id)) : null
        if (studentId && !isNaN(studentId)) {
          try {
            const existingInterest = await apiService.getStudentInterest(studentId);
            if (existingInterest) {
              // Convert enum names back to display names for display
              // The API returns enum names (like "SOCCER"), but form stores display names (like "Soccer ⚽")
              const hobbyDisplayNames = (existingInterest.hobbies || [])
                .map(enumName => hobbyEnumToDisplayName(enumName))
                .filter(displayName => hobbiesData.includes(displayName)); // Only include if it exists in the API list
              
              const professionDisplayNames = (existingInterest.professions || [])
                .map(enumName => professionEnumToDisplayName(enumName))
                .filter(displayName => professionsData.includes(displayName)); // Only include if it exists in the API list
              
              setFormData(prev => ({
                ...prev,
                hobbies: hobbyDisplayNames,
                aspirations: professionDisplayNames,
                achievements: existingInterest.accolades || []
              }));
            }
          } catch (error) {
            // If no existing interest found, that's okay - user will create new one
            console.log('No existing interest found or error loading:', error);
          }

          // Load existing physical profile
          try {
            const existingPhysicalProfile = await apiService.getPhysicalProfileByStudentId(studentId);
            if (existingPhysicalProfile) {
              setHasExistingPhysicalProfile(true);
              setFormData(prev => ({
                ...prev,
                accessibility: {
                  textToSpeech: existingPhysicalProfile.textToSpeechNeeded || false,
                  motorSupport: existingPhysicalProfile.motorSupportNeeded || false
                },
                bodyWeightKg: existingPhysicalProfile.bodyWeightKg?.toString() || '',
                heightFeet: existingPhysicalProfile.heightFeet?.toString() || '',
                heightInches: existingPhysicalProfile.heightInches?.toString() || '',
                medicalCondition: existingPhysicalProfile.medicalCondition || '',
                medicalConditionNotes: existingPhysicalProfile.medicalConditionNotes || ''
              }));
            }
          } catch (error) {
            // If no existing physical profile found, that's okay - user will create new one
            setHasExistingPhysicalProfile(false);
            console.log('No existing physical profile found or error loading:', error);
          }

          // Load today's existing habits (to decide CREATE vs UPDATE on submit)
          try {
            const [todaySleep, todayDiet, todayExercise, todayScreenTime, todayMediaConsumption] = await Promise.all([
              apiService.getTodaySleepHabits(studentId),
              apiService.getTodayDietHabits(studentId),
              apiService.getTodayExerciseHabits(studentId),
              apiService.getTodayScreenTimeHabits(studentId),
              apiService.getTodayMediaConsumptionHabits(studentId),
            ]);

            setExistingHabitIds({
              sleep: todaySleep?.id ?? null,
              diet: todayDiet?.id ?? null,
              exercise: todayExercise?.id ?? null,
              screenTime: todayScreenTime?.id ?? null,
              mediaConsumption: todayMediaConsumption?.id ?? null,
            });

            // Pre-populate form with existing habit data
            if (todaySleep) {
              setFormData(prev => ({
                ...prev,
                sleep: {
                  bedtime: todaySleep.bedtime || '',
                  wakeTime: todaySleep.wakeTime || '',
                  sleepQualityScore: todaySleep.sleepQualityScore ?? 3,
                  totalSleepHours: todaySleep.totalSleepHours ?? 8,
                  notes: todaySleep.notes || '',
                }
              }));
            }
            if (todayDiet) {
              setFormData(prev => ({
                ...prev,
                diet: {
                  waterIntakeMl: todayDiet.waterIntakeMl ?? 2000,
                  junkFoodFrequency: todayDiet.junkFoodFrequency ?? 1,
                  mealsConsumed: todayDiet.mealsConsumed ?? 3,
                  notes: todayDiet.notes || '',
                }
              }));
            }
            if (todayExercise) {
              setFormData(prev => ({
                ...prev,
                exercise: {
                  exerciseHours: todayExercise.exerciseHours ?? 1,
                  exerciseType: todayExercise.exerciseType || '',
                  intensityLevel: todayExercise.intensityLevel || 'MODERATE',
                  caloriesBurned: todayExercise.caloriesBurned ?? 200,
                  notes: todayExercise.notes || '',
                }
              }));
            }
            if (todayScreenTime) {
              setFormData(prev => ({
                ...prev,
                screen: {
                  totalScreenTimeHours: todayScreenTime.totalScreenTimeHours ?? 3,
                  preSleepScreenTimeMinutes: todayScreenTime.preSleepScreenTimeMinutes ?? 30,
                  deviceType: todayScreenTime.deviceType || 'MOBILE',
                  screenTimeBeforeBed: todayScreenTime.screenTimeBeforeBed ?? true,
                  blueLightFilterUsed: todayScreenTime.blueLightFilterUsed ?? false,
                  notes: todayScreenTime.notes || '',
                }
              }));
            }
            if (todayMediaConsumption) {
              setFormData(prev => ({
                ...prev,
                media: {
                  platform: todayMediaConsumption.platform || 'YOUTUBE',
                  contentType: todayMediaConsumption.contentType || '',
                  durationMinutes: todayMediaConsumption.durationMinutes ?? 60,
                  contentCategory: todayMediaConsumption.contentCategory || '',
                  isEducational: todayMediaConsumption.isEducational ?? true,
                  ageAppropriate: todayMediaConsumption.ageAppropriate ?? true,
                  notes: todayMediaConsumption.notes || '',
                }
              }));
            }
          } catch (error) {
            console.log('Could not load existing habits for today:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to default data if API fails
        setHobbies([...HOBBY_CONSTANTS]);
        setProfessions([...PROFESSION_CONSTANTS]);
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [section, field] = name.split('.')
      setFormData(prev => {
        const sectionData = prev[section as keyof typeof prev]
        if (sectionData && typeof sectionData === 'object') {
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [field]: value
            }
          }
        }
        return prev
      })
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev] as string[]
        ? (prev[field as keyof typeof prev] as string[]).includes(value)
          ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
          : [...(prev[field as keyof typeof prev] as string[]), value]
        : [value]
    }))
  }

  const handleAccessibilityChange = (field: string) => {
    setFormData(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [field]: !prev.accessibility[field as keyof typeof prev.accessibility]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Verify authentication
      if (!user) {
        setError('You are not logged in. Please sign in and try again.')
        setIsLoading(false)
        return
      }

      // Resolve the numeric studentId from user.id
      // user.id may be a number (from login response) or need conversion
      const rawId = user.id
      const studentId = typeof rawId === 'number' ? rawId : Number(rawId)
      
      if (!studentId || isNaN(studentId) || studentId <= 0) {
        console.error('[HolisticProfile] Cannot resolve numeric student ID. user:', JSON.stringify(user))
        setError(`Unable to identify your account (id: ${rawId}). Please sign out and sign in again.`)
        setIsLoading(false)
        return
      }

      // 2. Validate physical profile required fields
      if (!formData.medicalCondition || formData.medicalCondition.trim() === '') {
        setError('Please select a medical condition')
        setCurrentStep(3)
        setIsLoading(false)
        return
      }

      if (formData.bodyWeightKg && formData.bodyWeightKg.trim() !== '') {
        const weight = parseFloat(formData.bodyWeightKg)
        if (isNaN(weight) || weight < 0 || weight > 500) {
          setError('Body weight must be between 0 and 500 kg')
          setCurrentStep(3)
          setIsLoading(false)
          return
        }
      }

      if (formData.heightFeet && formData.heightFeet.trim() !== '') {
        const feet = parseInt(formData.heightFeet, 10)
        if (isNaN(feet) || feet < 0 || feet > 10) {
          setError('Height feet must be between 0 and 10')
          setCurrentStep(3)
          setIsLoading(false)
          return
        }
      }

      if (formData.heightInches && formData.heightInches.trim() !== '') {
        const inches = parseInt(formData.heightInches, 10)
        if (isNaN(inches) || inches < 0 || inches > 11) {
          setError('Height inches must be between 0 and 11')
          setCurrentStep(3)
          setIsLoading(false)
          return
        }
      }

      if (formData.medicalConditionNotes && formData.medicalConditionNotes.length > 1000) {
        setError('Medical condition notes cannot exceed 1000 characters')
        setCurrentStep(3)
        setIsLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]

      // 3. Save interests
      const interestData: StudentInterestDTO = {
        studentId,
        hobbies: formData.hobbies.map(hobby => hobbyDisplayNameToEnum(hobby)),
        professions: formData.aspirations.map(profession => professionDisplayNameToEnum(profession)),
        accolades: formData.achievements
      }

      await apiService.createStudentInterest(interestData)
      
      // 4. Save habits data
      const sleepHabits: SleepHabitsRequest = {
        studentId,
        date: today,
        bedtime: formData.sleep.bedtime,
        wakeTime: formData.sleep.wakeTime,
        sleepQualityScore: formData.sleep.sleepQualityScore,
        totalSleepHours: formData.sleep.totalSleepHours,
        notes: formData.sleep.notes || undefined
      }

      const dietHabits: DietHabitsRequest = {
        studentId,
        date: today,
        waterIntakeMl: formData.diet.waterIntakeMl,
        junkFoodFrequency: formData.diet.junkFoodFrequency,
        mealsConsumed: formData.diet.mealsConsumed,
        notes: formData.diet.notes || undefined
      }

      const exerciseHabits: ExerciseHabitsRequest = {
        studentId,
        date: today,
        exerciseHours: formData.exercise.exerciseHours,
        exerciseType: formData.exercise.exerciseType || undefined,
        intensityLevel: formData.exercise.intensityLevel,
        caloriesBurned: formData.exercise.caloriesBurned || undefined,
        notes: formData.exercise.notes || undefined
      }

      const screenTimeHabits: ScreenTimeRequest = {
        studentId,
        date: today,
        totalScreenTimeHours: formData.screen.totalScreenTimeHours,
        preSleepScreenTimeMinutes: formData.screen.preSleepScreenTimeMinutes,
        deviceType: formData.screen.deviceType,
        screenTimeBeforeBed: formData.screen.screenTimeBeforeBed,
        blueLightFilterUsed: formData.screen.blueLightFilterUsed,
        notes: formData.screen.notes || undefined
      }

      const mediaConsumptionHabits: MediaConsumptionRequest = {
        studentId,
        date: today,
        platform: formData.media.platform,
        contentType: formData.media.contentType,
        durationMinutes: formData.media.durationMinutes,
        contentCategory: formData.media.contentCategory || undefined,
        isEducational: formData.media.isEducational,
        ageAppropriate: formData.media.ageAppropriate,
        notes: formData.media.notes || undefined
      }

      // Use UPDATE if today's record already exists, otherwise CREATE
      await Promise.all([
        existingHabitIds.sleep
          ? apiService.updateSleepHabits(existingHabitIds.sleep, sleepHabits)
          : apiService.createSleepHabits(sleepHabits),
        existingHabitIds.diet
          ? apiService.updateDietHabits(existingHabitIds.diet, dietHabits)
          : apiService.createDietHabits(dietHabits),
        existingHabitIds.exercise
          ? apiService.updateExerciseHabits(existingHabitIds.exercise, exerciseHabits)
          : apiService.createExerciseHabits(exerciseHabits),
        existingHabitIds.screenTime
          ? apiService.updateScreenTimeHabits(existingHabitIds.screenTime, screenTimeHabits)
          : apiService.createScreenTimeHabits(screenTimeHabits),
        existingHabitIds.mediaConsumption
          ? apiService.updateMediaConsumptionHabits(existingHabitIds.mediaConsumption, mediaConsumptionHabits)
          : apiService.createMediaConsumptionHabits(mediaConsumptionHabits),
      ])

      // 5. Save or update physical profile
      const physicalProfile: PhysicalProfileRequest = {
        studentId,
        textToSpeechNeeded: formData.accessibility.textToSpeech,
        motorSupportNeeded: formData.accessibility.motorSupport,
        bodyWeightKg: formData.bodyWeightKg && formData.bodyWeightKg.trim() !== '' 
          ? parseFloat(formData.bodyWeightKg) 
          : undefined,
        heightFeet: formData.heightFeet && formData.heightFeet.trim() !== '' 
          ? parseInt(formData.heightFeet, 10) 
          : undefined,
        heightInches: formData.heightInches && formData.heightInches.trim() !== '' 
          ? parseInt(formData.heightInches, 10) 
          : undefined,
        medicalCondition: formData.medicalCondition,
        medicalConditionNotes: formData.medicalConditionNotes && formData.medicalConditionNotes.trim() !== '' 
          ? formData.medicalConditionNotes.trim() 
          : undefined
      }

      console.log('[HolisticProfile] Physical profile submission:', {
        hasExistingPhysicalProfile,
        studentId,
        action: hasExistingPhysicalProfile ? 'UPDATE' : 'CREATE',
        payload: physicalProfile,
      })

      if (hasExistingPhysicalProfile) {
        console.log('[HolisticProfile] Calling PUT /profile/physical/student/' + studentId)
        await apiService.updatePhysicalProfileByStudentId(studentId, physicalProfile)
      } else {
        console.log('[HolisticProfile] Calling POST /profile/physical')
        await apiService.createPhysicalProfile(physicalProfile)
      }
      
      console.log('Holistic profile submitted successfully')
      
      // Update auth context to reflect profile completion
      updateUser({ holisticProfileCompleted: true })
      
      setIsSubmitted(true)
    } catch (error: unknown) {
      console.error('Profile submission error:', error)
      
      const status = (error as any)?.status
      if (status === 401) {
        setError('Your session has expired. Please sign out and sign in again.')
        return
      }
      if (status === 403) {
        setError('You do not have permission to save the physical profile. Please contact your administrator to grant access.')
        return
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Hobbies & Aspirations</h3>
      
      <div>
        <label className="block text-label text-label mb-3">What are your hobbies? (Select all that apply)</label>
        <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-input">
          {hobbies.map((hobby) => (
            <label key={hobby} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hobbies.includes(hobby)}
                onChange={() => handleCheckboxChange('hobbies', hobby)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-body">{hobby}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-label mt-2">Select all activities you enjoy doing in your free time</p>
      </div>

      <div>
        <label className="block text-label text-label mb-3">What do you want to be when you grow up? (Select all that interest you)</label>
        <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-input">
          {professions.map((profession) => (
            <label key={profession} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aspirations.includes(profession)}
                onChange={() => handleCheckboxChange('aspirations', profession)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-body">{profession}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-label mt-2">Choose all careers that sound interesting to you</p>
      </div>

      <div>
        <label className="block text-label text-label mb-2">Achievements & Accolades</label>
        <textarea
          name="achievements"
          value={formData.achievements.join(', ')}
          onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
          className="input-field"
          rows={4}
          placeholder="List your achievements (academic awards, sports medals, art competitions, etc.)"
        />
        <p className="text-sm text-label mt-1">Separate multiple achievements with commas</p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Habit Profile</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-montserrat font-semibold text-heading flex items-center">
            <Bed className="w-5 h-5 mr-2 text-primary" />
            Sleep Habits
          </h4>
          
          <div>
            <label className="block text-label text-label mb-2">Bedtime</label>
            <input
              type="time"
              name="sleep.bedtime"
              value={formData.sleep.bedtime}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Wake Time</label>
            <input
              type="time"
              name="sleep.wakeTime"
              value={formData.sleep.wakeTime}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Sleep Quality Score (1-5)</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    sleep: { ...prev.sleep, sleepQualityScore: score }
                  }))}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-colors ${
                    formData.sleep.sleepQualityScore === score
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-500 hover:border-primary'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <p className="text-sm text-label mt-1">1 = Poor sleep, 5 = Excellent sleep</p>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Total Sleep Hours</label>
            <input
              type="number"
              name="sleep.totalSleepHours"
              value={formData.sleep.totalSleepHours}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="24"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Notes</label>
            <textarea
              name="sleep.notes"
              value={formData.sleep.notes}
              onChange={handleInputChange}
              className="input-field"
              rows={2}
              placeholder="Any additional notes about your sleep..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-montserrat font-semibold text-heading flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-positive" />
            Diet Habits
          </h4>
          
          <div>
            <label className="block text-label text-label mb-2">Daily Water Intake (ml)</label>
            <input
              type="number"
              name="diet.waterIntakeMl"
              value={formData.diet.waterIntakeMl}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="10000"
              step="100"
            />
            <p className="text-sm text-label mt-1">Recommended: 2000-3000 ml per day</p>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Junk Food Frequency (times per day)</label>
            <input
              type="number"
              name="diet.junkFoodFrequency"
              value={formData.diet.junkFoodFrequency}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="10"
            />
            <p className="text-sm text-label mt-1">How many times do you eat junk food per day? (0-10)</p>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Meals Consumed Today</label>
            <input
              type="number"
              name="diet.mealsConsumed"
              value={formData.diet.mealsConsumed}
              onChange={handleInputChange}
              className="input-field"
              min="1"
              max="6"
            />
            <p className="text-sm text-label mt-1">Number of meals consumed today (1-6)</p>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Notes</label>
            <textarea
              name="diet.notes"
              value={formData.diet.notes}
              onChange={handleInputChange}
              className="input-field"
              rows={2}
              placeholder="Any additional notes about your diet..."
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-montserrat font-semibold text-heading flex items-center">
            <Dumbbell className="w-5 h-5 mr-2 text-action" />
            Exercise Habits
          </h4>
          
          <div>
            <label className="block text-label text-label mb-2">Exercise Hours Today</label>
            <input
              type="number"
              name="exercise.exerciseHours"
              value={formData.exercise.exerciseHours}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="8"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Exercise Type</label>
            <input
              type="text"
              name="exercise.exerciseType"
              value={formData.exercise.exerciseType}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Running, Swimming, Yoga..."
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Intensity Level</label>
            <select
              name="exercise.intensityLevel"
              value={formData.exercise.intensityLevel}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="LIGHT">Light</option>
              <option value="MODERATE">Moderate</option>
              <option value="VIGOROUS">Vigorous</option>
              <option value="EXTREME">Extreme</option>
            </select>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Calories Burned</label>
            <input
              type="number"
              name="exercise.caloriesBurned"
              value={formData.exercise.caloriesBurned}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="2000"
              step="10"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Notes</label>
            <textarea
              name="exercise.notes"
              value={formData.exercise.notes}
              onChange={handleInputChange}
              className="input-field"
              rows={2}
              placeholder="Any additional notes about your exercise..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-montserrat font-semibold text-heading flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-accent" />
            Screen Time
          </h4>
          
          <div>
            <label className="block text-label text-label mb-2">Total Screen Time Today (hours)</label>
            <input
              type="number"
              name="screen.totalScreenTimeHours"
              value={formData.screen.totalScreenTimeHours}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="24"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Pre-Sleep Screen Time (minutes)</label>
            <input
              type="number"
              name="screen.preSleepScreenTimeMinutes"
              value={formData.screen.preSleepScreenTimeMinutes}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="180"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Primary Device Type</label>
            <select
              name="screen.deviceType"
              value={formData.screen.deviceType}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="MOBILE">Mobile Phone</option>
              <option value="TABLET">Tablet</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop Computer</option>
              <option value="TV">Television</option>
              <option value="GAMING_CONSOLE">Gaming Console</option>
              <option value="SMARTWATCH">Smartwatch</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.screen.screenTimeBeforeBed}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  screen: { ...prev.screen, screenTimeBeforeBed: !prev.screen.screenTimeBeforeBed }
                }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-body">Used screen before bed</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.screen.blueLightFilterUsed}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  screen: { ...prev.screen, blueLightFilterUsed: !prev.screen.blueLightFilterUsed }
                }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-body">Used blue light filter</span>
            </label>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Notes</label>
            <textarea
              name="screen.notes"
              value={formData.screen.notes}
              onChange={handleInputChange}
              className="input-field"
              rows={2}
              placeholder="Any additional notes about your screen time..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-montserrat font-semibold text-heading flex items-center">
          <Eye className="w-5 h-5 mr-2 text-primary" />
          Media Consumption
        </h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-label text-label mb-2">Platform</label>
            <select
              name="media.platform"
              value={formData.media.platform}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="YOUTUBE">YouTube</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="TIKTOK">TikTok</option>
              <option value="REDDIT">Reddit</option>
              <option value="TWITTER">Twitter/X</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="SNAPCHAT">Snapchat</option>
              <option value="PINTEREST">Pinterest</option>
              <option value="TWITCH">Twitch</option>
              <option value="NETFLIX">Netflix</option>
              <option value="DISNEY_PLUS">Disney+</option>
              <option value="AMAZON_PRIME">Amazon Prime</option>
              <option value="VIDEO_GAMES">Video Games</option>
              <option value="PODCASTS">Podcasts</option>
              <option value="AUDIOBOOKS">Audiobooks</option>
              <option value="EBOOKS">E-books</option>
              <option value="ONLINE_NEWS">Online News</option>
              <option value="BLOGS">Blogs</option>
              <option value="EDUCATIONAL_APPS">Educational Apps</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-label text-label mb-2">Content Type</label>
            <input
              type="text"
              name="media.contentType"
              value={formData.media.contentType}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Videos, Stories, Posts..."
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Duration (minutes)</label>
            <input
              type="number"
              name="media.durationMinutes"
              value={formData.media.durationMinutes}
              onChange={handleInputChange}
              className="input-field"
              min="0"
              max="1440"
            />
          </div>

          <div>
            <label className="block text-label text-label mb-2">Content Category</label>
            <input
              type="text"
              name="media.contentCategory"
              value={formData.media.contentCategory}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., Entertainment, Education, News..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.media.isEducational}
              onChange={() => setFormData(prev => ({
                ...prev,
                media: { ...prev.media, isEducational: !prev.media.isEducational }
              }))}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-body">This content is educational</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.media.ageAppropriate}
              onChange={() => setFormData(prev => ({
                ...prev,
                media: { ...prev.media, ageAppropriate: !prev.media.ageAppropriate }
              }))}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-body">This content is age-appropriate</span>
          </label>
        </div>

        <div>
          <label className="block text-label text-label mb-2">Notes</label>
          <textarea
            name="media.notes"
            value={formData.media.notes}
            onChange={handleInputChange}
            className="input-field"
            rows={2}
            placeholder="Any additional notes about your media consumption..."
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Physical Profile</h3>
      
      <div className="space-y-4">
        <h4 className="text-lg font-montserrat font-semibold text-heading flex items-center">
          <Eye className="w-5 h-5 mr-2 text-primary" />
          Accessibility Needs
        </h4>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.accessibility.textToSpeech}
              onChange={() => handleAccessibilityChange('textToSpeech')}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-body">I need text-to-speech support</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.accessibility.motorSupport}
              onChange={() => handleAccessibilityChange('motorSupport')}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-body">I need motor support assistance</span>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label text-label mb-2">Body Weight (in kg) *</label>
          <input
            type="number"
            name="bodyWeightKg"
            value={formData.bodyWeightKg}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g., 45"
            min="0"
            max="500"
            step="0.1"
          />
          <p className="text-sm text-label mt-1">Optional: Enter your body weight in kilograms</p>
        </div>

        <div>
          <label className="block text-label text-label mb-2">Height *</label>
          <div className="flex space-x-2">
            <select
              name="heightFeet"
              value={formData.heightFeet}
              onChange={handleInputChange}
              className="input-field flex-1"
            >
              <option value="">Feet</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((feet) => (
                <option key={feet} value={feet}>{feet}'</option>
              ))}
            </select>
            <select
              name="heightInches"
              value={formData.heightInches}
              onChange={handleInputChange}
              className="input-field flex-1"
            >
              <option value="">Inches</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inches) => (
                <option key={inches} value={inches}>{inches}"</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-label mt-1">Optional: Select your height</p>
        </div>
      </div>

      <div>
        <label className="block text-label text-label mb-2">Medical Condition *</label>
        <FormField
          name="medicalCondition"
          type="select"
          value={formData.medicalCondition}
          onChange={handleInputChange}
          options={getConstantOptions(MEDICAL_CONDITION_CONSTANTS)}
          required
          disabled={isLoading}
          placeholder="Select your medical condition"
        />
        <p className="text-sm text-label mt-1">Please select your primary medical condition</p>
      </div>

      <div>
        <label className="block text-label text-label mb-2">Medical Condition Notes</label>
        <textarea
          name="medicalConditionNotes"
          value={formData.medicalConditionNotes}
          onChange={handleInputChange}
          className="input-field"
          rows={4}
          placeholder="Provide additional details about your medical condition (optional)"
          maxLength={1000}
        />
        <p className="text-sm text-label mt-1">Optional: Add any additional notes about your medical condition (max 1000 characters)</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-montserrat font-bold text-heading">SageFlow</span>
          </div>
          
          <h1 className="text-h1 text-heading mb-2">Complete Your Holistic Profile</h1>
          <p className="text-body text-body">Help us understand you better to provide personalized support</p>
          <p className="text-sm text-label mt-2">Please complete all steps to access your dashboard</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step <= currentStep 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mb-6 text-sm font-medium text-label">
          <span className={currentStep === 1 ? 'text-primary' : ''}>Hobbies & Aspirations</span>
          <span className={currentStep === 2 ? 'text-primary' : ''}>Habit Profile</span>
          <span className={currentStep === 3 ? 'text-primary' : ''}>Physical Profile</span>
        </div>

        {/* Form */}
        <div className="card">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-positive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-positive" />
              </div>
              <h3 className="text-xl font-montserrat font-semibold text-heading mb-4">Profile Completed Successfully!</h3>
              <p className="text-body text-body mb-6">
                Your holistic profile has been saved. We'll use this information to provide personalized support and recommendations.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="btn-primary w-full"
                >
                  Go to Dashboard
                </button>
                <p className="text-sm text-label">
                  You can update your profile anytime from your dashboard
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-input flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

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
                      className="btn-outline"
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
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <span>Complete Profile</span>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-6">
          <p className="text-sm text-label">
            Step {currentStep} of 3 - {Math.round((currentStep / 3) * 100)}% Complete
          </p>
        </div>
      </div>
    </div>
  )
}

export default HolisticProfile
