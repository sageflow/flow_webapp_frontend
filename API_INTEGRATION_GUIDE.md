# SageFlow API Integration Guide

This guide provides comprehensive documentation for all available SageFlow API endpoints and how to integrate them into your frontend application.

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Complaints Management](#complaints-management)
3. [Habits Tracking](#habits-tracking)
4. [Interest & Profile Management](#interest--profile-management)
5. [Assessment System](#assessment-system)
6. [Therapist Marketplace](#therapist-marketplace)
7. [Pulse Check System](#pulse-check-system)
8. [Daily Engagement](#daily-engagement)
9. [Daily Routine](#daily-routine)
10. [Marksheet Management](#marksheet-management)

## Base Configuration

```typescript
import { apiService } from './services/api';

// Set base URL (already configured in api.ts)
const API_BASE_URL = 'http://localhost:8080';
```

## 1. Authentication & User Management

### Login
```typescript
const login = async (username: string, password: string) => {
  try {
    const response = await apiService.login({ username, password });
    console.log('Login successful:', response.user);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Logout
```typescript
const logout = async () => {
  try {
    await apiService.logout();
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};
```

### User Signup

#### Student Signup
```typescript
const studentSignup = async (userData: StudentSignupRequest) => {
  try {
    const response = await apiService.studentSignup(userData);
    console.log('Student signup successful:', response);
    return response;
  } catch (error) {
    console.error('Student signup failed:', error);
    throw error;
  }
};
```

#### Teacher Signup
```typescript
const teacherSignup = async (userData: TeacherSignupRequest) => {
  try {
    const response = await apiService.teacherSignup(userData);
    console.log('Teacher signup successful:', response);
    return response;
  } catch (error) {
    console.error('Teacher signup failed:', error);
    throw error;
  }
};
```

#### Psychologist Signup
```typescript
const psychologistSignup = async (userData: PsychologistSignupRequest) => {
  try {
    const response = await apiService.psychologistSignup(userData);
    console.log('Psychologist signup successful:', response);
    return response;
  } catch (error) {
    console.error('Psychologist signup failed:', error);
    throw error;
  }
};
```

## 2. Complaints Management

### Get User's Complaints
```typescript
const getMyComplaints = async () => {
  try {
    const complaints = await apiService.getMyComplaints();
    console.log('User complaints:', complaints);
    return complaints;
  } catch (error) {
    console.error('Failed to fetch complaints:', error);
    throw error;
  }
};
```

### Track Complaint
```typescript
const trackComplaint = async (trackingCode: string) => {
  try {
    const complaint = await apiService.trackComplaint(trackingCode);
    console.log('Complaint details:', complaint);
    return complaint;
  } catch (error) {
    console.error('Failed to track complaint:', error);
    throw error;
  }
};
```

### Create Complaint
```typescript
const createComplaint = async (complaintData: CreateComplaintRequest) => {
  try {
    const response = await apiService.createComplaint(complaintData);
    console.log('Complaint created:', response);
    return response;
  } catch (error) {
    console.error('Failed to create complaint:', error);
    throw error;
  }
};
```

## 3. Habits Tracking

### Sleep Habits

#### Create Sleep Habit
```typescript
const createSleepHabit = async (sleepData: SleepHabits) => {
  try {
    const habit = await apiService.createSleepHabits(sleepData);
    console.log('Sleep habit created:', habit);
    return habit;
  } catch (error) {
    console.error('Failed to create sleep habit:', error);
    throw error;
  }
};
```

#### Get Sleep Habits by Student
```typescript
const getStudentSleepHabits = async (studentId: number) => {
  try {
    const habits = await apiService.getStudentSleepHabits(studentId);
    console.log('Sleep habits:', habits);
    return habits;
  } catch (error) {
    console.error('Failed to fetch sleep habits:', error);
    throw error;
  }
};
```

#### Get Sleep Analytics
```typescript
const getSleepAnalytics = async (studentId: number, startDate: string, endDate: string) => {
  try {
    const [qualityAnalytics, hoursAnalytics] = await Promise.all([
      apiService.getSleepQualityAnalytics(studentId, startDate, endDate),
      apiService.getSleepHoursAnalytics(studentId, startDate, endDate)
    ]);
    
    console.log('Sleep quality analytics:', qualityAnalytics);
    console.log('Sleep hours analytics:', hoursAnalytics);
    
    return { qualityAnalytics, hoursAnalytics };
  } catch (error) {
    console.error('Failed to fetch sleep analytics:', error);
    throw error;
  }
};
```

### Diet Habits

#### Create Diet Habit
```typescript
const createDietHabit = async (dietData: DietHabits) => {
  try {
    const habit = await apiService.createDietHabits(dietData);
    console.log('Diet habit created:', habit);
    return habit;
  } catch (error) {
    console.error('Failed to create diet habit:', error);
    throw error;
  }
};
```

#### Get Diet Analytics
```typescript
const getDietAnalytics = async (studentId: number, startDate: string, endDate: string) => {
  try {
    const [waterIntake, junkFoodFrequency] = await Promise.all([
      apiService.getWaterIntakeAnalytics(studentId, startDate, endDate),
      apiService.getJunkFoodFrequencyAnalytics(studentId, startDate, endDate)
    ]);
    
    console.log('Water intake analytics:', waterIntake);
    console.log('Junk food frequency analytics:', junkFoodFrequency);
    
    return { waterIntake, junkFoodFrequency };
  } catch (error) {
    console.error('Failed to fetch diet analytics:', error);
    throw error;
  }
};
```

### Exercise Habits

#### Create Exercise Habit
```typescript
const createExerciseHabit = async (exerciseData: ExerciseHabits) => {
  try {
    const habit = await apiService.createExerciseHabits(exerciseData);
    console.log('Exercise habit created:', habit);
    return habit;
  } catch (error) {
    console.error('Failed to create exercise habit:', error);
    throw error;
  }
};
```

#### Get Exercise Analytics
```typescript
const getExerciseAnalytics = async (studentId: number, startDate: string, endDate: string) => {
  try {
    const [hoursAnalytics, caloriesAnalytics] = await Promise.all([
      apiService.getExerciseHoursAnalytics(studentId, startDate, endDate),
      apiService.getCaloriesBurnedAnalytics(studentId, startDate, endDate)
    ]);
    
    console.log('Exercise hours analytics:', hoursAnalytics);
    console.log('Calories burned analytics:', caloriesAnalytics);
    
    return { hoursAnalytics, caloriesAnalytics };
  } catch (error) {
    console.error('Failed to fetch exercise analytics:', error);
    throw error;
  }
};
```

### Screen Time Habits

#### Create Screen Time Habit
```typescript
const createScreenTimeHabit = async (screenTimeData: ScreenTimeHabits) => {
  try {
    const habit = await apiService.createScreenTimeHabits(screenTimeData);
    console.log('Screen time habit created:', habit);
    return habit;
  } catch (error) {
    console.error('Failed to create screen time habit:', error);
    throw error;
  }
};
```

#### Get Screen Time Analytics
```typescript
const getScreenTimeAnalytics = async (studentId: number, startDate: string, endDate: string) => {
  try {
    const preSleepAnalytics = await apiService.getPreSleepScreenTimeAnalytics(studentId, startDate, endDate);
    console.log('Pre-sleep screen time analytics:', preSleepAnalytics);
    return preSleepAnalytics;
  } catch (error) {
    console.error('Failed to fetch screen time analytics:', error);
    throw error;
  }
};
```

### Media Consumption Habits

#### Create Media Consumption Habit
```typescript
const createMediaConsumptionHabit = async (mediaData: MediaConsumptionHabits) => {
  try {
    const habit = await apiService.createMediaConsumptionHabits(mediaData);
    console.log('Media consumption habit created:', habit);
    return habit;
  } catch (error) {
    console.error('Failed to create media consumption habit:', error);
    throw error;
  }
};
```

#### Get Media Consumption by Platform
```typescript
const getMediaConsumptionByPlatform = async (studentId: number, platform: string) => {
  try {
    const habits = await apiService.getMediaConsumptionByPlatform(studentId, platform);
    console.log(`Media consumption for ${platform}:`, habits);
    return habits;
  } catch (error) {
    console.error('Failed to fetch media consumption by platform:', error);
    throw error;
  }
};
```

### Habits Summary & Health Score

#### Get Comprehensive Habits Summary
```typescript
const getHabitsSummary = async (studentId: number, startDate: string, endDate: string) => {
  try {
    const summary = await apiService.getHabitsSummary(studentId, startDate, endDate);
    console.log('Habits summary:', summary);
    return summary;
  } catch (error) {
    console.error('Failed to fetch habits summary:', error);
    throw error;
  }
};
```

#### Get Health Score
```typescript
const getHealthScore = async (studentId: number, startDate: string, endDate: string) => {
  try {
    const healthScore = await apiService.getOverallHealthScore(studentId, startDate, endDate);
    console.log('Health score:', healthScore);
    return healthScore;
  } catch (error) {
    console.error('Failed to fetch health score:', error);
    throw error;
  }
};
```

## 4. Interest & Profile Management

### Get Available Hobbies
```typescript
const getHobbies = async () => {
  try {
    const hobbies = await apiService.getHobbies();
    console.log('Available hobbies:', hobbies);
    return hobbies;
  } catch (error) {
    console.error('Failed to fetch hobbies:', error);
    throw error;
  }
};
```

### Get Available Professions
```typescript
const getProfessions = async () => {
  try {
    const professions = await apiService.getProfessions();
    console.log('Available professions:', professions);
    return professions;
  } catch (error) {
    console.error('Failed to fetch professions:', error);
    throw error;
  }
};
```

### Get Student Interest
```typescript
const getStudentInterest = async (studentId: number) => {
  try {
    const interest = await apiService.getStudentInterest(studentId);
    console.log('Student interest:', interest);
    return interest;
  } catch (error) {
    console.error('Failed to fetch student interest:', error);
    throw error;
  }
};
```

### Save Student Interest
```typescript
const saveStudentInterest = async (interestData: InterestData) => {
  try {
    const response = await apiService.saveStudentInterest(interestData);
    console.log('Interest saved:', response);
    return response;
  } catch (error) {
    console.error('Failed to save interest:', error);
    throw error;
  }
};
```

## 5. Assessment System

### Get Available Assessments
```typescript
const getAvailableAssessments = async () => {
  try {
    const assessments = await apiService.getAvailableAssessments();
    console.log('Available assessments:', assessments);
    return assessments;
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    throw error;
  }
};
```

### Get Assessment
```typescript
const getAssessment = async (assessmentId: number) => {
  try {
    const assessment = await apiService.getAssessment(assessmentId);
    console.log('Assessment details:', assessment);
    return assessment;
  } catch (error) {
    console.error('Failed to fetch assessment:', error);
    throw error;
  }
};
```

### Submit Assessment
```typescript
const submitAssessment = async (submission: AssessmentSubmission) => {
  try {
    const result = await apiService.submitAssessment(submission);
    console.log('Assessment submitted:', result);
    return result;
  } catch (error) {
    console.error('Failed to submit assessment:', error);
    throw error;
  }
};
```

### Get Assessment History
```typescript
const getAssessmentHistory = async (studentId: number) => {
  try {
    const history = await apiService.getAssessmentHistory(studentId);
    console.log('Assessment history:', history);
    return history;
  } catch (error) {
    console.error('Failed to fetch assessment history:', error);
    throw error;
  }
};
```

## 6. Therapist Marketplace

### Get Available Therapists
```typescript
const getTherapists = async () => {
  try {
    const therapists = await apiService.getTherapists();
    console.log('Available therapists:', therapists);
    return therapists;
  } catch (error) {
    console.error('Failed to fetch therapists:', error);
    throw error;
  }
};
```

### Get Therapist Details
```typescript
const getTherapist = async (therapistId: number) => {
  try {
    const therapist = await apiService.getTherapist(therapistId);
    console.log('Therapist details:', therapist);
    return therapist;
  } catch (error) {
    console.error('Failed to fetch therapist:', error);
    throw error;
  }
};
```

### Request Therapy Session
```typescript
const requestSession = async (sessionRequest: SessionRequest) => {
  try {
    const response = await apiService.requestSession(sessionRequest);
    console.log('Session request:', response);
    return response;
  } catch (error) {
    console.error('Failed to request session:', error);
    throw error;
  }
};
```

### Get My Sessions
```typescript
const getMySessions = async (studentId: number) => {
  try {
    const sessions = await apiService.getMySessions(studentId);
    console.log('My sessions:', sessions);
    return sessions;
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    throw error;
  }
};
```

## 7. Pulse Check System

### Get Weekly Pulse Check
```typescript
const getWeeklyPulseCheck = async () => {
  try {
    const pulseCheck = await apiService.getWeeklyPulseCheck();
    console.log('Weekly pulse check:', pulseCheck);
    return pulseCheck;
  } catch (error) {
    console.error('Failed to fetch pulse check:', error);
    throw error;
  }
};
```

### Submit Pulse Check
```typescript
const submitPulseCheck = async (submission: PulseCheckSubmission) => {
  try {
    const result = await apiService.submitPulseCheck(submission);
    console.log('Pulse check submitted:', result);
    return result;
  } catch (error) {
    console.error('Failed to submit pulse check:', error);
    throw error;
  }
};
```

### Get Pulse Check History
```typescript
const getPulseCheckHistory = async () => {
  try {
    const history = await apiService.getPulseCheckHistory();
    console.log('Pulse check history:', history);
    return history;
  } catch (error) {
    console.error('Failed to fetch pulse check history:', error);
    throw error;
  }
};
```

## 8. Daily Engagement

### Get Daily Engagement
```typescript
const getDailyEngagement = async () => {
  try {
    const engagement = await apiService.getDailyEngagement();
    console.log('Daily engagement:', engagement);
    return engagement;
  } catch (error) {
    console.error('Failed to fetch daily engagement:', error);
    throw error;
  }
};
```

### Submit Word Completion
```typescript
const submitWordCompletion = async (wordId: number) => {
  try {
    const response = await apiService.submitWordCompletion(wordId);
    console.log('Word completion submitted:', response);
    return response;
  } catch (error) {
    console.error('Failed to submit word completion:', error);
    throw error;
  }
};
```

### Submit Brain Teaser
```typescript
const submitBrainTeaser = async (submission: BrainTeaserSubmission) => {
  try {
    const response = await apiService.submitBrainTeaser(submission);
    console.log('Brain teaser submitted:', response);
    return response;
  } catch (error) {
    console.error('Failed to submit brain teaser:', error);
    throw error;
  }
};
```

## 9. Daily Routine

### Get Daily Routine
```typescript
const getDailyRoutine = async (date?: string) => {
  try {
    const routine = await apiService.getDailyRoutine(date);
    console.log('Daily routine:', routine);
    return routine;
  } catch (error) {
    console.error('Failed to fetch daily routine:', error);
    throw error;
  }
};
```

### Generate Daily Routine
```typescript
const generateDailyRoutine = async (request: RoutineGenerationRequest) => {
  try {
    const response = await apiService.generateDailyRoutine(request);
    console.log('Routine generated:', response);
    return response;
  } catch (error) {
    console.error('Failed to generate routine:', error);
    throw error;
  }
};
```

### Complete Routine Activity
```typescript
const completeRoutineActivity = async (request: RoutineCompletionRequest) => {
  try {
    const response = await apiService.completeRoutineActivity(request);
    console.log('Activity completed:', response);
    return response;
  } catch (error) {
    console.error('Failed to complete activity:', error);
    throw error;
  }
};
```

## 10. Marksheet Management

### Upload Marksheet
```typescript
const uploadMarksheet = async (file: File) => {
  try {
    const response = await apiService.uploadMarksheet(file);
    console.log('Marksheet uploaded:', response);
    return response;
  } catch (error) {
    console.error('Failed to upload marksheet:', error);
    throw error;
  }
};
```

## Error Handling Best Practices

### Global Error Handler
```typescript
const handleApiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  if (error.status === 401) {
    // Handle unauthorized access
    apiService.clearToken();
    // Redirect to login
  } else if (error.status === 403) {
    // Handle forbidden access
    console.error('Access denied');
  } else if (error.status >= 500) {
    // Handle server errors
    console.error('Server error, please try again later');
  } else {
    // Handle other errors
    console.error('An error occurred:', error.message);
  }
  
  throw error;
};
```

### API Call with Error Handling
```typescript
const safeApiCall = async <T>(apiCall: () => Promise<T>, context: string): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    handleApiError(error, context);
    throw error;
  }
};

// Usage
const getHabits = async () => {
  return safeApiCall(
    () => apiService.getStudentSleepHabits(123),
    'fetching sleep habits'
  );
};
```

## Authentication State Management

### Check Authentication Status
```typescript
const checkAuthStatus = () => {
  const isAuthenticated = apiService.isAuthenticated();
  const userRole = apiService.getUserRole();
  
  console.log('Auth status:', { isAuthenticated, userRole });
  return { isAuthenticated, userRole };
};
```

### Auto-login from localStorage
```typescript
const initializeAuth = () => {
  const token = localStorage.getItem('sageflow_token');
  if (token) {
    apiService.setToken(token);
    console.log('Auto-login successful');
  }
};

// Call this on app initialization
initializeAuth();
```

## Rate Limiting & Caching

### Simple Caching Implementation
```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = async <T>(
  key: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('Returning cached data for:', key);
    return cached.data;
  }
  
  const data = await apiCall();
  cache.set(key, { data, timestamp: now });
  return data;
};

// Usage
const getCachedHobbies = () => {
  return getCachedData('hobbies', () => apiService.getHobbies());
};
```

## Testing API Integration

### Test API Connectivity
```typescript
const testApiConnection = async () => {
  try {
    // Test a simple endpoint
    const hobbies = await apiService.getHobbies();
    console.log('API connection successful:', hobbies);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};
```

### Validate API Responses
```typescript
const validateApiResponse = <T>(response: T, expectedFields: string[]): boolean => {
  if (!response || typeof response !== 'object') {
    console.error('Invalid response format');
    return false;
  }
  
  const missingFields = expectedFields.filter(field => !(field in response));
  if (missingFields.length > 0) {
    console.error('Missing fields:', missingFields);
    return false;
  }
  
  return true;
};

// Usage
const validateHabitsResponse = (habits: any[]) => {
  return validateApiResponse(habits, ['id', 'studentId', 'date']);
};
```

This comprehensive guide covers all the SageFlow API endpoints available in your Postman collection. Each section includes practical examples of how to use the APIs in your frontend application, along with error handling and best practices.
