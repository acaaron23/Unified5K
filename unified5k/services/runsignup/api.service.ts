/**
 * RunSignUp API Service
 * Base service for making API requests to RunSignUp
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const PRODUCTION_BASE_URL = 'https://runsignup.com';
const TEST_BASE_URL = 'https://test.runsignup.com';

// Use test environment for development
const IS_PRODUCTION = false;
// Use TEST environment (where your credentials are registered)
const BASE_URL = 'https://test.runsignup.com';

console.log('RunSignUp API URL:', BASE_URL);
// API Credentials from environment variables
// Note: API Key/Secret are optional - OAuth credentials are sufficient for most operations
const API_KEY = process.env.EXPO_PUBLIC_RUNSIGNUP_API_KEY || '';
const API_SECRET = process.env.EXPO_PUBLIC_RUNSIGNUP_API_SECRET || '';

// Storage keys
const TOKEN_KEY = 'runsignup_access_token';
const REFRESH_TOKEN_KEY = 'runsignup_refresh_token';
const TOKEN_EXPIRY_KEY = 'runsignup_token_expiry';

export interface ApiError {
  error_code: number;
  error_msg: string;
  param_missing?: { param_name: string }[];
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

class RunSignUpApiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add authentication
    this.client.interceptors.request.use(
      async (config) => {
        await this.ensureAuthenticated();
        
        // Add API credentials to params if available
        if (!config.params) {
          config.params = {};
        }
        
        // Only add API key/secret if they're configured
        // OAuth token is sufficient for authenticated requests
        if (API_KEY && API_SECRET) {
          config.params.api_key = API_KEY;
          config.params.api_secret = API_SECRET;
        }
        
        config.params.format = 'json';

        // Add OAuth token if available
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.data?.error) {
          const apiError = error.response.data.error;
          
          // Handle token expiration (error code 6)
          if (apiError.error_code === 6) {
            console.log('Token expired, attempting refresh...');
            await this.refreshAccessToken();
            // Retry the original request
            return this.client.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Ensure we have valid authentication before making requests
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.accessToken) {
      // Check if token is expired
      const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = new Date(expiryStr);
        if (new Date() < expiry) {
          return; // Token is still valid
        }
      }
    }

    // Try to load token from secure storage
    const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (storedToken) {
      this.accessToken = storedToken;
    }
  }

  /**
   * Set OAuth access token
   */
  async setAccessToken(token: string, expiresIn: number = 3600): Promise<void> {
    this.accessToken = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    
    // Calculate expiry time
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + expiresIn);
    await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiry.toISOString());
  }

  /**
   * Set OAuth refresh token
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    this.accessToken = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Note: Implement OAuth2 token refresh endpoint
      // This is a placeholder - actual implementation in OAuth2Service
      console.log('Token refresh needed - implement in OAuth2Service');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearTokens();
      throw error;
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(
        endpoint,
        {
          ...config,
          params: { ...params, ...config?.params },
        }
      );

      if (response.data.error) {
        throw new Error(
          `API Error ${response.data.error.error_code}: ${response.data.error.error_msg}`
        );
      }

      return (response.data.data || response.data) as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(
        endpoint,
        data,
        config
      );

      if (response.data.error) {
        throw new Error(
          `API Error ${response.data.error.error_code}: ${response.data.error.error_msg}`
        );
      }

      return (response.data.data || response.data) as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(
        endpoint,
        data,
        config
      );

      if (response.data.error) {
        throw new Error(
          `API Error ${response.data.error.error_code}: ${response.data.error.error_msg}`
        );
      }

      return response.data.data as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(
        endpoint,
        config
      );

      if (response.data.error) {
        throw new Error(
          `API Error ${response.data.error.error_code}: ${response.data.error.error_msg}`
        );
      }

      return (response.data.data || response.data) as T;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): void {
    if (error.response) {
      // Server responded with error
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', error.request);
    } else {
      // Error setting up request
      console.error('API Request Error:', error.message);
    }
  }

  /**
   * Check if API is configured
   * OAuth credentials are sufficient for most operations
   */
  isConfigured(): boolean {
    // Check if we have OAuth tokens (which is sufficient)
    // OR if we have API key/secret
    return Boolean(this.accessToken || (API_KEY && API_SECRET));
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return BASE_URL;
  }
}

// Export singleton instance
export const apiService = new RunSignUpApiService();
export default apiService;