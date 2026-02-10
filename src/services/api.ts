import { BaseApiService } from './baseApiService';
import { authService } from './authService';
import {
  LoginRequest,
  LoginResponse,
  StudentSignupRequest,
  TeacherSignupRequest,
  GuardianSignupRequest,
  PsychologistSignupRequest,
  InterestData,
  StudentInterestDTO,
  PhysicalProfileRequest,
  PhysicalProfileResponse,
  Assessment,
  AssessmentQuestion,
  AssessmentSubmission,
  AssessmentResult,
  PendingTests,
  TestQuestions,
  CompleteTestRequest,
  CompleteTestResponse,
  Therapist,
  TherapistAvailability,
  SessionRequest,
  TherapySession,
  WeeklyPulseRequest,
  WeeklyPulseResponse,
  WeeklyPulseStatsResponse,
  PulseCheckQuestion,
  PulseCheckSubmission,
  PulseCheckResult,
  DailyRoutine,
  RoutineActivity,
  RoutineGenerationRequest,
  RoutineCompletionRequest,
  SleepHabitsRequest,
  SleepHabitsResponse,
  DietHabitsRequest,
  DietHabitsResponse,
  ExerciseHabitsRequest,
  ExerciseHabitsResponse,
  ScreenTimeRequest,
  ScreenTimeResponse,
  MediaConsumptionRequest,
  MediaConsumptionResponse,
  HabitsSummaryResponse,
  // Legacy types for backward compatibility
  SleepHabits,
  DietHabits,
  ExerciseHabits,
  ScreenTimeHabits,
  MediaConsumptionHabits,
  HabitsSummary,
  Complaint,
  CreateComplaintRequest,
  ComplaintResponse,
  IssueCategory,
  SeverityLevel,
  ComplaintStatus,
  Student,
  StudentAutocompleteDTO,
  AutocompleteResponse,
  StudentSearchMode,
  Marksheet,
  OceanQuestion,
  GuidanceResponse,
  StudentWellbeing
} from './types';

