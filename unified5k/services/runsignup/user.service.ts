/**
 * RunSignUp User Service
 * Handles user information and registration management
 */

import { apiService } from './api.service';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country_code: string;
}

export interface RunSignUpUser {
  user_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  address: Address;
  dob: string; // Format: YYYY-MM-DD
  gender: 'M' | 'F' | 'O';
  phone: string;
  profile_image_url?: string | null;
}

export interface UserRegistration {
  registration_id: number;
  event_id: number;
  race_id: number;
  race_name: string;
  event_name: string;
  user: RunSignUpUser;
  registration_date: string;
  bib_num?: string | null;
  chip_num?: string | null;
  age: number;
  team_id?: number | null;
  team_name?: string | null;
  last_modified: number;
  race_fee: string;
  status: 'active' | 'cancelled' | 'transferred';
  race_date?: string;
  race_location?: {
    city: string;
    state: string;
  };
}

export interface RegistrationListResponse {
  registrations: UserRegistration[];
  total_count: number;
}

export interface UserInfoResponse {
  user: RunSignUpUser;
}

class UserService {
  /**
   * Get user information by user ID
   */
  async getUserInfo(userId: number): Promise<RunSignUpUser> {
    try {
      const response = await apiService.get<UserInfoResponse>(
        `/rest/user/${userId}.json`
      );
      return response.user;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  /**
   * Get all registrations for a user
   * @param userId - RunSignUp user ID
   * @param options - Optional filters
   */
  async getUserRegistrations(
    userId: number,
    options?: {
      includeUpcoming?: boolean;
      includePast?: boolean;
      page?: number;
      resultsPerPage?: number;
    }
  ): Promise<RegistrationListResponse> {
    try {
      const params: Record<string, any> = {
        page: options?.page || 1,
        results_per_page: options?.resultsPerPage || 25,
      };

      // Filter by date if specified
      const now = new Date().toISOString().split('T')[0];
      
      if (options?.includeUpcoming === true && options?.includePast === false) {
        params.start_date = now;
      } else if (options?.includePast === true && options?.includeUpcoming === false) {
        params.end_date = now;
      }

      const response = await apiService.get<RegistrationListResponse>(
        `/rest/user/${userId}/registrations.json`,
        params
      );

      return response;
    } catch (error) {
      console.error('Get user registrations error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming registrations for a user
   */
  async getUpcomingRegistrations(
    userId: number,
    limit: number = 10
  ): Promise<UserRegistration[]> {
    try {
      const response = await this.getUserRegistrations(userId, {
        includeUpcoming: true,
        includePast: false,
        resultsPerPage: limit,
      });

      // Sort by race date ascending (earliest first)
      const registrations = response.registrations || [];
      return registrations.sort((a, b) => {
        const dateA = a.race_date ? new Date(a.race_date).getTime() : 0;
        const dateB = b.race_date ? new Date(b.race_date).getTime() : 0;
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Get upcoming registrations error:', error);
      throw error;
    }
  }

  /**
   * Get past registrations for a user
   */
  async getPastRegistrations(
    userId: number,
    limit: number = 10
  ): Promise<UserRegistration[]> {
    try {
      const response = await this.getUserRegistrations(userId, {
        includeUpcoming: false,
        includePast: true,
        resultsPerPage: limit,
      });

      // Sort by race date descending (most recent first)
      const registrations = response.registrations || [];
      return registrations.sort((a, b) => {
        const dateA = a.race_date ? new Date(a.race_date).getTime() : 0;
        const dateB = b.race_date ? new Date(b.race_date).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Get past registrations error:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * Note: This requires proper authentication and permissions
   */
  async updateUserInfo(
    userId: number,
    updates: Partial<Omit<RunSignUpUser, 'user_id'>>
  ): Promise<RunSignUpUser> {
    try {
      const response = await apiService.post<UserInfoResponse>(
        `/rest/user/${userId}.json`,
        updates
      );
      return response.user;
    } catch (error) {
      console.error('Update user info error:', error);
      throw error;
    }
  }

  /**
   * Search for a user by email
   * Useful for linking Clerk users to RunSignUp accounts
   */
  async searchUserByEmail(email: string): Promise<RunSignUpUser | null> {
    try {
      const response = await apiService.get<{ users: RunSignUpUser[] }>(
        '/rest/users/search.json',
        { email }
      );

      if (response.users && response.users.length > 0) {
        return response.users[0];
      }

      return null;
    } catch (error) {
      console.error('Search user by email error:', error);
      return null;
    }
  }

  /**
   * Get registration details by registration ID
   */
  async getRegistrationDetails(
    raceId: number,
    registrationId: number
  ): Promise<UserRegistration> {
    try {
      const response = await apiService.get<{ registration: UserRegistration }>(
        `/rest/race/${raceId}/registration/${registrationId}.json`
      );
      return response.registration;
    } catch (error) {
      console.error('Get registration details error:', error);
      throw error;
    }
  }

  /**
   * Cancel a registration
   * Note: This may require special permissions
   */
  async cancelRegistration(
    raceId: number,
    registrationId: number,
    reason?: string
  ): Promise<boolean> {
    try {
      await apiService.post(
        `/rest/race/${raceId}/registration/${registrationId}/cancel.json`,
        { reason }
      );
      return true;
    } catch (error) {
      console.error('Cancel registration error:', error);
      throw error;
    }
  }

  /**
   * Transfer a registration to another event
   */
  async transferRegistration(
    raceId: number,
    registrationId: number,
    targetEventId: number
  ): Promise<UserRegistration> {
    try {
      const response = await apiService.post<{ registration: UserRegistration }>(
        `/rest/race/${raceId}/switch-participant-events.json`,
        {
          registration_id: registrationId,
          event_id: targetEventId,
        }
      );
      return response.registration;
    } catch (error) {
      console.error('Transfer registration error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;