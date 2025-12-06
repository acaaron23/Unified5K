import React, { useEffect, useState } from "react";
import { Button, Image, View, ActivityIndicator, Text, ScrollView } from "react-native";
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

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-col items-center space-y-5 justify-center bg-white p-4">
          <Image
            source={require('@/assets/images/unified-5k-logo.png')}
            style={{ width: 200, height: 100, resizeMode: 'contain' }}
          />

          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 16 }}>
            {race.name}
          </Text>

          {photos.length > 0 ? (
            <ImageCarousel imageResponse={photos} />
          ) : (
            <View style={{ width: '100%', height: 200, backgroundColor: '#f3f4f6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#9ca3af' }}>No photos available</Text>
            </View>
          )}

          <Descriptor
            date={date}
            location={location}
            time={time}
          />

          <DonationBar currentAmount={8000} totalAmount={10000} />

          <Button
            title="Become a Sponsor/Vendor"
            onPress={() => { }}
            color="#00AEEF"
          />
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 20 }}>
        <Button
          title="Participate"
          onPress={() => { }}
          color="#00AEEF"
        />
        <Button
          title="Volunteer"
          onPress={() => { }}
          color="#00AEEF"
        />
      </View>
    </SafeAreaView>
  );
}
