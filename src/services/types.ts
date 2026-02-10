// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  token: string;
  username: string;
  role: string;
}

export interface StudentSignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  enrollmentDate: string;
  currentGradeLevel: string;
  academicStatus?: string;
  gpa: number;
  guardianName: string;
  guardianRelationship: string;
  medicalConditions?: string;
  preferredLanguage: string;
  nationality: string;
}

export interface TeacherSignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  hireDate: string;
  department?: string;
  specialization?: string;
  qualification?: string;
  certification?: string;
  salary?: number;
  yearsOfPriorExperience?: number;
  teachingSchedule?: string;
  affiliatedInstitutes?: string;
}

export interface GuardianSignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  childrenIds: number[];
  jobTitle: string;
  company: string;
  relationshipType: string;
}

export interface PsychologistSignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  biography: string;
}

// Interest & Profile Types
export interface StudentInterestDTO {
  studentId: number;
  hobbies: string[]; // Enum names like "SOCCER", "DRAWING", etc.
  professions: string[]; // Enum names like "ACTOR", "DOCTOR", etc.
  accolades: string[]; // List of achievement strings
}

// Legacy type for backward compatibility (deprecated)
export interface InterestData {
  studentId: number;
  hobbies: string[];
  professions: string[];
  academicInterests: string[];
  careerGoals: string[];
  personalValues: string[];
}

export interface Hobby {
  id: number;
  name: string;
  category: string;
  description: string;
}

export interface Profession {
  id: number;
  name: string;
  category: string;
  description: string;
  requiredSkills: string[];
  salaryRange: string;
}

