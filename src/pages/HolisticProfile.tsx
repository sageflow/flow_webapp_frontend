import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Bed, Utensils, Dumbbell, Monitor, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
import AuthNavbar from '../components/common/AuthNavbar'
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
      isEducational: false,
      ageAppropriate: false,
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
                  isEducational: todayMediaConsumption.isEducational ?? false,
                  ageAppropriate: todayMediaConsumption.ageAppropriate ?? false,
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
    <div className="space-y-8">
      <h3 className="text-xl font-montserrat font-semibold text-heading">Hobbies & Aspirations</h3>

      {/* ── Hobbies chip picker ── */}
      <div className="space-y-4">
        {/* Question header */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-montserrat font-bold text-heading leading-snug">
                What are your hobbies?
              </p>
              <p className="text-xs text-label mt-0.5">Select all activities you enjoy in your free time</p>
            </div>
          </div>
          {formData.hobbies.length > 0 && (
            <span className="text-[11px] font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full flex-shrink-0">
              {formData.hobbies.length} selected
            </span>
          )}
        </div>
        {/* Chip area */}
        <div className="bg-violet-50/50 border border-violet-100/60 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            {hobbies.map((hobby) => {
              const selected = formData.hobbies.includes(hobby)
              return (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => handleCheckboxChange('hobbies', hobby)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${selected
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-glow'
                    : 'bg-white border-white/80 text-body hover:border-violet-300 hover:text-violet-700 hover:bg-white'
                    }`}
                >
                  {hobby}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Aspirations chip picker ── */}
      <div className="space-y-4">
        {/* Question header */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-montserrat font-bold text-heading leading-snug">
                What do you want to be when you grow up?
              </p>
              <p className="text-xs text-label mt-0.5">Select all careers that interest you</p>
            </div>
          </div>
          {formData.aspirations.length > 0 && (
            <span className="text-[11px] font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full flex-shrink-0">
              {formData.aspirations.length} selected
            </span>
          )}
        </div>
        {/* Chip area */}
        <div className="bg-violet-50/50 border border-violet-100/60 rounded-2xl p-4">
          <div className="flex flex-wrap gap-2">
            {professions.map((profession) => {
              const selected = formData.aspirations.includes(profession)
              return (
                <button
                  key={profession}
                  type="button"
                  onClick={() => handleCheckboxChange('aspirations', profession)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${selected
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-glow'
                    : 'bg-white border-white/80 text-body hover:border-violet-300 hover:text-violet-700 hover:bg-white'
                    }`}
                >
                  {profession}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-base font-montserrat font-bold text-heading leading-snug">Achievements & Accolades</p>
            <p className="text-xs text-label mt-0.5">Separate multiple achievements with commas</p>
          </div>
        </div>
        <textarea
          name="achievements"
          value={formData.achievements.join(', ')}
          onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
          rows={4}
          placeholder="e.g. State chess champion, Science fair 2nd place, School cricket team captain…"
        />
      </div>
    </div>
  )


  const renderStep2 = () => {
    // Shared glass input className
    const gInput = 'w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/40 transition-all'
    const gTextarea = `${gInput} resize-none`
    const gSelect = `${gInput} cursor-pointer`

    return (
      <div className="space-y-8">
        <h3 className="text-xl font-montserrat font-semibold text-heading">Habit Profile</h3>

        {/* ── Row 1: Sleep + Diet ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Sleep */}
          <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-indigo-100/60">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                  <Bed className="w-4 h-4 text-indigo-500" /> Sleep Habits
                </p>
                <p className="text-xs text-label mt-0.5">Log your sleep patterns for today</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Bedtime</label>
              <input type="time" name="sleep.bedtime" value={formData.sleep.bedtime} onChange={handleInputChange} className={gInput} />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Wake Time</label>
              <input type="time" name="sleep.wakeTime" value={formData.sleep.wakeTime} onChange={handleInputChange} className={gInput} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Sleep Quality</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sleep: { ...prev.sleep, sleepQualityScore: score } }))}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${formData.sleep.sleepQualityScore === score
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-transparent text-white shadow-glow'
                      : 'bg-white/70 border-white/60 text-gray-500 hover:border-violet-400 hover:text-violet-600'
                      }`}
                  >{score}</button>
                ))}
              </div>
              <p className="text-xs text-label">1 = Poor · 5 = Excellent</p>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Total Sleep Hours</label>
              <input type="number" name="sleep.totalSleepHours" value={formData.sleep.totalSleepHours} onChange={handleInputChange} className={gInput} min="0" max="24" step="0.5" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Notes</label>
              <textarea name="sleep.notes" value={formData.sleep.notes} onChange={handleInputChange} className={gTextarea} rows={2} placeholder="Any additional notes…" />
            </div>
          </div>

          {/* Diet */}
          <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-emerald-100/60">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-500" /> Diet Habits
                </p>
                <p className="text-xs text-label mt-0.5">Track your nutrition for today</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Daily Water Intake (ml)</label>
              <input type="number" name="diet.waterIntakeMl" value={formData.diet.waterIntakeMl} onChange={handleInputChange} className={gInput} min="0" max="10000" step="100" />
              <p className="text-xs text-label">Recommended: 2000–3000 ml / day</p>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Junk Food Frequency (per day)</label>
              <input type="number" name="diet.junkFoodFrequency" value={formData.diet.junkFoodFrequency} onChange={handleInputChange} className={gInput} min="0" max="10" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Meals Consumed Today</label>
              <input type="number" name="diet.mealsConsumed" value={formData.diet.mealsConsumed} onChange={handleInputChange} className={gInput} min="1" max="6" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Notes</label>
              <textarea name="diet.notes" value={formData.diet.notes} onChange={handleInputChange} className={gTextarea} rows={2} placeholder="Any additional notes…" />
            </div>
          </div>
        </div>

        {/* ── Row 2: Exercise + Screen Time ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Exercise */}
          <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-amber-100/60">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-amber-500" /> Exercise Habits
                </p>
                <p className="text-xs text-label mt-0.5">Log your physical activity for today</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Exercise Hours Today</label>
              <input type="number" name="exercise.exerciseHours" value={formData.exercise.exerciseHours} onChange={handleInputChange} className={gInput} min="0" max="8" step="0.5" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Exercise Type</label>
              <input type="text" name="exercise.exerciseType" value={formData.exercise.exerciseType} onChange={handleInputChange} className={gInput} placeholder="e.g., Running, Yoga, Swimming…" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Intensity Level</label>
              <select name="exercise.intensityLevel" value={formData.exercise.intensityLevel} onChange={handleInputChange} className={gSelect}>
                <option value="LIGHT">Light</option>
                <option value="MODERATE">Moderate</option>
                <option value="VIGOROUS">Vigorous</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Calories Burned</label>
              <input type="number" name="exercise.caloriesBurned" value={formData.exercise.caloriesBurned} onChange={handleInputChange} className={gInput} min="0" max="2000" step="10" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Notes</label>
              <textarea name="exercise.notes" value={formData.exercise.notes} onChange={handleInputChange} className={gTextarea} rows={2} placeholder="Any additional notes…" />
            </div>
          </div>

          {/* Screen Time */}
          <div className="bg-purple-50/50 border border-purple-100/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-purple-100/60">
              <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-violet-500" /> Screen Time
                </p>
                <p className="text-xs text-label mt-0.5">Track your device usage for today</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Total Screen Time (hours)</label>
              <input type="number" name="screen.totalScreenTimeHours" value={formData.screen.totalScreenTimeHours} onChange={handleInputChange} className={gInput} min="0" max="24" step="0.5" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Pre-Sleep Screen Time (min)</label>
              <input type="number" name="screen.preSleepScreenTimeMinutes" value={formData.screen.preSleepScreenTimeMinutes} onChange={handleInputChange} className={gInput} min="0" max="180" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Primary Device</label>
              <select name="screen.deviceType" value={formData.screen.deviceType} onChange={handleInputChange} className={gSelect}>
                <option value="MOBILE">Mobile Phone</option>
                <option value="TABLET">Tablet</option>
                <option value="LAPTOP">Laptop</option>
                <option value="DESKTOP">Desktop Computer</option>
                <option value="TV">Television</option>
                <option value="GAMING_CONSOLE">Gaming Console</option>
                <option value="SMARTWATCH">Smartwatch</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase mb-1">Toggles</label>
              {[{
                checked: formData.screen.screenTimeBeforeBed,
                label: 'Used screen before bed',
                onChange: () => setFormData(prev => ({ ...prev, screen: { ...prev.screen, screenTimeBeforeBed: !prev.screen.screenTimeBeforeBed } }))
              }, {
                checked: formData.screen.blueLightFilterUsed,
                label: 'Used blue light filter',
                onChange: () => setFormData(prev => ({ ...prev, screen: { ...prev.screen, blueLightFilterUsed: !prev.screen.blueLightFilterUsed } }))
              }].map(({ checked, label, onChange }) => (
                <button key={label} type="button" onClick={onChange}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${checked
                    ? 'bg-violet-100/80 border-violet-300 text-violet-800'
                    : 'bg-white/60 border-white/60 text-body hover:border-violet-200'
                    }`}>
                  <span>{label}</span>
                  <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${checked ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-gray-300'
                    }`} />
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Notes</label>
              <textarea name="screen.notes" value={formData.screen.notes} onChange={handleInputChange} className={gTextarea} rows={2} placeholder="Any additional notes…" />
            </div>
          </div>
        </div>

        {/* ── Media Consumption ── */}
        <div className="bg-pink-50/50 border border-pink-100/60 rounded-2xl p-5 space-y-5">
          <div className="flex items-start gap-3 pb-3 border-b border-pink-100/60">
            <div className="w-1 h-8 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                <Eye className="w-4 h-4 text-pink-500" /> Media Consumption
              </p>
              <p className="text-xs text-label mt-0.5">What are you watching or listening to?</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Platform</label>
              <select name="media.platform" value={formData.media.platform} onChange={handleInputChange} className={gSelect}>
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
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Content Type</label>
              <input type="text" name="media.contentType" value={formData.media.contentType} onChange={handleInputChange} className={gInput} placeholder="e.g., Videos, Shorts, Podcasts…" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Duration (minutes)</label>
              <input type="number" name="media.durationMinutes" value={formData.media.durationMinutes} onChange={handleInputChange} className={gInput} min="0" max="1440" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Content Category</label>
              <input type="text" name="media.contentCategory" value={formData.media.contentCategory} onChange={handleInputChange} className={gInput} placeholder="e.g., Entertainment, Education…" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[{
              checked: formData.media.isEducational,
              label: 'Educational content',
              onChange: () => setFormData(prev => ({ ...prev, media: { ...prev.media, isEducational: !prev.media.isEducational } }))
            }, {
              checked: formData.media.ageAppropriate,
              label: 'Age-appropriate content',
              onChange: () => setFormData(prev => ({ ...prev, media: { ...prev.media, ageAppropriate: !prev.media.ageAppropriate } }))
            }].map(({ checked, label, onChange }) => (
              <button key={label} type="button" onClick={onChange}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${checked
                  ? 'bg-pink-100/80 border-pink-300 text-pink-800'
                  : 'bg-white/60 border-white/60 text-body hover:border-pink-200'
                  }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${checked ? 'bg-pink-500 border-pink-500' : 'bg-transparent border-gray-300'
                  }`} />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Notes</label>
            <textarea name="media.notes" value={formData.media.notes} onChange={handleInputChange} className={gTextarea} rows={2} placeholder="Any additional notes…" />
          </div>
        </div>
      </div>
    )
  }


  const renderStep3 = () => {
    const gInput = 'w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl text-heading placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/40 transition-all'
    const gTextarea = `${gInput} resize-none`
    const gSelect = `${gInput} cursor-pointer`

    return (
      <div className="space-y-8">
        <h3 className="text-xl font-montserrat font-semibold text-heading">Physical Profile</h3>

        {/* ── Accessibility ── */}
        <div className="bg-violet-50/50 border border-violet-100/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b border-violet-100/60">
            <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-500" /> Accessibility Needs
              </p>
              <p className="text-xs text-label mt-0.5">Select any support you need day-to-day</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[{
              checked: formData.accessibility.textToSpeech,
              label: 'I need text-to-speech support',
              onChange: () => handleAccessibilityChange('textToSpeech')
            }, {
              checked: formData.accessibility.motorSupport,
              label: 'I need motor support assistance',
              onChange: () => handleAccessibilityChange('motorSupport')
            }].map(({ checked, label, onChange }) => (
              <button key={label} type="button" onClick={onChange}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${checked
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-glow'
                  : 'bg-white/60 border-white/60 text-body hover:border-violet-300 hover:text-violet-700'
                  }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${checked ? 'bg-white border-white' : 'bg-transparent border-gray-300'
                  }`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body measurements ── */}
        <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-5 space-y-5">
          <div className="flex items-start gap-3 pb-3 border-b border-blue-100/60">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-montserrat font-bold text-heading flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-500" /> Body Measurements
              </p>
              <p className="text-xs text-label mt-0.5">Optional — helps with wellness recommendations</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Body Weight (kg)</label>
              <input type="number" name="bodyWeightKg" value={formData.bodyWeightKg} onChange={handleInputChange} className={gInput} placeholder="e.g., 45" min="0" max="500" step="0.1" />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Height</label>
              <div className="flex gap-2">
                <select name="heightFeet" value={formData.heightFeet} onChange={handleInputChange} className={`${gSelect} flex-1`}>
                  <option value="">Feet</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(f => <option key={f} value={f}>{f}'</option>)}
                </select>
                <select name="heightInches" value={formData.heightInches} onChange={handleInputChange} className={`${gSelect} flex-1`}>
                  <option value="">Inches</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <option key={i} value={i}>{i}"</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Medical ── */}
        <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b border-rose-100/60">
            <div className="w-1 h-8 bg-gradient-to-b from-rose-400 to-red-500 rounded-full mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-montserrat font-bold text-heading">Medical Information</p>
              <p className="text-xs text-label mt-0.5">This helps us personalise your support</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Medical Condition <span className="text-rose-500">*</span></label>
            <FormField
              label="Medical Condition"
              name="medicalCondition"
              type="select"
              value={formData.medicalCondition}
              onChange={handleInputChange}
              options={getConstantOptions(MEDICAL_CONDITION_CONSTANTS)}
              required
              disabled={isLoading}
              placeholder="Select your medical condition"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-heading tracking-widest uppercase">Medical Condition Notes</label>
            <textarea
              name="medicalConditionNotes"
              value={formData.medicalConditionNotes}
              onChange={handleInputChange}
              className={gTextarea}
              rows={4}
              placeholder="Provide additional details (optional, max 1000 characters)"
              maxLength={1000}
            />
            <p className="text-xs text-label text-right">{formData.medicalConditionNotes.length}/1000</p>
          </div>
        </div>
      </div>
    )
  }

  const STEP_LABELS = ['Hobbies & Aspirations', 'Habit Profile', 'Physical Profile']

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50">

      {/* Ambient orbs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/20 to-violet-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[130px] rounded-full pointer-events-none" />

      {/* ── Navbar (full-width, consistent with all auth pages) ── */}
      <AuthNavbar backTo="/dashboard" backLabel="Dashboard" />

      <div className="max-w-4xl mx-auto w-full px-6 pb-10 relative z-10">

        {/* ── Page title ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <h1 className="text-h1 text-heading mb-1">Complete Your Holistic Profile</h1>
          <p className="text-body text-body">Help us understand you better to provide personalized support</p>
          <p className="text-sm text-label mt-1">Please complete all steps to access your dashboard</p>
        </motion.div>

        {/* ── Step Indicators ── */}
        <div className="flex items-start justify-center mb-8">
          {[1, 2, 3].map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step < currentStep
                  ? 'bg-violet-600 text-white'
                  : step === currentStep
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow'
                    : 'bg-white/60 border border-white/60 text-gray-400'
                  }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                <span className={`text-[10px] mt-1.5 font-semibold tracking-wide whitespace-nowrap ${step === currentStep ? 'text-violet-600' : 'text-gray-400'
                  }`}>
                  {STEP_LABELS[idx]}
                </span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-0.5 mx-3 mt-4 rounded-full transition-all duration-500 ${step < currentStep ? 'bg-violet-500' : 'bg-white/60'
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-card p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-montserrat font-semibold text-heading mb-3">Profile Completed Successfully!</h3>
                <p className="text-sm text-body mb-8 leading-relaxed max-w-md mx-auto">
                  Your holistic profile has been saved. We'll use this information to provide personalized support and recommendations.
                </p>
                <motion.button
                  onClick={() => navigate('/dashboard', { replace: true })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold px-8 py-3 rounded-xl shadow-glow hover:opacity-90 transition-all duration-200"
                >
                  Go to Dashboard
                </motion.button>
                <p className="text-xs text-label mt-4">You can update your profile anytime from your dashboard</p>
              </motion.div>
            ) : (
              <>
                {/* Error message */}
                {error && (
                  <ErrorMessage
                    message={error}
                    onClose={() => setError('')}
                    className="mb-6"
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                        {renderStep1()}
                      </motion.div>
                    )}
                    {currentStep === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                        {renderStep2()}
                      </motion.div>
                    )}
                    {currentStep === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                        {renderStep3()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t border-white/40">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 text-sm font-semibold text-heading hover:bg-white/85 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                    ) : <div />}

                    {currentStep < 3 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold rounded-xl text-sm shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-montserrat font-semibold rounded-xl text-sm shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Profile…</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Complete Profile
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>

        {/* Progress indicator */}
        {!isSubmitted && (
          <p className="text-center text-xs text-label mt-5">
            Step {currentStep} of 3 — {Math.round((currentStep / 3) * 100)}% complete
          </p>
        )}
      </div>
    </div>
  )
}

export default HolisticProfile