class ApiService extends BaseApiService {
  // Authentication APIs - delegate to authService
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return authService.login(credentials);
  }

  async logout(): Promise<void> {
    return authService.logout();
  }

  async studentSignup(data: StudentSignupRequest): Promise<any> {
    return authService.studentSignup(data);
  }

  async teacherSignup(data: TeacherSignupRequest): Promise<any> {
    return authService.teacherSignup(data);
  }

  async guardianSignup(data: GuardianSignupRequest): Promise<any> {
    return authService.guardianSignup(data);
  }

  async psychologistSignup(data: PsychologistSignupRequest): Promise<any> {
    return authService.psychologistSignup(data);
  }
  // Interest & Profile Management
  async getHobbies(): Promise<string[]> {
    return this.request('/interest/hobbies');
  }

  async getProfessions(): Promise<string[]> {
    return this.request('/interest/professions');
  }

  async createStudentInterest(data: StudentInterestDTO): Promise<void> {
    return this.request('/interest/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentInterest(studentId: number): Promise<StudentInterestDTO> {
    return this.request(`/interest/${studentId}`);
  }

  // Legacy method for backward compatibility (deprecated)
  async saveStudentInterest(data: InterestData): Promise<any> {
    // Map old format to new format
    const studentInterestDTO: StudentInterestDTO = {
      studentId: data.studentId,
      hobbies: data.hobbies,
      professions: data.professions,
      accolades: [] // Map from careerGoals or personalValues if needed
    };
    return this.createStudentInterest(studentInterestDTO);
  }

  // Physical Profile Management
  async createPhysicalProfile(data: PhysicalProfileRequest): Promise<PhysicalProfileResponse> {
    return this.request('/profile/physical', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPhysicalProfileByStudentId(studentId: number): Promise<PhysicalProfileResponse> {
    return this.request(`/profile/physical/student/${studentId}`);
  }

  async updatePhysicalProfileByStudentId(studentId: number, data: PhysicalProfileRequest): Promise<PhysicalProfileResponse> {
    return this.request(`/profile/physical/student/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Assessment Management
  async getAssessments(): Promise<Assessment[]> {
    return this.request('/assessments');
  }

  async getAssessmentById(id: number): Promise<Assessment> {
    return this.request(`/assessments/${id}`);
  }

  // Alias for backward compatibility
  async getAssessment(id: number): Promise<Assessment> {
    return this.getAssessmentById(id);
  }

  async submitAssessment(data: AssessmentSubmission): Promise<AssessmentResult> {
    return this.request('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAssessmentResults(studentId: number): Promise<AssessmentResult[]> {
    return this.request(`/assessments/results/${studentId}`);
  }

  // Test Management (Common Test Controller)
  async getPendingTests(): Promise<PendingTests[]> {
    return this.request('/pending');
  }

  async getPendingSpecificTest(testType: string, testId: number): Promise<TestQuestions> {
    return this.request(`/pending/test?testType=${testType}&testId=${testId}`);
  }

  async completeTest(data: CompleteTestRequest): Promise<CompleteTestResponse> {
    return this.request('/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // OCEAN (Big Five Personality) Test
  async getOceanQuestions(): Promise<OceanQuestion[]> {
    return this.request('/ocean/questions');
  }

  // Therapist Management
  async getTherapists(): Promise<Therapist[]> {
    return this.request('/therapists');
  }

  async getTherapistById(id: number): Promise<Therapist> {
    return this.request(`/therapists/${id}`);
  }

  async getTherapistAvailability(therapistId: number, date: string): Promise<TherapistAvailability[]> {
    return this.request(`/therapists/${therapistId}/availability?date=${date}`);
  }

  async requestSession(data: SessionRequest): Promise<SessionResponse> {
    return this.request('/sessions/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessions(studentId: number): Promise<TherapySession[]> {
    return this.request(`/sessions/student/${studentId}`);
  }

  // Weekly Pulse Management
  async submitWeeklyPulse(data: WeeklyPulseRequest): Promise<WeeklyPulseResponse> {
    return this.request('/weekly-pulse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentWeekPulse(): Promise<WeeklyPulseResponse> {
    return this.request('/weekly-pulse/current');
  }

  async canSubmitPulse(): Promise<boolean> {
    return this.request('/weekly-pulse/can-submit');
  }

  async getWeeklyPulseStats(
    studentId: number,
    startDate: string,
    endDate: string
  ): Promise<WeeklyPulseStatsResponse> {
    return this.request(`/weekly-pulse/${studentId}/stats?startDate=${startDate}&endDate=${endDate}`);
  }

  // Legacy Pulse Check Management (deprecated)
  async getPulseCheckQuestions(): Promise<PulseCheckQuestion[]> {
    return this.request('/pulse-check/questions');
  }

  async submitPulseCheck(data: PulseCheckSubmission): Promise<PulseCheckResult> {
    return this.request('/pulse-check/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPulseCheckHistory(studentId: number): Promise<PulseCheckResult[]> {
    return this.request(`/pulse-check/history/${studentId}`);
  }


  // Daily Routine
  async generateRoutine(data: RoutineGenerationRequest): Promise<DailyRoutine> {
    return this.request('/routines/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeRoutineActivity(data: RoutineCompletionRequest): Promise<any> {
    return this.request('/routines/complete-activity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoutineHistory(studentId: number): Promise<DailyRoutine[]> {
    return this.request(`/routines/history/${studentId}`);
  }

  // Guidance Management
  async getTodaysGuidances(): Promise<GuidanceResponse[]> {
    return this.request('/guidance/today');
  }

  async markGuidanceAsComplete(guidanceId: number): Promise<GuidanceResponse> {
    return this.request(`/guidance/${guidanceId}/complete`, {
      method: 'PUT',
    });
  }

  // Wellbeing Management
  async getTodaysWellbeing(): Promise<StudentWellbeing[]> {
    return this.request('/wellbeing/today');
  }

  // Habits Management - Sleep
  async createSleepHabits(data: SleepHabitsRequest): Promise<SleepHabitsResponse> {
    return this.request('/habits/sleep', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSleepHabits(id: number, data: SleepHabitsRequest): Promise<SleepHabitsResponse> {
    return this.request(`/habits/sleep/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSleepHabitsById(id: number): Promise<SleepHabitsResponse> {
    return this.request(`/habits/sleep/${id}`);
  }

  async getSleepHabitsByStudent(studentId: number): Promise<SleepHabitsResponse[]> {
    return this.request(`/habits/sleep/student/${studentId}`);
  }

  async getSleepHabitsByDateRange(studentId: number, startDate: string, endDate: string): Promise<SleepHabitsResponse[]> {
    return this.request(`/habits/sleep/student/${studentId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTodaySleepHabits(studentId: number): Promise<SleepHabitsResponse | null> {
    try {
      return await this.request<SleepHabitsResponse>(`/habits/sleep/student/${studentId}/today`);
    } catch {
      return null;
    }
  }

  async getWeeklySleepHabits(studentId: number): Promise<SleepHabitsResponse[]> {
    return this.request(`/habits/sleep/student/${studentId}/week`);
  }

  async getMonthlySleepHabits(studentId: number): Promise<SleepHabitsResponse[]> {
    return this.request(`/habits/sleep/student/${studentId}/month`);
  }

  async deleteSleepHabits(id: number): Promise<void> {
    return this.request(`/habits/sleep/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits Management - Diet
  async createDietHabits(data: DietHabitsRequest): Promise<DietHabitsResponse> {
    return this.request('/habits/diet', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDietHabits(id: number, data: DietHabitsRequest): Promise<DietHabitsResponse> {
    return this.request(`/habits/diet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDietHabitsById(id: number): Promise<DietHabitsResponse> {
    return this.request(`/habits/diet/${id}`);
  }

  async getDietHabitsByStudent(studentId: number): Promise<DietHabitsResponse[]> {
    return this.request(`/habits/diet/student/${studentId}`);
  }

  async getDietHabitsByDateRange(studentId: number, startDate: string, endDate: string): Promise<DietHabitsResponse[]> {
    return this.request(`/habits/diet/student/${studentId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTodayDietHabits(studentId: number): Promise<DietHabitsResponse | null> {
    try {
      return await this.request<DietHabitsResponse>(`/habits/diet/student/${studentId}/today`);
    } catch {
      return null;
    }
  }

  async getWeeklyDietHabits(studentId: number): Promise<DietHabitsResponse[]> {
    return this.request(`/habits/diet/student/${studentId}/week`);
  }

  async getMonthlyDietHabits(studentId: number): Promise<DietHabitsResponse[]> {
    return this.request(`/habits/diet/student/${studentId}/month`);
  }

  async deleteDietHabits(id: number): Promise<void> {
    return this.request(`/habits/diet/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits Management - Exercise
  async createExerciseHabits(data: ExerciseHabitsRequest): Promise<ExerciseHabitsResponse> {
    return this.request('/habits/exercise', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExerciseHabits(id: number, data: ExerciseHabitsRequest): Promise<ExerciseHabitsResponse> {
    return this.request(`/habits/exercise/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getExerciseHabitsById(id: number): Promise<ExerciseHabitsResponse> {
    return this.request(`/habits/exercise/${id}`);
  }

  async getExerciseHabitsByStudent(studentId: number): Promise<ExerciseHabitsResponse[]> {
    return this.request(`/habits/exercise/student/${studentId}`);
  }

  async getExerciseHabitsByDateRange(studentId: number, startDate: string, endDate: string): Promise<ExerciseHabitsResponse[]> {
    return this.request(`/habits/exercise/student/${studentId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getExerciseHabitsByType(studentId: number, exerciseType: string): Promise<ExerciseHabitsResponse[]> {
    return this.request(`/habits/exercise/student/${studentId}/type/${exerciseType}`);
  }

  async getTodayExerciseHabits(studentId: number): Promise<ExerciseHabitsResponse | null> {
    try {
      return await this.request<ExerciseHabitsResponse>(`/habits/exercise/student/${studentId}/today`);
    } catch {
      return null;
    }
  }

  async getWeeklyExerciseHabits(studentId: number): Promise<ExerciseHabitsResponse[]> {
    return this.request(`/habits/exercise/student/${studentId}/week`);
  }

  async getMonthlyExerciseHabits(studentId: number): Promise<ExerciseHabitsResponse[]> {
    return this.request(`/habits/exercise/student/${studentId}/month`);
  }

  async deleteExerciseHabits(id: number): Promise<void> {
    return this.request(`/habits/exercise/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits Management - Screen Time
  async createScreenTimeHabits(data: ScreenTimeRequest): Promise<ScreenTimeResponse> {
    return this.request('/habits/screen-time', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScreenTimeHabits(id: number, data: ScreenTimeRequest): Promise<ScreenTimeResponse> {
    return this.request(`/habits/screen-time/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getScreenTimeHabitsById(id: number): Promise<ScreenTimeResponse> {
    return this.request(`/habits/screen-time/${id}`);
  }

  async getScreenTimeHabitsByStudent(studentId: number): Promise<ScreenTimeResponse[]> {
    return this.request(`/habits/screen-time/student/${studentId}`);
  }

  async getScreenTimeHabitsByDateRange(studentId: number, startDate: string, endDate: string): Promise<ScreenTimeResponse[]> {
    return this.request(`/habits/screen-time/student/${studentId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTodayScreenTimeHabits(studentId: number): Promise<ScreenTimeResponse | null> {
    try {
      return await this.request<ScreenTimeResponse>(`/habits/screen-time/student/${studentId}/today`);
    } catch {
      return null;
    }
  }

  async getWeeklyScreenTimeHabits(studentId: number): Promise<ScreenTimeResponse[]> {
    return this.request(`/habits/screen-time/student/${studentId}/week`);
  }

  async getMonthlyScreenTimeHabits(studentId: number): Promise<ScreenTimeResponse[]> {
    return this.request(`/habits/screen-time/student/${studentId}/month`);
  }

  async deleteScreenTimeHabits(id: number): Promise<void> {
    return this.request(`/habits/screen-time/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits Management - Media Consumption
  async createMediaConsumptionHabits(data: MediaConsumptionRequest): Promise<MediaConsumptionResponse> {
    return this.request('/habits/media-consumption', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMediaConsumptionHabits(id: number, data: MediaConsumptionRequest): Promise<MediaConsumptionResponse> {
    return this.request(`/habits/media-consumption/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMediaConsumptionHabitsById(id: number): Promise<MediaConsumptionResponse> {
    return this.request(`/habits/media-consumption/${id}`);
  }

  async getMediaConsumptionHabitsByStudent(studentId: number): Promise<MediaConsumptionResponse[]> {
    return this.request(`/habits/media-consumption/student/${studentId}`);
  }

  async getMediaConsumptionHabitsByDateRange(studentId: number, startDate: string, endDate: string): Promise<MediaConsumptionResponse[]> {
    return this.request(`/habits/media-consumption/student/${studentId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getMediaConsumptionHabitsByPlatform(studentId: number, platform: string): Promise<MediaConsumptionResponse[]> {
    return this.request(`/habits/media-consumption/student/${studentId}/platform/${platform}`);
  }

  async getTodayMediaConsumptionHabits(studentId: number): Promise<MediaConsumptionResponse | null> {
    try {
      return await this.request<MediaConsumptionResponse>(`/habits/media-consumption/student/${studentId}/today`);
    } catch {
      return null;
    }
  }

  async getWeeklyMediaConsumptionHabits(studentId: number): Promise<MediaConsumptionResponse[]> {
    return this.request(`/habits/media-consumption/student/${studentId}/week`);
  }

  async getMonthlyMediaConsumptionHabits(studentId: number): Promise<MediaConsumptionResponse[]> {
    return this.request(`/habits/media-consumption/student/${studentId}/month`);
  }

  async deleteMediaConsumptionHabits(id: number): Promise<void> {
    return this.request(`/habits/media-consumption/${id}`, {
      method: 'DELETE',
    });
  }

  // Habits Summary
  async getHabitsSummary(studentId: number, startDate: string, endDate: string): Promise<HabitsSummaryResponse> {
    return this.request(`/habits/summary/student/${studentId}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getWeeklyHabitsSummary(studentId: number): Promise<HabitsSummaryResponse> {
    return this.request(`/habits/summary/student/${studentId}/week`);
  }

  async getMonthlyHabitsSummary(studentId: number): Promise<HabitsSummaryResponse> {
    return this.request(`/habits/summary/student/${studentId}/month`);
  }

  async getQuarterlyHabitsSummary(studentId: number): Promise<HabitsSummaryResponse> {
    return this.request(`/habits/summary/student/${studentId}/quarter`);
  }

  async getYearlyHabitsSummary(studentId: number): Promise<HabitsSummaryResponse> {
    return this.request(`/habits/summary/student/${studentId}/year`);
  }

  // Legacy methods for backward compatibility (deprecated)
  async getTodaySleepHabitsLegacy(studentId: number): Promise<SleepHabits | null> {
    const today = new Date().toISOString().split('T')[0];
    const habits = await this.request<SleepHabits[]>(`/habits/sleep/${studentId}?date=${today}`);
    return habits.length > 0 ? habits[0] : null;
  }

  async getStudentDietHabits(studentId: number): Promise<DietHabits[]> {
    return this.request(`/habits/diet/${studentId}`);
  }

  async getStudentExerciseHabits(studentId: number): Promise<ExerciseHabits[]> {
    return this.request(`/habits/exercise/${studentId}`);
  }

  async getStudentScreenTimeHabits(studentId: number): Promise<ScreenTimeHabits[]> {
    return this.request(`/habits/screen-time/${studentId}`);
  }

  async getStudentMediaConsumptionHabits(studentId: number): Promise<MediaConsumptionHabits[]> {
    return this.request(`/habits/media-consumption/${studentId}`);
  }

  // Complaints Management
  async createComplaint(data: CreateComplaintRequest): Promise<ComplaintResponse> {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all complaints submitted by the current user
   * GET /complaints/me
   * Note: Anonymous complaints have submitter=null, so they cannot be retrieved by submitter
   */
  async getMyComplaints(): Promise<ComplaintResponse[]> {
    return this.request('/complaints/me');
  }

  async getComplaints(studentId: number): Promise<ComplaintResponse[]> {
    return this.request(`/complaints/student/${studentId}`);
  }

  async getComplaintById(id: number): Promise<ComplaintResponse> {
    return this.request(`/complaints/${id}`);
  }

  /**
   * Track a complaint by its tracking code
   * GET /complaints/track/{trackingCode}
   * This can be used to track anonymous complaints
   */
  async getComplaintByTrackingCode(trackingCode: string): Promise<ComplaintResponse> {
    return this.request(`/complaints/track/${trackingCode}`);
  }

  async updateComplaintStatus(id: number, status: ComplaintStatus): Promise<ComplaintResponse> {
    return this.request(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Student Management
  async getStudents(): Promise<Student[]> {
    return this.request('/students');
  }

  async getStudentById(id: number): Promise<Student> {
    return this.request(`/students/${id}`);
  }

  // Legacy search method (deprecated - use studentAutocomplete instead)
  async searchStudents(query: string): Promise<Student[]> {
    return this.request(`/students/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Student name autocomplete - optimized for real-time search
   * GET /api/v1/students/autocomplete?q={query}&limit={limit}
   * @param query Search query (minimum 2 characters)
   * @param limit Maximum number of results (default: 10, max: 50)
   */
  async studentAutocomplete(
    query: string,
    limit: number = 10
  ): Promise<AutocompleteResponse<StudentAutocompleteDTO>> {
    return this.request(
      `/api/v1/students/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  /**
   * Advanced student search with different search strategies
   * GET /api/v1/students/search?q={query}&mode={mode}&limit={limit}
   * @param query Search query (minimum 2 characters)
   * @param mode Search mode: BASIC, ADVANCED, or COMPREHENSIVE
   * @param limit Maximum number of results (default: 10, max: 50)
   */
  async studentSearch(
    query: string,
    mode: StudentSearchMode = 'BASIC',
    limit: number = 10
  ): Promise<AutocompleteResponse<StudentAutocompleteDTO>> {
    return this.request(
      `/api/v1/students/search?q=${encodeURIComponent(query)}&mode=${mode}&limit=${limit}`
    );
  }

  /**
   * Search students by grade level
   * GET /api/v1/students/search/by-grade?grade={grade}&q={query}&limit={limit}
   * @param gradeLevel Grade level to filter by
   * @param query Search query (minimum 2 characters)
   * @param limit Maximum number of results (default: 10, max: 50)
   */
  async studentSearchByGrade(
    gradeLevel: string,
    query: string,
    limit: number = 10
  ): Promise<AutocompleteResponse<StudentAutocompleteDTO>> {
    return this.request(
      `/api/v1/students/search/by-grade?grade=${encodeURIComponent(gradeLevel)}&q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Marksheet Management
  async getMarksheet(studentId: number, semester: string): Promise<Marksheet> {
    return this.request(`/marksheets/${studentId}?semester=${semester}`);
  }

  async updateMarksheet(studentId: number, semester: string, data: Partial<Marksheet>): Promise<Marksheet> {
    return this.request(`/marksheets/${studentId}?semester=${semester}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Sleep Habits Analytics
  async getSleepQualityAnalytics(studentId: number, startDate: string, endDate: string): Promise<any> {
    return this.request(`/analytics/sleep-quality/${studentId}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getSleepHoursAnalytics(studentId: number, startDate: string, endDate: string): Promise<any> {
    return this.request(`/analytics/sleep-hours/${studentId}?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const apiService = new ApiService();
export default apiService;

// Re-export types for convenience
export type {
  CreateComplaintRequest,
  ComplaintResponse,
  IssueCategory,
  SeverityLevel,
  ComplaintStatus,
  Complaint,
  Student,
  StudentAutocompleteDTO,
  AutocompleteResponse,
  StudentSearchMode
} from './types';
