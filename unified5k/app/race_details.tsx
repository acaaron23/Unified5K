import React, { useEffect, useState } from "react";
import { Button, Image, View, ActivityIndicator, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";

import Descriptor from "@/components/descriptor";
import DonationBar from "@/components/donationBar";
import ImageCarousel from "@/components/imageCarousel";
import Header from "@/components/Header";
import { raceService, photoService, type Race, type RacePhoto } from "@/services/runsignup";
import { useRunSignUp } from "@/hooks/useRunSignUp";

import "./global.css";

export default function RaceDetails() {
  const { raceId } = useLocalSearchParams<{ raceId: string }>();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { isLinked, runSignUpUser, registerForRace, isLoading: runSignUpLoading } = useRunSignUp();

  const [race, setRace] = useState<Race | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

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
        console.log(`[RaceDetails] Fundraising data:`, {
          enabled: raceDetails.fundraising_enabled,
          goal: raceDetails.fundraising_goal,
          raised: raceDetails.fundraising_raised,
        });
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

  // Handle Participate button press
  const handleParticipate = async () => {
    console.log('[RaceDetails] Participate button pressed');
    console.log('[RaceDetails] Auth state check:', {
      isSignedIn,
      isLinked,
      hasRunSignUpUser: !!runSignUpUser,
      runSignUpLoading,
    });

    // Check if user is signed in
    if (!isSignedIn) {
      console.log('[RaceDetails] User not signed in');
      Alert.alert(
        'Sign In Required',
        'You need to sign in to register for this race.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }

    // Check if RunSignUp account is linked
    if (!isLinked) {
      console.log('[RaceDetails] RunSignUp account not linked. isLinked:', isLinked);
      Alert.alert(
        'Link RunSignUp Account',
        'You need to link your RunSignUp account to register for races. Go to your profile to link your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/profile') }
        ]
      );
      return;
    }

    console.log('[RaceDetails] RunSignUp user data:', {
      user: runSignUpUser,
      hasFirstName: !!runSignUpUser?.first_name,
      hasLastName: !!runSignUpUser?.last_name,
      hasEmail: !!runSignUpUser?.email,
    });

    // Check if race has events
    if (!race?.events || race.events.length === 0) {
      console.log('[RaceDetails] No events available for race');
      Alert.alert('No Events Available', 'This race has no events available for registration.');
      return;
    }

    // For now, register for the first event (we can add event selection later)
    const eventId = race.events[0].event_id;
    console.log('[RaceDetails] Attempting registration:', {
      raceId,
      eventId,
      raceName: race.name,
    });

    try {
      setRegistering(true);

      // Use RunSignUp user data if available, otherwise fallback to Clerk user data
      const firstName = runSignUpUser?.first_name || user?.firstName || '';
      const lastName = runSignUpUser?.last_name || user?.lastName || '';
      const email = runSignUpUser?.email || user?.primaryEmailAddress?.emailAddress || '';

      console.log('[RaceDetails] Using user data:', {
        source: runSignUpUser ? 'RunSignUp' : 'Clerk',
        firstName,
        lastName,
        email,
      });

      if (!firstName || !lastName || !email) {
        Alert.alert(
          'Missing Information',
          'Your profile is missing required information (name or email). Please update your profile and try again.'
        );
        setRegistering(false);
        return;
      }

      const registrationData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        dob: runSignUpUser?.dob || '1990-01-01',
        gender: runSignUpUser?.gender || 'O',
        event_id: eventId,
      };

      console.log('[RaceDetails] Registration data:', registrationData);

      // Register for the race
      await registerForRace(Number(raceId), eventId, registrationData);

      console.log('[RaceDetails] Registration successful!');
      Alert.alert(
        'Registration Successful!',
        'You have been registered for this race. Check your profile to view your registration.',
        [
          { text: 'View Profile', onPress: () => router.push('/profile') },
          { text: 'OK' }
        ]
      );
    } catch (error: any) {
      console.error('[RaceDetails] Registration error:', error);
      console.error('[RaceDetails] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      Alert.alert(
        'Registration Failed',
        error.message || 'Failed to register for this race. Please try again.'
      );
    } finally {
      setRegistering(false);
    }
  };

  // Handle Volunteer button press
  const handleVolunteer = async () => {
    // Check if user is signed in
    if (!isSignedIn) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to volunteer for this race.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }

    // Check if RunSignUp account is linked
    if (!isLinked) {
      Alert.alert(
        'Link RunSignUp Account',
        'You need to link your RunSignUp account to volunteer for races. Go to your profile to link your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/profile') }
        ]
      );
      return;
    }

    // Show volunteer signup info
    Alert.alert(
      'Volunteer Signup',
      'Volunteer registration will open your email client to contact the race organizers. Would you like to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Organizers',
          onPress: () => {
            // TODO: Add email functionality to contact race organizers
            // For now, show a message
            Alert.alert(
              'Coming Soon',
              'Volunteer registration is coming soon! For now, please visit the race website or contact the organizers directly.'
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ position: 'relative' }}>
        <Header />
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 16,
            top: 8,
            padding: 8,
            zIndex: 10,
          }}
          onPress={() => router.push('/')}
        >
          <Ionicons name="close" size={32} color="#000" />
        </TouchableOpacity>
      </View>

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

          {/* Show donation bar only if fundraising data is available */}
          {race.fundraising_enabled !== false && (
            <DonationBar
              currentAmount={race.fundraising_raised || 0}
              totalAmount={race.fundraising_goal || 10000}
            />
          )}

          <TouchableOpacity
            style={styles.sponsorButton}
            onPress={() => router.push(`/sponsor-tiers?returnTo=race&raceId=${raceId}`)}
          >
            <Text style={styles.sponsorButtonText}>Become a Sponsor/Vendor</Text>
          </TouchableOpacity>

          {/* Add spacing for floating buttons */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Floating action buttons */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity
          style={[styles.floatingButton, (registering || runSignUpLoading) && styles.floatingButtonDisabled]}
          onPress={handleParticipate}
          disabled={registering || runSignUpLoading}
        >
          {registering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.floatingButtonText}>Participate</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingButton, runSignUpLoading && styles.floatingButtonDisabled]}
          onPress={handleVolunteer}
          disabled={runSignUpLoading}
        >
          <Text style={styles.floatingButtonText}>Volunteer</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#DAF6FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sponsorButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButton: {
    backgroundColor: '#1BA8D8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
  },
  floatingButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
