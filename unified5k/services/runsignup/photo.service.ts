/**
 * RunSignUp Photo Service
 * Handles race photos and albums
 */

import { apiService } from './api.service';

export interface PhotoImage {
  image_url: string;
  height: number;
  width: number;
}

export interface RacePhoto {
  photo_id: number;
  album_id: number;
  race_event_days_id: number;
  bibs: number[]; // Bib numbers associated with photo
  original: PhotoImage;
  thumbnail: PhotoImage;
  large: PhotoImage;
  uploaded_filename: string;
  uploaded_ts: number; // Unix timestamp
  photographer_name?: string;
  caption?: string;
}

export interface PhotoAlbum {
  album_id: number;
  album_name: string;
  race_id: number;
  race_event_days_id: number;
  photo_count: number;
  created_date: string;
  is_public: boolean;
  cover_photo?: RacePhoto;
}

export interface PhotosResponse {
  photos: RacePhoto[];
  total_count: number;
}

export interface AlbumsResponse {
  albums: PhotoAlbum[];
  total_count: number;
}

class PhotoService {
  /**
   * Get all photos for a race
   */
  async getRacePhotos(
    raceId: number,
    options?: {
      albumId?: number;
      raceEventDaysId?: number;
      page?: number;
      num?: number; // Photos per page
      uploadedSince?: number; // Unix timestamp
      includeParticipantUploads?: boolean;
    }
  ): Promise<PhotosResponse> {
    try {
      const params: Record<string, any> = {
        race_id: raceId,
        page: options?.page || 1,
        num: options?.num || 100,
        include_participant_uploads: options?.includeParticipantUploads !== false ? 'T' : 'F',
      };

      if (options?.albumId) {
        params.generic_photo_album_id = options.albumId;
      }
      
      if (options?.raceEventDaysId) {
        params.race_event_days_id = options.raceEventDaysId;
      }

      if (options?.uploadedSince) {
        params.uploaded_since_timestamp = options.uploadedSince;
      }

      const response = await apiService.get<PhotosResponse>(
        '/rest/v2/photos/get-race-photos.json',
        params
      );

      return response;
    } catch (error) {
      console.error('Get race photos error:', error);
      throw error;
    }
  }

  /**
   * Get photos for a specific album
   */
  async getAlbumPhotos(
    raceId: number,
    albumId: number,
    page: number = 1,
    perPage: number = 50
  ): Promise<RacePhoto[]> {
    try {
      const response = await this.getRacePhotos(raceId, {
        albumId,
        page,
        num: perPage,
      });

      return response.photos || [];
    } catch (error) {
      console.error('Get album photos error:', error);
      throw error;
    }
  }

  /**
   * Get all albums for a race
   */
  async getRaceAlbums(raceId: number): Promise<PhotoAlbum[]> {
    try {
      const response = await apiService.get<AlbumsResponse>(
        `/rest/race/${raceId}/photo-albums.json`
      );

      return response.albums || [];
    } catch (error) {
      console.error('Get race albums error:', error);
      // Return empty array if albums endpoint doesn't exist
      return [];
    }
  }

  /**
   * Get photos by bib number
   */
  async getPhotosByBib(
    raceId: number,
    bibNumber: number,
    page: number = 1
  ): Promise<RacePhoto[]> {
    try {
      const response = await apiService.get<PhotosResponse>(
        '/rest/v2/photos/get-race-photos.json',
        {
          race_id: raceId,
          bib_num: bibNumber,
          page,
          num: 100,
        }
      );

      return response.photos || [];
    } catch (error) {
      console.error('Get photos by bib error:', error);
      return [];
    }
  }

  /**
   * Search photos by participant
   */
  async searchPhotosByParticipant(
    raceId: number,
    firstName: string,
    lastName: string
  ): Promise<RacePhoto[]> {
    try {
      // First, find the participant's bib number
      const participantsResponse = await apiService.get(
        `/rest/race/${raceId}/participants.json`,
        {
          search: `${firstName} ${lastName}`,
          results_per_page: 1,
        }
      );

      if (participantsResponse.participants?.length > 0) {
        const participant = participantsResponse.participants[0];
        
        if (participant.bib_num) {
          return await this.getPhotosByBib(raceId, parseInt(participant.bib_num));
        }
      }

      return [];
    } catch (error) {
      console.error('Search photos by participant error:', error);
      return [];
    }
  }

