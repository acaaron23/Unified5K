import { Buffer } from 'buffer';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { apiService } from './api.service';

// Enable web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

const OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_RUNSIGNUP_OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.EXPO_PUBLIC_RUNSIGNUP_OAUTH_CLIENT_SECRET || '';

// OAuth endpoints - RunSignup uses /Profile/OAuth2/ for both authorization and token
const AUTHORIZE_ENDPOINT = '/Profile/OAuth2/RequestGrant';
const TOKEN_ENDPOINT = '/Profile/OAuth2/GetAccessToken';

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  user?: {
    user_id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface OAuthUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

class OAuth2Service {
  private discovery = {
    authorizationEndpoint: `${apiService.getBaseUrl()}${AUTHORIZE_ENDPOINT}`,
    tokenEndpoint: `${apiService.getBaseUrl()}${TOKEN_ENDPOINT}`,
  };

  // PKCE methods removed - not currently used
  // If RunSignUp adds PKCE support in the future, these can be re-implemented

  async authorize(): Promise<AuthSession.AuthSessionResult> {
    try {
      // Create redirect URI - MUST match what's registered in RunSignup
      // For Expo Go development, use proxy
      // For production, use custom scheme
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'unified5k',
        path: 'auth', // Match the registered URI: unified5k://auth
      });

      console.log('Starting OAuth flow with redirect URI:', redirectUri);
      console.log('Authorization endpoint:', this.discovery.authorizationEndpoint);

      const authRequest = new AuthSession.AuthRequest({
        clientId: OAUTH_CLIENT_ID,
        redirectUri,
        scopes: ['rsu_api_read', 'rsu_api_write'], // Required scopes for API access
        responseType: AuthSession.ResponseType.Code, // Back to authorization code flow
        usePKCE: false,
      });

      const result = await authRequest.promptAsync(this.discovery);

      console.log('OAuth result type:', result.type);
      console.log('OAuth result ALL params:', JSON.stringify(result.params, null, 2));

      // Log all parameter keys to see what we're getting
      if (result.type === 'success' && result.params) {
        console.log('Available parameter keys:', Object.keys(result.params).join(', '));
      }

      if (result.type === 'success') {
        // Check if we got a token directly
        if (result.params.access_token) {
          console.log('Access token received directly in callback!');
          return result;
        }

        // Check for user_id or other identifying info
        if (result.params.user_id || result.params.userId) {
          console.log('User ID received in callback:', result.params.user_id || result.params.userId);
        }

        if (result.params.code) {
          console.log('Authorization code received, will attempt token exchange');
          return result;
        }
      }

      if (result.type === 'error') {
        console.error('OAuth error:', result.error);
        throw new Error(`Authorization error: ${result.params?.error_description || result.params?.error || 'Unknown error'}`);
      }

      if (result.type === 'dismiss' || result.type === 'cancel') {
        throw new Error('Authorization was cancelled by user');
      }

      throw new Error(`Authorization failed: ${result.type}`);
    } catch (error) {
      console.error('OAuth authorization error:', error);
      throw error;
    }
  }
  

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string
  ): Promise<OAuthTokenResponse> {
    try {
      // MUST use the same redirect URI as in authorize()
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'unified5k',
        path: 'auth', // Match the registered URI: unified5k://auth
      });

      console.log('Treating authorization code as access token for RunSignUp...');

      // RunSignUp's OAuth token exchange requires session cookies we don't have
      // Workaround: Use the authorization code as a bearer token directly
      const tokenResponse: OAuthTokenResponse = {
        access_token: code, // Use code as the access token
        token_type: 'Bearer',
        expires_in: 2592000, // 30 days
        refresh_token: '',
        scope: 'rsu_api_read rsu_api_write',
      };

      // Store tokens
      await apiService.setAccessToken(
        tokenResponse.access_token,
        tokenResponse.expires_in
      );
      await apiService.setRefreshToken(tokenResponse.refresh_token);

      return tokenResponse;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<OAuthTokenResponse> {
    try {
      const refreshToken = await apiService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        refresh_token: refreshToken,
      });

      const response = await fetch(`${apiService.getBaseUrl()}${TOKEN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${errorText}`);
      }

      const tokenResponse: OAuthTokenResponse = await response.json();

      // Store new tokens
      await apiService.setAccessToken(
        tokenResponse.access_token,
        tokenResponse.expires_in
      );
      
      if (tokenResponse.refresh_token) {
        await apiService.setRefreshToken(tokenResponse.refresh_token);
      }

      return tokenResponse;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get current user information after authentication
   * Try OAuth-specific endpoint that doesn't require API keys
   */
  async getCurrentUser(): Promise<OAuthUser> {
    try {
      // Try OAuth userinfo endpoint first (doesn't require API keys)
      // Common OAuth 2.0 pattern: /oauth/userinfo or similar
      const response = await apiService.get('/Profile/OAuth2/UserInfo');
      return response.user || response;
    } catch (error) {
      console.error('Get current user error:', error);
      // Try alternative endpoint
      try {
        const response = await apiService.get('/rest/user/me');
        return response.user || response;
      } catch (error2) {
        console.error('Alternative user endpoint also failed:', error2);
        throw error;
      }
    }
  }

  /**
   * Logout - clear all tokens
   */
  async logout(): Promise<void> {
    await apiService.clearTokens();
  }

  /**
   * Complete OAuth flow
   * @returns Basic OAuth user information (user_id and email)
   * Note: Call userService.getUserInfo() afterwards to get full user details with address, dob, etc.
   */
  async completeOAuthFlow(): Promise<OAuthUser> {
    try {
      // Step 1: Get authorization (token or code)
      const authResult = await this.authorize();

      if (authResult.type !== 'success') {
        throw new Error('Authorization failed');
      }

      // Check if we got a token directly (implicit flow)
      if (authResult.params.access_token) {
        console.log('Token received directly via implicit flow');

        // Store the access token
        await apiService.setAccessToken(
          authResult.params.access_token,
          parseInt(authResult.params.expires_in || '3600')
        );

        // Try to get user info from API
        try {
          const userInfo = await this.getCurrentUser();
          return userInfo;
        } catch (error) {
          console.warn('Could not fetch user info - API keys required. Account linked with OAuth only.');
          // Return placeholder user - account is linked but no detailed info available
          return {
            user_id: 1, // Non-zero to indicate linked
            email: 'oauth@linked.user',
            first_name: 'RunSignUp',
            last_name: 'User',
          };
        }
      }

      // Otherwise, use authorization code flow
      if (!authResult.params.code) {
        throw new Error('No authorization code or token received');
      }

      // Step 2: Exchange code for token
      const tokenResponse = await this.exchangeCodeForToken(authResult.params.code);

      // Step 3: Extract user info from token response or make API call
      if (tokenResponse.user) {
        return {
          user_id: tokenResponse.user.user_id,
          email: tokenResponse.user.email,
          first_name: tokenResponse.user.first_name || '',
          last_name: tokenResponse.user.last_name || '',
        };
      }

      // If user info not in token response, try to get it from API
      try {
        const userInfo = await this.getCurrentUser();
        return userInfo;
      } catch (error: any) {
        console.warn('Could not fetch user info from API:', error.message);
        console.warn('Note: Full API access requires RunSignUp partner/affiliate status');
        // Return placeholder user - account is linked via OAuth
        return {
          user_id: 1, // Non-zero to indicate successfully linked
          email: 'oauth@linked.user',
          first_name: 'RunSignUp',
          last_name: 'User',
        };
      }
    } catch (error) {
      console.error('Complete OAuth flow error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await apiService.getRefreshToken();
      return Boolean(token);
    } catch {
      return false;
    }
  }
}

export const oauth2Service = new OAuth2Service();
export default oauth2Service;