// Assessment Types
export interface Assessment {
  id: number;
  title: string;
  description: string;
  type: 'IQ' | 'EQ' | 'PERSONALITY';
  duration: number;
  questions: AssessmentQuestion[];
  instructions: string;
  passingScore: number;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface AssessmentSubmission {
  assessmentId: number;
  studentId: number;
  answers: AssessmentAnswer[];
  startTime: string;
  endTime: string;
}

export interface AssessmentAnswer {
  questionId: number;
  answer: string | number;
  timeSpent: number;
}

export interface AssessmentResult {
  id: number;
  assessmentId: number;
  studentId: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
  insights: string[];
  recommendations: string[];
}

// Test Management Types
export interface PendingTests {
  testType: string;
  testId: number;
  testName: string;
  overdueDays: number;
}

export interface TestQuestion {
  sectionName: string;
  questionNumber: number;
  questionText: string;
  options: string; // JSON string of options like {"A": "Option A", "B": "Option B", ...}
}

export interface TestQuestions {
  testType: string;
  testQuestions: TestQuestion[];
}

export interface CompleteTestRequest {
  testType: string;
  testId: number;
  answers: Record<number, string>; // Map<Integer, Character> - question number to answer character
}

export interface CompleteTestResponse {
  success: boolean;
  message: string;
  studentId?: number;
  testType?: string;
  testId?: number;
}

// OCEAN (Big Five Personality) Test Types
export interface OceanQuestion {
  questionNumber: number;
  questionText: string;
}

// Therapist Marketplace Types
export interface Therapist {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  yearsOfExperience: number;
  licenseNumber: string;
  biography: string;
  hourlyRate: number;
  availability: TherapistAvailability[];
  rating: number;
  reviewCount: number;
}

export interface TherapistAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SessionRequest {
  therapistId: number;
  studentId: number;
  preferredDate: string;
  preferredTime: string;
  sessionType: string;
  notes: string;
}

export interface TherapySession {
  id: number;
  therapistId: number;
  studentId: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  sessionType: string;
  notes: string;
  therapistNotes?: string;
  studentFeedback?: string;
}

// Weekly Pulse Types
export interface WeeklyPulseRequest {
  rating: number; // 1-5
}

export interface WeeklyPulseResponse {
  id: number;
  studentId: number;
  rating: number;
  weekStartDate: string;
  createdAt: string;
}

export interface WeeklyPulseStatsResponse {
  studentId: number;
  periodStart: string; // LocalDate from backend, formatted as YYYY-MM-DD
  periodEnd: string; // LocalDate from backend, formatted as YYYY-MM-DD
  dailyStats: WeeklyPulseStatsResponse.IndividualStats[];
}

export namespace WeeklyPulseStatsResponse {
  export interface IndividualStats {
    date: string; // LocalDate from backend, formatted as YYYY-MM-DD
    pulseRating: number | null; // Can be null if no pulse was submitted for that date
  }
}

// Legacy Pulse Check Types (deprecated - use WeeklyPulseRequest/Response)
export interface PulseCheckQuestion {
  id: number;
  question: string;
  type: 'MOOD' | 'STRESS' | 'ENERGY' | 'SLEEP' | 'SOCIAL';
  options?: string[];
  scale?: {
    min: number;
    max: number;
    labels: string[];
  };
}

export interface PulseCheckSubmission {
  studentId: number;
  answers: PulseCheckAnswer[];
  mood: number;
  stressLevel: number;
  energyLevel: number;
  sleepQuality: number;
  socialWellbeing: number;
  notes: string;
}

export interface PulseCheckAnswer {
  questionId: number;
  answer: string | number;
}

export interface PulseCheckResult {
  id: number;
  studentId: number;
  submittedAt: string;
  overallScore: number;
  mood: number;
  stressLevel: number;
  energyLevel: number;
  sleepQuality: number;
  socialWellbeing: number;
  insights: string[];
  recommendations: string[];
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

// Daily Routine Types
export interface DailyRoutine {
  id: number;
  date: string;
  activities: RoutineActivity[];
  mood: number;
  energyLevel: number;
  completionRate: number;
  insights: string[];
}

export interface RoutineActivity {
  id: number;
  title: string;
  description: string;
  category: 'ACADEMIC' | 'PHYSICAL' | 'MENTAL' | 'SOCIAL' | 'RELAXATION';
  duration: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface RoutineGenerationRequest {
  studentId: number;
  date: string;
  mood: number;
  energyLevel: number;
  academicPerformance: number;
  stressLevel: number;
  preferences: string[];
}

export interface RoutineCompletionRequest {
  routineId: number;
  activityId: number;
  completedAt: string;
  notes?: string;
  moodAfter: number;
  energyAfter: number;
}

// Habits Types - Request DTOs
export interface SleepHabitsRequest {
  studentId: number;
  date: string; // YYYY-MM-DD format
  bedtime: string; // HH:mm format
  wakeTime: string; // HH:mm format
  sleepQualityScore: number; // 1-5
  totalSleepHours: number; // 0-24
  notes?: string;
}

export interface SleepHabitsResponse {
  id: number;
  studentId: number;
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepQualityScore: number;
  totalSleepHours: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DietHabitsRequest {
  studentId: number;
  date: string; // YYYY-MM-DD format
  waterIntakeMl: number; // 0-10000
  junkFoodFrequency: number; // 0-10
  mealsConsumed: number; // 1-6
  notes?: string; // max 500 chars
}

export interface DietHabitsResponse {
  id: number;
  studentId: number;
  date: string;
  waterIntakeMl: number;
  junkFoodFrequency: number;
  mealsConsumed: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseHabitsRequest {
  studentId: number;
  date: string; // YYYY-MM-DD format
  exerciseHours: number; // 0-8
  exerciseType?: string; // max 100 chars
  intensityLevel: 'LIGHT' | 'MODERATE' | 'VIGOROUS' | 'EXTREME';
  caloriesBurned?: number; // 0-5000
  notes?: string; // max 500 chars
}

export interface ExerciseHabitsResponse {
  id: number;
  studentId: number;
  date: string;
  exerciseHours: number;
  exerciseType?: string;
  intensityLevel: string;
  caloriesBurned?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenTimeRequest {
  studentId: number;
  date: string; // YYYY-MM-DD format
  totalScreenTimeHours: number; // 0-24
  preSleepScreenTimeMinutes: number; // 0-180
  deviceType: 'MOBILE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'TV' | 'GAMING_CONSOLE' | 'SMARTWATCH';
  screenTimeBeforeBed: boolean;
  blueLightFilterUsed: boolean;
  notes?: string; // max 500 chars
}

export interface ScreenTimeResponse {
  id: number;
  studentId: number;
  date: string;
  totalScreenTimeHours: number;
  preSleepScreenTimeMinutes: number;
  deviceType: string;
  blueLightFilterUsed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaConsumptionRequest {
  studentId: number;
  date: string; // YYYY-MM-DD format
  platform: string; // max 100 chars
  contentType: string; // max 100 chars
  durationMinutes: number; // 1-1440
  contentCategory?: string; // max 100 chars
  isEducational: boolean;
  ageAppropriate: boolean;
  notes?: string; // max 500 chars
}

export interface MediaConsumptionResponse {
  id: number;
  studentId: number;
  date: string;
  platform: string;
  contentType: string;
  durationMinutes: number;
  contentCategory?: string;
  isEducational: boolean;
  ageAppropriate: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitsSummaryResponse {
  studentId: number;
  startDate: string;
  endDate: string;
  averageSleepQuality?: number;
  averageSleepHours?: number;
  averageBedtime?: number;
  averageWakeTime?: number;
  averageWaterIntake?: number;
  averageJunkFoodFrequency?: number;
  averageMealsConsumed?: number;
  averageExerciseHours?: number;
  totalCaloriesBurned?: number;
  mostCommonExerciseType?: string;
  averageScreenTimeHours?: number;
  averagePreSleepScreenTime?: number;
  averageMediaDuration?: number;
  educationalContentCount?: number;
  mostUsedPlatform?: string;
}

// Legacy types for backward compatibility (deprecated)
export interface SleepHabits {
  id: number;
  studentId: number;
  date: string;
  bedtime: string;
  wakeTime: string;
  sleepQuality: number;
  totalHours: number;
  deepSleepHours: number;
  lightSleepHours: number;
  remSleepHours: number;
  interruptions: number;
  notes: string;
}

export interface DietHabits {
  id: number;
  studentId: number;
  date: string;
  waterIntake: number;
  meals: number;
  snacks: number;
  junkFoodFrequency: number;
  fruitsConsumed: number;
  vegetablesConsumed: number;
  proteinIntake: number;
  notes: string;
}

export interface ExerciseHabits {
  id: number;
  studentId: number;
  date: string;
  exerciseType: string;
  duration: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  caloriesBurned: number;
  heartRate: number;
  notes: string;
}

export interface ScreenTimeHabits {
  id: number;
  studentId: number;
  date: string;
  totalScreenTime: number;
  educationalScreenTime: number;
  entertainmentScreenTime: number;
  socialMediaTime: number;
  gamingTime: number;
  preSleepScreenTime: number;
  notes: string;
}

export interface MediaConsumptionHabits {
  id: number;
  studentId: number;
  date: string;
  platform: string;
  contentType: string;
  duration: number;
  quality: number;
  notes: string;
}

// Legacy HabitsSummary (deprecated - use HabitsSummaryResponse)
export interface HabitsSummary {
  studentId: number;
  startDate: string;
  endDate: string;
  sleepScore: number;
  dietScore: number;
  exerciseScore: number;
  screenTimeScore: number;
  overallScore: number;
  insights: string[];
  recommendations: string[];
}

// Physical Profile Types
export interface PhysicalProfileRequest {
  studentId: number;
  textToSpeechNeeded: boolean;
  motorSupportNeeded: boolean;
  bodyWeightKg?: number; // 0-500
  heightFeet?: number; // 0-10
  heightInches?: number; // 0-11
  medicalCondition: string; // Enum value from MEDICAL_CONDITION_CONSTANTS
  medicalConditionNotes?: string; // max 1000 chars
}

export interface PhysicalProfileResponse {
  id: number;
  studentId: number;
  textToSpeechNeeded: boolean;
  motorSupportNeeded: boolean;
  bodyWeightKg?: number;
  heightFeet?: number;
  heightInches?: number;
  medicalCondition: string;
  medicalConditionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Complaint Types

// Issue Category enum matching backend
export type IssueCategory = 
  | 'BULLYING'
  | 'HARASSMENT'
  | 'DISCRIMINATION'
  | 'ACADEMIC_MISCONDUCT'
  | 'SUBSTANCE_ABUSE'
  | 'VIOLENCE'
  | 'THEFT'
  | 'CYBERBULLYING'
  | 'SEXUAL_HARASSMENT'
  | 'OTHER';

// Severity Level enum matching backend
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Complaint Status enum matching backend
export type ComplaintStatus = 
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'ESCALATED';

export interface CreateComplaintRequest {
  issueCategory: IssueCategory;
  severityLevel: SeverityLevel;
  accusedStudentIds: number[];
  description: string;
  additionalEvidence?: string; // Optional, max 50,000 characters
  anonymous?: boolean; // Defaults to true
}

export interface ComplaintResponse {
  id: number;
  issueCategory: IssueCategory;
  severityLevel: SeverityLevel;
  accusedStudentIds: number[];
  description: string;
  additionalEvidence?: string;
  anonymous: boolean;
  trackingCode: string;
  status: ComplaintStatus;
  submitterId?: number; // null if anonymous
  assignedStaffId?: number;
  createdAt: string;
}

// Legacy Complaint type for backward compatibility
export interface Complaint {
  id: number;
  studentId: number;
  description: string;
  accusedStudentIds: number[];
  anonymous: boolean;
  status: string;
  severity: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  trackingCode: string;
  evidence?: string[];
  adminNotes?: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  grade: string;
  section?: string;
  school?: string;
  email?: string;
}

// Student Search/Autocomplete Types
export type StudentSearchMode = 'BASIC' | 'ADVANCED' | 'COMPREHENSIVE';

export interface StudentAutocompleteDTO {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  currentGradeLevel: string;
  academicStatus: string;
}

export interface AutocompleteResponse<T> {
  results: T[];
  totalResults: number;
  query: string;
  executionTimeMs: number;
}

// Marksheet Types
export interface Marksheet {
  id: number;
  studentId: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  fileSize: number;
  fileType: string;
}

// Guidance Types
export interface GuidanceResponse {
  id: number;
  studentId: number;
  guidanceText: string;
  date: string; // LocalDate from backend, formatted as YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string | null; // LocalDateTime from backend, ISO string format
  createdAt: string; // LocalDateTime from backend, ISO string format
}

// Wellbeing Types
export interface StudentWellbeing {
  stressPercentage: number;
  stressColour: string;
  wellbeingGist: string;
}