  /**
   * Get recent photos from multiple races
   * Useful for a media feed
   */
  async getRecentPhotos(
    raceIds: number[],
    limit: number = 20
  ): Promise<RacePhoto[]> {
    try {
      const allPhotos: RacePhoto[] = [];

      // Fetch photos from each race
      for (const raceId of raceIds) {
        try {
          const response = await this.getRacePhotos(raceId, {
            num: Math.ceil(limit / raceIds.length),
          });

          allPhotos.push(...response.photos);
        } catch (error) {
          console.warn(`Failed to fetch photos for race ${raceId}:`, error);
        }
      }

      // Sort by upload timestamp (most recent first)
      allPhotos.sort((a, b) => b.uploaded_ts - a.uploaded_ts);

      // Return only the requested number
      return allPhotos.slice(0, limit);
    } catch (error) {
      console.error('Get recent photos error:', error);
      return [];
    }
  }

  /**
   * Get photo details
   */
  async getPhotoDetails(photoId: number): Promise<RacePhoto | null> {
    try {
      const response = await apiService.get<{ photo: RacePhoto }>(
        `/rest/v2/photos/${photoId}.json`
      );

      return response.photo;
    } catch (error) {
      console.error('Get photo details error:', error);
      return null;
    }
  }

  /**
   * Upload photo (requires authentication)
   * Note: This is typically done through the web interface
   * but can be implemented for user-submitted photos
   */
  async uploadPhoto(
    raceId: number,
    albumId: number,
    photoData: {
      imageUri: string;
      bibNumbers?: number[];
      caption?: string;
      photographerName?: string;
    }
  ): Promise<RacePhoto> {
    try {
      const formData = new FormData();
      
      // Add image file
      formData.append('photo', {
        uri: photoData.imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // Add metadata
      formData.append('album_id', albumId.toString());
      
      if (photoData.bibNumbers) {
        formData.append('bib_numbers', photoData.bibNumbers.join(','));
      }
      
      if (photoData.caption) {
        formData.append('caption', photoData.caption);
      }
      
      if (photoData.photographerName) {
        formData.append('photographer_name', photoData.photographerName);
      }

      const response = await apiService.post<{ photo: RacePhoto }>(
        `/rest/race/${raceId}/photo/upload.json`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.photo;
    } catch (error) {
      console.error('Upload photo error:', error);
      throw error;
    }
  }

  /**
   * Get photo URL (optimized for display)
   * Returns appropriate image size based on usage
   */
  getPhotoUrl(
    photo: RacePhoto,
    size: 'thumbnail' | 'large' | 'original' = 'large'
  ): string {
    switch (size) {
      case 'thumbnail':
        return photo.thumbnail.image_url;
      case 'large':
        return photo.large.image_url;
      case 'original':
        return photo.original.image_url;
      default:
        return photo.large.image_url;
    }
  }

  /**
   * Format photo upload date
   */
  formatPhotoDate(photo: RacePhoto): string {
    const date = new Date(photo.uploaded_ts * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Group photos by album
   */
  groupPhotosByAlbum(photos: RacePhoto[]): Map<number, RacePhoto[]> {
    const grouped = new Map<number, RacePhoto[]>();

    photos.forEach(photo => {
      const existing = grouped.get(photo.album_id) || [];
      existing.push(photo);
      grouped.set(photo.album_id, existing);
    });

    return grouped;
  }

  /**
   * Get album cover photo
   */
  getAlbumCoverPhoto(album: PhotoAlbum): string | null {
    return album.cover_photo ? this.getPhotoUrl(album.cover_photo, 'thumbnail') : null;
  }

  /**
   * Check if photos are available for a race
   */
  async hasPhotos(raceId: number): Promise<boolean> {
    try {
      const response = await this.getRacePhotos(raceId, {
        num: 1,
        page: 1,
      });

      return response.total_count > 0;
    } catch (error) {
      console.error('Check has photos error:', error);
      return false;
    }
  }

  /**
   * Get photo statistics for a race
   */
  async getPhotoStats(raceId: number): Promise<{
    total_photos: number;
    total_albums: number;
    recent_upload_count: number; // Last 7 days
  }> {
    try {
      const [photosResponse, albums] = await Promise.all([
        this.getRacePhotos(raceId, { num: 1 }),
        this.getRaceAlbums(raceId),
      ]);

      // Get recent uploads (last 7 days)
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
      const recentResponse = await this.getRacePhotos(raceId, {
        uploadedSince: sevenDaysAgo,
        num: 1,
      });

      return {
        total_photos: photosResponse.total_count,
        total_albums: albums.length,
        recent_upload_count: recentResponse.total_count,
      };
    } catch (error) {
      console.error('Get photo stats error:', error);
      return {
        total_photos: 0,
        total_albums: 0,
        recent_upload_count: 0,
      };
    }
  }
}

export const photoService = new PhotoService();
export default photoService;