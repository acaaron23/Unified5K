/**
 * RunSignUp Race Service
 * Handles race information and event management
 */

import { apiService } from './api.service';

export interface RaceAddress {
  street?: string;
  city: string;
  state: string;
  zipcode?: string;
  country_code?: string;
}

export interface RaceEvent {
  event_id: number;
  name: string;
  distance?: string;
  distance_unit?: string;
  start_time: string;
  registration_opens: string;
  registration_closes: string;
  online_registration_available: boolean;
  registration_available: boolean;
  max_registrations?: number;
  num_registrations?: number;
  price?: string;
  is_race_relevant?: boolean;
}

export interface Race {
  race_id: number;
  name: string;
  description?: string;
  url?: string;
  address: RaceAddress;
  next_date: string;
  last_date: string;
  last_end_date?: string;
  logo_url?: string;
  banner_url?: string;
  events?: RaceEvent[];
  is_registration_open?: boolean;
  is_searchable?: boolean;
  facebook_page_id?: string;
  twitter_handle?: string;
  contact_email?: string;
  contact_phone?: string;
  schedule_status?: 'live' | 'upcoming' | 'past';
  fundraising_goal?: number;
  fundraising_raised?: number;
  fundraising_enabled?: boolean;
}

export interface RaceListResponse {
  races: Race[];
  total_count?: number;
}

export interface RaceDetailResponse {
  race: Race;
}

export interface RaceParticipant {
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  registration_id: number;
  event_id: number;
  bib_num?: string;
  chip_num?: string;
  age: number;
  registration_date: string;
}

export interface RaceParticipantsResponse {
  participants: RaceParticipant[];
  total_count: number;
}

class RaceService {
  /**
   * Get list of races
   * @param options - Search and filter options
   */
  async getRaces(options?: {
    search?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    radius?: number; // miles
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    page?: number;
    resultsPerPage?: number;
    events?: boolean; // Include events in response
    sortDirection?: 'asc' | 'desc';
  }): Promise<RaceListResponse> {
    try {
      const params: Record<string, any> = {
        page: options?.page || 1,
        results_per_page: options?.resultsPerPage || 25,
        events: options?.events ? 'T' : 'F',
      };

      if (options?.search) params.search = options.search;
      if (options?.city) params.city = options.city;
      if (options?.state) params.state = options.state;
      if (options?.zipcode) params.zipcode = options.zipcode;
      if (options?.radius) params.radius = options.radius;
      if (options?.startDate) params.start_date = options.startDate;
      if (options?.endDate) params.end_date = options.endDate;
      if (options?.sortDirection) {
        // API expects full sort string like "date ASC" or "date DESC"
        params.sort = `date ${options.sortDirection.toUpperCase()}`;
      }

      const response = await apiService.get<any>(
        '/races',
        params
      );

      // Parse the response - each item has a nested 'race' object
      const races = response.races?.map((item: any) => item.race) || [];

      return {
        races,
        total_count: response.total_count || races.length
      };
    } catch (error) {
      console.error('Get races error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming races
   */
  async getUpcomingRaces(
    limit: number = 10,
    location?: { city?: string; state?: string; zipcode?: string; radius?: number }
  ): Promise<Race[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await this.getRaces({
        startDate: today,
        resultsPerPage: limit,
        events: true,
        sortDirection: 'asc',
        ...location,
      });

      return response.races || [];
    } catch (error) {
      console.error('Get upcoming races error:', error);
      throw error;
    }
  }

  /**
   * Get live/current races (happening today)
   */
  async getLiveRaces(limit: number = 10): Promise<Race[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await this.getRaces({
        startDate: today,
        endDate: today,
        resultsPerPage: limit,
        events: true,
      });

      return response.races || [];
    } catch (error) {
      console.error('Get live races error:', error);
      throw error;
    }
  }

  /**
   * Get past races
   */
  async getPastRaces(
    limit: number = 10,
    daysBack: number = 90
  ): Promise<Race[]> {
    try {
      const today = new Date();
      const pastDate = new Date(today.setDate(today.getDate() - daysBack));
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const response = await this.getRaces({
        startDate: pastDate.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
        resultsPerPage: limit,
        events: true,
        sortDirection: 'desc',
      });

      return response.races || [];
    } catch (error) {
      console.error('Get past races error:', error);
      throw error;
    }
  }

  /**
   * Get detailed race information
   */
  async getRaceDetails(raceId: number, includeEvents: boolean = true): Promise<Race> {
    try {
      const params = includeEvents ? { events: 'T' } : {};

      const response = await apiService.get<any>(
        `/race/${raceId}`,
        params
      );

      // Response has a nested structure: { race: { race: {...} } }
      return response.race?.race || response.race;
    } catch (error) {
      console.error('Get race details error:', error);
      throw error;
    }
  }

  /**
   * Get race participants
   */
  async getRaceParticipants(
    raceId: number,
    eventId?: number,
    options?: {
      page?: number;
      resultsPerPage?: number;
      search?: string;
      modifiedAfter?: number; // timestamp
    }
  ): Promise<RaceParticipantsResponse> {
    try {
      const params: Record<string, any> = {
        page: options?.page || 1,
        results_per_page: options?.resultsPerPage || 100,
      };

      if (eventId) params.event_id = eventId;
      if (options?.search) params.search = options.search;
      if (options?.modifiedAfter) {
        params.modified_after_timestamp = options.modifiedAfter;
      }

      const response = await apiService.get<RaceParticipantsResponse>(
        `/race/${raceId}/participants`,
        params
      );

      return response;
    } catch (error) {
      console.error('Get race participants error:', error);
      throw error;
    }
  }

  /**
   * Search races by name or location
   */
  async searchRaces(query: string, limit: number = 25): Promise<Race[]> {
    try {
      const response = await this.getRaces({
        search: query,
        resultsPerPage: limit,
        events: true,
      });

      return response.races || [];
    } catch (error) {
      console.error('Search races error:', error);
      throw error;
    }
  }

  /**
   * Get races near a location
   */
  async getRacesNearLocation(
    zipcode: string,
    radiusMiles: number = 50,
    limit: number = 25
  ): Promise<Race[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await this.getRaces({
        zipcode,
        radius: radiusMiles,
        startDate: today,
        resultsPerPage: limit,
        events: true,
        sortDirection: 'asc',
      });

      return response.races || [];
    } catch (error) {
      console.error('Get races near location error:', error);
      throw error;
    }
  }

