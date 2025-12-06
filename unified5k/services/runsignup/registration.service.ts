/**
 * RunSignUp Registration Service
 * Handles race registration and sign-ups
 */

import { apiService } from './api.service';
import { UserRegistration, Address } from './user.service';

export interface RegistrationRequest {
  // User information
  first_name: string;
  last_name: string;
  email: string;
  dob: string; // YYYY-MM-DD
  gender: 'M' | 'F' | 'O';
  
  // Contact information
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country_code?: string;
  };
  phone?: string;
  
  // Registration details
  event_id: number;
  
  // Optional fields
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  tshirt_size?: string;
  bib_number?: string;
  
  // Team information
  team_id?: number;
  team_name?: string;
  
  // Custom questions (race-specific)
  custom_questions?: Record<string, any>;
  
  // Payment information
  coupon_code?: string;
  donation_amount?: number;
  offline_payment?: boolean;
}

export interface RegistrationResponse {
  registration_id: number;
  registration: UserRegistration;
  transaction_id?: string;
  payment_required: boolean;
  payment_amount?: string;
  payment_url?: string; // URL to complete payment
}

export interface EventPricing {
  event_id: number;
  price: string;
  currency: string;
  early_bird_price?: string;
  early_bird_deadline?: string;
  available: boolean;
  max_registrations?: number;
  current_registrations: number;
}

export interface CustomQuestion {
  question_id: number;
  question: string;
  question_type: 'text' | 'dropdown' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[]; // For dropdown, checkbox, radio
}

export interface RegistrationFields {
  custom_questions: CustomQuestion[];
  require_emergency_contact: boolean;
  require_phone: boolean;
  require_address: boolean;
  tshirt_sizes_available?: string[];
}

class RegistrationService {
  /**
   * Get registration fields for an event
   */
  async getRegistrationFields(
    raceId: number,
    eventId: number
  ): Promise<RegistrationFields> {
    try {
      const response = await apiService.get<RegistrationFields>(
        `/race/${raceId}/event/${eventId}/registration-fields`
      );
      return response;
    } catch (error) {
      console.error('Get registration fields error:', error);
      throw error;
    }
  }

  /**
   * Get event pricing information
   */
  async getEventPricing(
    raceId: number,
    eventId: number
  ): Promise<EventPricing> {
    try {
      const response = await apiService.get<{ pricing: EventPricing }>(
        `/race/${raceId}/event/${eventId}/pricing`
      );
      return response.pricing;
    } catch (error) {
      console.error('Get event pricing error:', error);
      throw error;
    }
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(
    raceId: number,
    eventId: number,
    couponCode: string
  ): Promise<{
    valid: boolean;
    discount_amount?: string;
    discount_percentage?: number;
    message?: string;
  }> {
    try {
      const response = await apiService.get(
        `/race/${raceId}/event/${eventId}/validate-coupon`,
        { coupon_code: couponCode }
      );
      return response;
    } catch (error) {
      console.error('Validate coupon error:', error);
      return { valid: false, message: 'Invalid coupon code' };
    }
  }

  /**
   * Register a user for a race event
   */
  async registerForRace(
    raceId: number,
    registrationData: RegistrationRequest
  ): Promise<RegistrationResponse> {
    try {
      const response = await apiService.post<RegistrationResponse>(
        `/race/${raceId}/registration/add`,
        this.formatRegistrationData(registrationData)
      );

      return response;
    } catch (error) {
      console.error('Register for race error:', error);
      throw error;
    }
  }

  /**
   * Format registration data for API
   */
  private formatRegistrationData(data: RegistrationRequest): Record<string, any> {
    const formatted: Record<string, any> = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      dob: data.dob,
      gender: data.gender,
      event_id: data.event_id,
    };

    // Add optional address fields
    if (data.address) {
      if (data.address.street) formatted.address_street = data.address.street;
      if (data.address.city) formatted.address_city = data.address.city;
      if (data.address.state) formatted.address_state = data.address.state;
      if (data.address.zipcode) formatted.address_zipcode = data.address.zipcode;
      if (data.address.country_code) formatted.address_country = data.address.country_code;
    }

    // Add other optional fields
    if (data.phone) formatted.phone = data.phone;
    if (data.emergency_contact_name) {
      formatted.emergency_contact_name = data.emergency_contact_name;
    }
    if (data.emergency_contact_phone) {
      formatted.emergency_contact_phone = data.emergency_contact_phone;
    }
    if (data.tshirt_size) formatted.tshirt_size = data.tshirt_size;
    if (data.bib_number) formatted.bib_num = data.bib_number;
    
    // Team information
    if (data.team_id) formatted.team_id = data.team_id;
    if (data.team_name) formatted.team_name = data.team_name;
    
    // Payment information
    if (data.coupon_code) formatted.coupon_code = data.coupon_code;
    if (data.donation_amount) formatted.donation_amount = data.donation_amount;
    if (data.offline_payment) formatted.offline_payment = 'T';

    // Custom questions
    if (data.custom_questions) {
      Object.entries(data.custom_questions).forEach(([key, value]) => {
        formatted[key] = value;
      });
    }

    return formatted;
  }

