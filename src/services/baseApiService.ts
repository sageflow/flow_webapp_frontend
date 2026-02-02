import { API_CONFIG, AUTH_CONSTANTS } from '../constants';
import { handleError, isNetworkError } from '../utils';

export class BaseApiService {
  // Set token for authenticated requests
  protected setToken(token: string) {
    localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
  }

  // Get token from localStorage - always read fresh to avoid stale cached tokens
  // (important when multiple service instances share the same localStorage key)
  public getToken(): string | null {
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
  }

  // Clear token on logout
  protected clearToken() {
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
  }

  // Get headers for requests
  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method with retry logic and better error handling
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(),
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle empty responses
        const text = await response.text();
        if (!text) {
          return {} as T;
        }

        return JSON.parse(text);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }

        // Don't retry on network errors if it's the last attempt
        if (isNetworkError(error) && attempt === API_CONFIG.RETRY_ATTEMPTS) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // If we get here, all retries failed
    const errorMessage = handleError(lastError, `API request to ${endpoint}`);
    throw new Error(errorMessage);
  }

  // Parse error response from API
  private async parseErrorResponse(response: Response): Promise<{ message: string; code?: string }> {
    try {
      const text = await response.text();
      if (text) {
        const errorData = JSON.parse(text);
        return {
          message: errorData.message || errorData.error || `HTTP ${response.status}`,
          code: errorData.code || errorData.errorCode,
        };
      }
    } catch {
      // If we can't parse the error response, return a generic message
    }

    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
    };
  }

  // Delay utility for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get user role from token
  public getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles?.[0] || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      return currentTime >= expiryTime - AUTH_CONSTANTS.TOKEN_EXPIRY_BUFFER;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  // Refresh token if needed
  public async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.isTokenExpired()) {
      try {
        // Attempt to refresh token (implement based on your API)
        const response = await this.request<{ token: string }>('/auth/refresh', {
          method: 'POST',
        });
        
        if (response.token) {
          this.setToken(response.token);
          return true;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.clearToken();
        return false;
      }
    }
    
    return true;
  }
}
