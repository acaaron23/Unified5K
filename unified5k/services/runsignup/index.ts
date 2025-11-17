/**
 * RunSignUp Services
 * Central export for all RunSignUp API services
 */

// Services
export { default as apiService } from './api.service';
export { default as oauth2Service } from './auth.service';
export { default as userService } from './user.service';
export { default as raceService } from './race.service';
export { default as registrationService } from './registration.service';
export { default as photoService } from './photo.service';

// Types - API Service
export type { ApiError, ApiResponse } from './api.service';

// Types - Auth Service
export type { OAuthTokenResponse, OAuthUser } from './auth.service';

// Types - User Service
export type {
  Address,
  RunSignUpUser,
  UserRegistration,
  RegistrationListResponse,
  UserInfoResponse,
} from './user.service';

// Types - Race Service
export type {
  RaceAddress,
  RaceEvent,
  Race,
  RaceListResponse,
  RaceDetailResponse,
  RaceParticipant,
  RaceParticipantsResponse,
} from './race.service';

// Types - Registration Service
export type {
  RegistrationRequest,
  RegistrationResponse,
  EventPricing,
  CustomQuestion,
  RegistrationFields,
} from './registration.service';

// Types - Photo Service
export type {
  PhotoImage,
  RacePhoto,
  PhotoAlbum,
  PhotosResponse,
  AlbumsResponse,
} from './photo.service';