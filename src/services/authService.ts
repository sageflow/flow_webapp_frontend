import { BaseApiService } from './baseApiService';
import { LoginRequest, LoginResponse, UserRole, StudentSignupRequest, TeacherSignupRequest, GuardianSignupRequest, PsychologistSignupRequest } from './types';

class AuthService extends BaseApiService {
  // Authentication APIs
  async login(credentials: LoginRequest, role: UserRole): Promise<LoginResponse> {
    // Clear any existing token before login
    this.clearToken();

    const response = await this.request<LoginResponse>(`/auth/login/${role}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, { skipAuth: true });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    // Clear token first to ensure it's removed even if API call fails
    this.clearToken();
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout errors - token is already cleared
      console.warn('Logout API call failed:', error);
    }
  }

  // User Signup APIs – skipAuth ensures no stale JWT is sent
  async studentSignup(data: StudentSignupRequest): Promise<any> {
    return this.request('/auth/signup/student', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { skipAuth: true });
  }

  async teacherSignup(data: TeacherSignupRequest): Promise<any> {
    return this.request('/auth/signup/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { skipAuth: true });
  }

  async guardianSignup(data: GuardianSignupRequest): Promise<any> {
    return this.request('/auth/signup/guardian', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { skipAuth: true });
  }

  async psychologistSignup(data: PsychologistSignupRequest): Promise<any> {
    return this.request('/auth/signup/psychologist', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { skipAuth: true });
  }
}

export const authService = new AuthService();
export default authService;
