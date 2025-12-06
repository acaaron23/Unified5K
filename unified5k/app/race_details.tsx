import React, { useEffect, useState } from "react";
import { Button, Image, View, ActivityIndicator, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Descriptor from "@/components/descriptor";
import DonationBar from "@/components/donationBar";
import ImageCarousel from "@/components/imageCarousel";
import Header from "@/components/Header";
import { raceService, photoService, type Race, type RacePhoto } from "@/services/runsignup";

import "./global.css";

export default function RaceDetails() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  const router = useRouter();
  const [race, setRace] = useState<Race | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaceDetails = async () => {
      if (!raceId) {
        console.error('[RaceDetails] No raceId provided');
        setError('No race ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const raceIdNum = Number(raceId);
        console.log(`[RaceDetails] Fetching details for race ${raceIdNum} (type: ${typeof raceId}, value: "${raceId}")`);

        // Fetch race details
        const raceDetails = await raceService.getRaceDetails(raceIdNum, true);
        console.log(`[RaceDetails] Successfully loaded race: ${raceDetails.name}`);
        setRace(raceDetails);

        // Fetch race photos
        try {
          const photoResponse = await photoService.getRacePhotos(Number(raceId), {
            num: 15,
            page: 1,
          });

          if (photoResponse.photos && photoResponse.photos.length > 0) {
            const photoUrls = photoResponse.photos.map((photo: RacePhoto) =>
              photoService.getPhotoUrl(photo, 'large')
            );
            setPhotos(photoUrls);
            console.log(`[RaceDetails] Found ${photoUrls.length} photos`);
          } else {
            console.log(`[RaceDetails] No photos available for race ${raceId}`);
          }
        } catch (photoError) {
          console.log(`[RaceDetails] Could not load photos:`, photoError);
          // Don't fail the whole page if photos fail
        }

        setLoading(false);
      } catch (err: any) {
        console.error(`[RaceDetails] Error loading race:`, err);
        setError(err.message || 'Failed to load race details');
        setLoading(false);
      }
    };

    fetchRaceDetails();
  }, [raceId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00AEEF" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading race details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !race) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#DC2626', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            {error || 'Race not found'}
          </Text>
          <Text style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>
            Race ID: {raceId || 'Not provided'}
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
            This race may have been removed or is not available.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            color="#00AEEF"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Format date - handle MM/DD/YYYY format from API
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBA';

    try {
      // API returns dates in "MM/DD/YYYY" format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1; // Month is 0-indexed
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);

        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      // Fallback to standard parsing
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      return 'TBA';
    } catch {
      return 'TBA';
    }
  };

  // Get first event time if available
  const getEventTime = () => {
    if (race.events && race.events.length > 0) {
      const event = race.events[0];
      return event.start_time || '10:00 AM';
    }
    return '10:00 AM';
  };

  const location = `${race.address.city}, ${race.address.state}`;
  const date = formatDate(race.next_date);
  const time = getEventTime();

  // Get race image - use logo_url or banner_url from API, or fallback
  const getRaceImage = () => {
    if (race.logo_url) {
      return typeof race.logo_url === 'string'
        ? { uri: race.logo_url }
        : race.logo_url;
    }
    if (race.banner_url) {
      return typeof race.banner_url === 'string'
        ? { uri: race.banner_url }
        : race.banner_url;
    }
    return require('@/assets/images/raceimage1.jpg');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {photos.length > 0 ? (
            <View style={styles.carouselContainer}>
              <ImageCarousel imageResponse={photos} />
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Image
                source={getRaceImage()}
                style={styles.raceImage}
                resizeMode="cover"
              />
            </View>
          )}

          <Descriptor
            date={date}
            location={location}
            time={time}
          />

          <DonationBar currentAmount={8000} totalAmount={10000} />

          <TouchableOpacity
            style={styles.sponsorButton}
            onPress={() => router.push('/sponsor-tiers')}
          >
            <Text style={styles.sponsorButtonText}>Become a Sponsor/Vendor</Text>
          </TouchableOpacity>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => { }}
            >
              <Text style={styles.actionButtonText}>Participate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => { }}
            >
              <Text style={styles.actionButtonText}>Volunteer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  carouselContainer: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
  },
  raceImage: {
    width: '100%',
    height: '100%',
  },
  sponsorButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sponsorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
