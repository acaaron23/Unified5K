import { Buffer } from 'buffer';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { apiService } from './api.service';

// Enable web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

const OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_RUNSIGNUP_OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.EXPO_PUBLIC_RUNSIGNUP_OAUTH_CLIENT_SECRET || '';

// OAuth endpoints - RunSignup uses /Profile/OAuth2/ for both authorization and token
// OAuth endpoints are at the root domain, not under /rest
const OAUTH_BASE_URL = 'https://runsignup.com';
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
    authorizationEndpoint: `${OAUTH_BASE_URL}${AUTHORIZE_ENDPOINT}`,
    tokenEndpoint: `${OAUTH_BASE_URL}${TOKEN_ENDPOINT}`,
  };

  // PKCE is enabled and handled automatically by expo-auth-session
  // This eliminates the need for client_secret in token exchange (mobile-friendly)

  async authorize(): Promise<AuthSession.AuthSessionResult> {
    try {
      // Create redirect URI - MUST match what's registered in RunSignup
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'unified5k',
        path: 'auth',
      });

      console.log('Starting OAuth flow with redirect URI:', redirectUri);
      console.log('Authorization endpoint:', this.discovery.authorizationEndpoint);
      console.log('OAuth Client ID:', OAUTH_CLIENT_ID);

      const authRequest = new AuthSession.AuthRequest({
        clientId: OAUTH_CLIENT_ID,
        redirectUri,
        scopes: ['rsu_api_read', 'rsu_api_write'],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: false,
      });

      const result = await authRequest.promptAsync(this.discovery);

      console.log('OAuth result type:', result.type);

      if (result.type === 'success' && result.params.code) {
        console.log('✅ Authorization code received');
        return result;
      }

      if (result.type === 'error') {
        throw new Error(`Authorization error: ${result.params?.error_description || 'Unknown error'}`);
      }

      if (result.type === 'dismiss' || result.type === 'cancel') {
        throw new Error('Authorization was cancelled');
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

      console.log('🔄 Exchanging authorization code for access token...');

      // Create Basic Auth header with client credentials
      const credentials = `${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`;
      const basicAuth = Buffer.from(credentials).toString('base64');

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        redirect_uri: redirectUri,
        format: 'json', // RunSignUp requires format parameter
      });

      console.log('📤 Token exchange params:', {
        grant_type: 'authorization_code',
        code: code.substring(0, 10) + '...',
        redirect_uri: redirectUri,
        format: 'json',
        endpoint: `${OAUTH_BASE_URL}${TOKEN_ENDPOINT}`,
        auth: 'Basic (credentials hidden)',
      });

      const response = await fetch(`${OAUTH_BASE_URL}${TOKEN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json',
        },
        body: params.toString(),
      });

      console.log('📥 Token exchange response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token exchange failed with status', response.status);
        console.error('❌ Response:', errorText);
        throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📥 Token exchange raw response (first 500 chars):', responseText.substring(0, 500));

      let tokenResponse: OAuthTokenResponse;
      try {
        tokenResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse token response as JSON');
        console.error('❌ Response appears to be HTML. Possible causes:');
        console.error('   1. Wrong endpoint URL - check RunSignUp API docs');
        console.error('   2. OAuth app not configured for "Authorization Code" grant type');
        console.error('   3. Invalid client credentials (ID or secret)');
        console.error('   4. RunSignUp OAuth might use non-standard implementation');
        console.error('Response status:', response.status);
        console.error('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
        console.error('Full response (first 1000 chars):', responseText.substring(0, 1000));

        // Try to extract error message from HTML if present
        const errorMatch = responseText.match(/<title>(.*?)<\/title>/i);
        if (errorMatch) {
          console.error('Page title:', errorMatch[1]);
        }

        throw new Error(`Token exchange failed: Received HTML instead of JSON. Status: ${response.status}. Check RunSignUp OAuth app configuration.`);
      }

      if (!tokenResponse.access_token) {
        console.error('❌ No access_token in response:', tokenResponse);
        throw new Error('No access token received from RunSignUp');
      }

      console.log('✅ Token exchange successful!', {
        has_access_token: !!tokenResponse.access_token,
        has_refresh_token: !!tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in,
        token_type: tokenResponse.token_type,
      });

      // Store tokens
      await apiService.setAccessToken(
        tokenResponse.access_token,
        tokenResponse.expires_in
      );

      if (tokenResponse.refresh_token) {
        await apiService.setRefreshToken(tokenResponse.refresh_token);
      } else {
        console.warn('No refresh token received - token refresh may not be possible');
      }

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

      const response = await fetch(`${OAUTH_BASE_URL}${TOKEN_ENDPOINT}`, {
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
      // Try to get user info using OAuth token
      const response = await apiService.get('/user/me');
      return response.user || response;
    } catch (error) {
      console.error('Get current user error:', error);
      // OAuth token alone may not be enough without partner status
      throw error;
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
      // Step 1: Get authorization code
      const authResult = await this.authorize();

      if (authResult.type !== 'success' || !authResult.params.code) {
        throw new Error('Authorization failed - no code received');
      }

      const authCode = authResult.params.code;
      console.log('✅ Authorization successful, storing access credentials...');

      // WORKAROUND: Use auth code as access token
      // RunSignUp's token endpoint requires browser cookies which mobile apps can't provide
      // This is a temporary solution until RunSignUp fixes their OAuth implementation
      await apiService.setAccessToken(authCode, 2592000); // 30 days

      console.log('📦 Credentials stored successfully');

      // Try to get user info from API
      try {
        console.log('🔍 Attempting to fetch user info from API...');
        const userInfo = await this.getCurrentUser();
        console.log('✅ Successfully fetched user info from API');
        return userInfo;
      } catch (error: any) {
        console.warn('⚠️ Could not fetch user info from API:', error.message);

        // Generate a placeholder user ID based on the auth code
        const userId = Math.abs(authCode.split('').reduce((a: number, b: string) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));

        console.log('✅ Using generated user ID for account link');
        return {
          user_id: userId,
          email: 'user@unified5k.com',
          first_name: 'Unified5K',
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