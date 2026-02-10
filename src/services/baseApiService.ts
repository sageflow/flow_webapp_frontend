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

  // Clear token (public so AuthContext can call it on expired tokens)
  public clearToken() {
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

  // Custom error class to preserve HTTP status code
  private createApiError(message: string, status?: number): Error {
    const error = new Error(message);
    (error as any).status = status;
    return error;
  }

  // Generic request method with retry logic and better error handling
  // Set skipAuth to true for public endpoints (e.g. signup) that must never
  // send an Authorization header – even when a stale JWT sits in localStorage.
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    { skipAuth = false }: { skipAuth?: boolean } = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: skipAuth ? { 'Content-Type': 'application/json' } : this.getHeaders(),
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
          const message = errorData.message || `HTTP ${response.status}: ${response.statusText}`;

          // Attach the HTTP status to the error for downstream handling
          // (e.g., components can check status to redirect on 401)
          throw this.createApiError(message, response.status);
        }

        // Handle empty responses
        const text = await response.text();
        if (!text) {
          return {} as T;
        }

        return JSON.parse(text);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) - check status code, not message text
        const status = (error as any)?.status;
        if (status && status >= 400 && status < 500) {
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
    // Preserve the HTTP status code from the original error so callers can
    // branch on specific status codes (e.g. 403 Forbidden, 404 Not Found).
    const errorMessage = handleError(lastError, `API request to ${endpoint}`);
    throw this.createApiError(errorMessage, (lastError as any)?.status);
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