  /**
   * Update an existing registration
   */
  async updateRegistration(
    raceId: number,
    registrationId: number,
    updates: Partial<RegistrationRequest>
  ): Promise<UserRegistration> {
    try {
      const response = await apiService.post<{ registration: UserRegistration }>(
        `/race/${raceId}/registration/${registrationId}/update`,
        this.formatRegistrationData(updates as RegistrationRequest)
      );
      return response.registration;
    } catch (error) {
      console.error('Update registration error:', error);
      throw error;
    }
  }

  /**
   * Check registration availability
   */
  async checkAvailability(
    raceId: number,
    eventId: number
  ): Promise<{
    available: boolean;
    spots_remaining?: number;
    waitlist_available?: boolean;
  }> {
    try {
      const response = await apiService.get(
        `/race/${raceId}/event/${eventId}/availability`
      );
      return response;
    } catch (error) {
      console.error('Check availability error:', error);
      return { available: false };
    }
  }

  /**
   * Get registration status
   */
  async getRegistrationStatus(
    raceId: number,
    registrationId: number
  ): Promise<{
    status: 'active' | 'cancelled' | 'transferred' | 'pending_payment';
    payment_status: 'paid' | 'unpaid' | 'partial' | 'refunded';
    payment_url?: string;
  }> {
    try {
      const response = await apiService.get(
        `/race/${raceId}/registration/${registrationId}/status`
      );
      return response;
    } catch (error) {
      console.error('Get registration status error:', error);
      throw error;
    }
  }

  /**
   * Add participant to waitlist
   */
  async addToWaitlist(
    raceId: number,
    eventId: number,
    userData: {
      first_name: string;
      last_name: string;
      email: string;
    }
  ): Promise<{
    waitlist_id: number;
    position: number;
  }> {
    try {
      const response = await apiService.post(
        `/race/${raceId}/event/${eventId}/waitlist/add`,
        userData
      );
      return response;
    } catch (error) {
      console.error('Add to waitlist error:', error);
      throw error;
    }
  }

  /**
   * Get available t-shirt sizes
   */
  async getTShirtSizes(raceId: number): Promise<string[]> {
    try {
      const response = await apiService.get<{ sizes: string[] }>(
        `/race/${raceId}/tshirt-sizes`
      );
      return response.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    } catch (error) {
      console.warn('Get t-shirt sizes error, using defaults:', error);
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  }

  /**
   * Calculate total registration cost
   */
  async calculateCost(
    raceId: number,
    eventId: number,
    options: {
      couponCode?: string;
      donationAmount?: number;
      processingFeePaidByUser?: boolean;
    } = {}
  ): Promise<{
    base_price: string;
    discount: string;
    donation: string;
    processing_fee: string;
    total: string;
  }> {
    try {
      const params: Record<string, any> = {
        event_id: eventId,
      };

      if (options.couponCode) params.coupon_code = options.couponCode;
      if (options.donationAmount) params.donation_amount = options.donationAmount;
      if (options.processingFeePaidByUser !== undefined) {
        params.processing_fee_paid_by_user = options.processingFeePaidByUser ? 'T' : 'F';
      }

      const response = await apiService.get(
        `/race/${raceId}/calculate-cost`,
        params
      );
      return response;
    } catch (error) {
      console.error('Calculate cost error:', error);
      throw error;
    }
  }

  /**
   * Submit payment for registration
   * Note: This would typically redirect to RunSignUp's payment page
   * or integrate with a payment processor
   */
  async getPaymentUrl(
    raceId: number,
    registrationId: number
  ): Promise<string> {
    try {
      const response = await apiService.get<{ payment_url: string }>(
        `/race/${raceId}/registration/${registrationId}/payment-url`
      );
      return response.payment_url;
    } catch (error) {
      console.error('Get payment URL error:', error);
      throw error;
    }
  }

  /**
   * Verify registration and user eligibility
   */
  async verifyEligibility(
    raceId: number,
    eventId: number,
    email: string
  ): Promise<{
    eligible: boolean;
    already_registered: boolean;
    message?: string;
  }> {
    try {
      const response = await apiService.get(
        `/race/${raceId}/event/${eventId}/verify-eligibility`,
        { email }
      );
      return response;
    } catch (error) {
      console.error('Verify eligibility error:', error);
      return {
        eligible: true,
        already_registered: false,
      };
    }
  }
}

export const registrationService = new RegistrationService();
export default registrationService;