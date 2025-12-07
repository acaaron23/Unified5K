/**
 * useRunSignUp Hook
 * Custom React hook for integrating RunSignUp with Clerk authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import {
  oauth2Service,
  userService,
  raceService,
  registrationService,
  photoService,
  type RunSignUpUser,
  type UserRegistration,
  type Race,
} from '../services/runsignup';

export interface RunSignUpState {
  // Authentication state
  isLinked: boolean;
  isLoading: boolean;
  error: string | null;
  adminInfo: string | null; // Info message for admins only

  // User data
  runSignUpUser: RunSignUpUser | null;
  runSignUpUserId: number | null;

  // Registrations
  upcomingRegistrations: UserRegistration[];
  pastRegistrations: UserRegistration[];

  // Races
  nearbyRaces: Race[];
}

export interface RunSignUpActions {
  // Authentication
  linkAccount: () => Promise<void>;
  unlinkAccount: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // User data
  fetchUserInfo: () => Promise<void>;
  fetchRegistrations: () => Promise<void>;

  // Races
  fetchNearbyRaces: (zipcode?: string, radius?: number) => Promise<void>;
  searchRaces: (query: string) => Promise<Race[]>;

  // Registration
  registerForRace: (raceId: number, eventId: number, data: any) => Promise<void>;
}

export function useRunSignUp() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  // State
  const [state, setState] = useState<RunSignUpState>({
    isLinked: false,
    isLoading: false,
    error: null,
    adminInfo: null,
    runSignUpUser: null,
    runSignUpUserId: null,
    upcomingRegistrations: [],
    pastRegistrations: [],
    nearbyRaces: [],
  });

  /**
   * Check if user is linked to RunSignUp
   */
  const checkLinkStatus = useCallback(async () => {
    if (!user) return;

    try {
      const metadata = user.unsafeMetadata as any;
      const runSignUpUserId = metadata?.runSignUpUserId;

      console.log('[useRunSignUp] Checking link status:', {
        hasUser: !!user,
        metadata,
        runSignUpUserId,
      });

      if (runSignUpUserId) {
        console.log('[useRunSignUp] User is linked, userId:', runSignUpUserId);
        setState(prev => ({
          ...prev,
          isLinked: true,
          runSignUpUserId,
        }));

        // Fetch user info
        await fetchUserInfo(runSignUpUserId);
      } else {
        console.log('[useRunSignUp] User is not linked (no runSignUpUserId in metadata)');
      }
    } catch (error) {
      console.error('[useRunSignUp] Check link status error:', error);
    }
  }, [user]);

  /**
   * Link Clerk account to RunSignUp
   */
  const linkAccount = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'No user logged in' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Start OAuth flow - returns basic user info
      const oauthUser = await oauth2Service.completeOAuthFlow();

      // Update Clerk user metadata using unsafeMetadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          runSignUpUserId: oauthUser.user_id,
          runSignUpEmail: oauthUser.email,
        },
      });

      // Update state with user ID first
      setState(prev => ({
        ...prev,
        isLinked: true,
        runSignUpUserId: oauthUser.user_id,
        runSignUpUser: null, // Will be populated when we fetch detailed user info
        isLoading: false,
      }));

      // Only try to fetch detailed info if we have a real user ID (not placeholder)
      if (oauthUser.user_id > 1) {
        try {
          // Fetch full user info
          const fullUserInfo = await userService.getUserInfo(oauthUser.user_id);

          setState(prev => ({
            ...prev,
            runSignUpUser: fullUserInfo,
          }));

          // Fetch registrations
          await fetchRegistrations(oauthUser.user_id);
        } catch (error: any) {
          console.warn('Could not fetch detailed user info:', error.message);
          // Keep the basic OAuth user info we already have
        }
      } else {
        // Placeholder user - don't show any message to regular users
        // Admins can check adminInfo field if needed
        setState(prev => ({
          ...prev,
          adminInfo: 'Full API access requires RunSignUp partner/affiliate credentials.',
        }));
      }
    } catch (error: any) {
      console.error('Link account error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to link account',
      }));
    }
  }, [user]);

  /**
   * Unlink RunSignUp account
   */
  const unlinkAccount = useCallback(async () => {
    if (!user) return;

    try {
      // Clear OAuth tokens
      await oauth2Service.logout();

      // Update Clerk metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          runSignUpUserId: null,
          runSignUpEmail: null,
        },
      });

      setState(prev => ({
        ...prev,
        isLinked: false,
        runSignUpUser: null,
        runSignUpUserId: null,
        upcomingRegistrations: [],
        pastRegistrations: [],
      }));
    } catch (error) {
      console.error('Unlink account error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to unlink account',
      }));
    }
  }, [user]);

  /**
   * Refresh OAuth token
   */
  const refreshToken = useCallback(async () => {
    try {
      await oauth2Service.refreshToken();
    } catch (error) {
      console.error('Refresh token error:', error);
      // Token refresh failed, might need to re-authenticate
      setState(prev => ({
        ...prev,
        error: 'Session expired. Please link your account again.',
      }));
    }
  }, []);

  /**
   * Fetch user info from RunSignUp
   */
  const fetchUserInfo = useCallback(async (userId?: number) => {
    const targetUserId = userId || state.runSignUpUserId;
    if (!targetUserId) return;

    try {
      const userInfo = await userService.getUserInfo(targetUserId);
      setState(prev => ({
        ...prev,
        runSignUpUser: userInfo,
      }));
    } catch (error) {
      console.error('Fetch user info error:', error);
    }
  }, [state.runSignUpUserId]);

  /**
   * Fetch user registrations
   */
  const fetchRegistrations = useCallback(async (userId?: number) => {
    const targetUserId = userId || state.runSignUpUserId;

    // Don't attempt to fetch if no user ID or if it's the placeholder user
    if (!targetUserId || targetUserId <= 1) {
      console.log('Skipping registration fetch - no valid user ID');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const [upcoming, past] = await Promise.all([
        userService.getUpcomingRegistrations(targetUserId),
        userService.getPastRegistrations(targetUserId),
      ]);

      setState(prev => ({
        ...prev,
        upcomingRegistrations: upcoming,
        pastRegistrations: past,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Fetch registrations error:', error);

      // Check if it's an API key error
      if (error.message?.includes('Key authentication failed') || error.message?.includes('API Error 6')) {
        console.warn('Cannot fetch registrations: API keys required (partner/affiliate access)');
        // Don't show error to regular users - just log it
        setState(prev => ({
          ...prev,
          isLoading: false,
          adminInfo: 'Full API access requires RunSignUp partner status.',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch registrations',
        }));
      }
    }
  }, [state.runSignUpUserId]);

  /**
   * Fetch nearby races
   */
  const fetchNearbyRaces = useCallback(async (
    zipcode?: string,
    radius: number = 50
  ) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Use user's zipcode if available and not specified
      const userZipcode = zipcode || state.runSignUpUser?.address?.zipcode;
      
      const races = userZipcode
        ? await raceService.getRacesNearLocation(userZipcode, radius)
        : await raceService.getUpcomingRaces();

      setState(prev => ({
        ...prev,
        nearbyRaces: races,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Fetch nearby races error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch races',
      }));
    }
  }, [state.runSignUpUser]);

  /**
   * Search races
   */
  const searchRaces = useCallback(async (query: string): Promise<Race[]> => {
    try {
      return await raceService.searchRaces(query);
    } catch (error) {
      console.error('Search races error:', error);
      return [];
    }
  }, []);

  /**
   * Register for a race
   */
  const registerForRace = useCallback(async (
    raceId: number,
    eventId: number,
    registrationData: any
  ) => {
    console.log('[useRunSignUp] registerForRace called:', {
      raceId,
      eventId,
      isLinked: state.isLinked,
      hasRunSignUpUser: !!state.runSignUpUser,
      runSignUpUserId: state.runSignUpUserId,
    });

    if (!state.isLinked) {
      console.error('[useRunSignUp] Registration failed: User not linked to RunSignUp');
      throw new Error('User not linked to RunSignUp');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('[useRunSignUp] Calling registration service with data:', registrationData);

      await registrationService.registerForRace(raceId, {
        ...registrationData,
        event_id: eventId,
      });

      console.log('[useRunSignUp] Registration successful, refreshing registrations');

      // Refresh registrations
      await fetchRegistrations();

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      console.error('[useRunSignUp] Register for race error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to register for race',
      }));
      throw error;
    }
  }, [state.isLinked, state.runSignUpUser, state.runSignUpUserId, fetchRegistrations]);

  // Auto-check link status when user changes
  useEffect(() => {
    if (isSignedIn && user) {
      checkLinkStatus();
    }
  }, [isSignedIn, user, checkLinkStatus]);

  return {
    ...state,
    linkAccount,
    unlinkAccount,
    refreshToken,
    fetchUserInfo,
    fetchRegistrations,
    fetchNearbyRaces,
    searchRaces,
    registerForRace,
  };
}

export default useRunSignUp;