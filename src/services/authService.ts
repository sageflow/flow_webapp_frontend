import { BaseApiService } from './baseApiService';
import { LoginRequest, LoginResponse, StudentSignupRequest, TeacherSignupRequest, GuardianSignupRequest, PsychologistSignupRequest } from './types';

class AuthService extends BaseApiService {
  // Authentication APIs
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Clear any existing token before login to avoid sending invalid tokens
    this.clearToken();
    
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
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

  // User Signup APIs
  async studentSignup(data: StudentSignupRequest): Promise<any> {
    return this.request('/auth/signup/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async teacherSignup(data: TeacherSignupRequest): Promise<any> {
    return this.request('/auth/signup/teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async guardianSignup(data: GuardianSignupRequest): Promise<any> {
    return this.request('/auth/signup/guardian', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async psychologistSignup(data: PsychologistSignupRequest): Promise<any> {
    return this.request('/auth/signup/psychologist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
export default authService;