  /**
   * Get race events
   */
  async getRaceEvents(raceId: number): Promise<RaceEvent[]> {
    try {
      const race = await this.getRaceDetails(raceId, true);
      return race.events || [];
    } catch (error) {
      console.error('Get race events error:', error);
      throw error;
    }
  }

  /**
   * Check if race registration is open
   */
  async isRegistrationOpen(raceId: number): Promise<boolean> {
    try {
      const race = await this.getRaceDetails(raceId, true);
      
      // Check if any event has open registration
      if (race.events && race.events.length > 0) {
        return race.events.some(
          event => event.online_registration_available && event.registration_available
        );
      }

      return race.is_registration_open || false;
    } catch (error) {
      console.error('Check registration open error:', error);
      return false;
    }
  }

  /**
   * Determine race schedule status (live, upcoming, past)
   */
  getRaceStatus(race: Race): 'live' | 'upcoming' | 'past' {
    if (!race.next_date || !race.last_date) {
      return 'upcoming'; // Default to upcoming if dates are missing
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Parse MM/DD/YYYY format dates from API
      const parseDate = (dateStr: string): Date => {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // MM/DD/YYYY format
          return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
        // Fallback to standard parsing
        return new Date(dateStr);
      };

      const nextDate = parseDate(race.next_date);
      nextDate.setHours(0, 0, 0, 0);

      const lastDate = parseDate(race.last_date);
      lastDate.setHours(0, 0, 0, 0);

      // Race is live if today is between next_date and last_date
      if (today >= nextDate && today <= lastDate) {
        return 'live';
      }

      // Race is upcoming if next_date is in the future
      if (today < nextDate) {
        return 'upcoming';
      }

      // Otherwise, race is past
      return 'past';
    } catch {
      return 'upcoming'; // Default to upcoming on error
    }
  }

  /**
   * Format race date for display
   */
  formatRaceDate(race: Race): string {
    try {
      if (!race.next_date) {
        return 'TBA';
      }

      // API returns dates in "MM/DD/YYYY" format
      // Extract month and day directly
      const dateParts = race.next_date.split('/');
      if (dateParts.length === 3) {
        const month = dateParts[0].padStart(2, '0');
        const day = dateParts[1].padStart(2, '0');
        return `${month}/${day}`;
      }

      // Fallback: try parsing as standard date
      const date = new Date(race.next_date);
      if (!isNaN(date.getTime())) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      }

      return 'TBA';
    } catch {
      return 'TBA';
    }
  }

  /**
   * Get race location string
   */
  getRaceLocation(race: Race): string {
    const parts = [];
    if (race.address) {
      if (race.address.city) parts.push(race.address.city);
      if (race.address.state) parts.push(race.address.state);
    }
    return parts.length > 0 ? parts.join(', ') : 'Location TBA';
  }
}

export const raceService = new RaceService();
export default raceService;