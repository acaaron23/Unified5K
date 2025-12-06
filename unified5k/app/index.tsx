import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import FilterTabs from '../components/FilterTabs';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import RaceCard from '../components/RaceCard';
import SearchBar from '../components/SearchBar';
import { raceService, type Race } from '../services/runsignup';

interface ActiveFilters {
  live: boolean;
  past: boolean;
  upcoming: boolean;
}

const IndexScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    live: true,
    past: true,
    upcoming: true,
  });

  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationStates, setNotificationStates] = useState<{[key: number]: boolean}>({});

  /**
   * Fetch races based on active filters
   * Fetches real data from RunSignUp API
   */
  const fetchRaces = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching all available races from API...');

      // Fetch ALL races without date restrictions
      // Increase results_per_page to get more races
      const response = await raceService.getRaces({
        resultsPerPage: 100, // Fetch up to 100 races
        events: true, // Include event details
      });

      const allRaces = response.races || [];

      console.log(`Successfully fetched ${allRaces.length} races`);
      setRaces(allRaces);
    } catch (err: any) {
      console.error('Error loading races:', err);
      setError(err.message || 'Unable to load races. Please check your API credentials.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search races by query
   */
  const searchRaces = async (query: string) => {
    if (!query.trim()) {
      fetchRaces();
      return;
    }

    setLoading(true);
    try {
      const results = await raceService.searchRaces(query, 25);
      setRaces(results);
    } catch (err: any) {
      console.error('Error searching races:', err);
      setError(err.message || 'Failed to search races');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRaces();
  }, [activeFilters]);

  // Scroll to top when tab is pressed
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
      // Scroll to top when home tab is pressed again
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return unsubscribe;
  }, [navigation]);

  // Filter races based on search query and active filters
  const filteredRaces = races.filter((race) => {
    // If search query exists, filter by query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const raceName = race.name.toLowerCase();
      const location = `${race.address.city} ${race.address.state}`.toLowerCase();
      
      const matchesQuery = raceName.includes(query) || location.includes(query);
      if (!matchesQuery) return false;
    }

    // Filter by status based on active filters
    const status = raceService.getRaceStatus(race);
    
    if (status === 'live' && !activeFilters.live) return false;
    if (status === 'upcoming' && !activeFilters.upcoming) return false;
    if (status === 'past' && !activeFilters.past) return false;

    return true;
  });

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    
    // Debounce search - wait for user to stop typing
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        searchRaces(query);
      }, 500);
      clearTimeout(timeoutId);
    }
  };

  const handleFilterChange = (filters: ActiveFilters): void => {
    setActiveFilters(filters);
  };

  const handleRacePress = (raceId: number): void => {
    console.log(`Navigate to race details: ${raceId}`);
    router.push(`/race_details?raceId=${raceId}`);
  };

  const handleNotificationPress = (raceId: number): void => {
    console.log(`Toggle notification for race: ${raceId}`);
    
    setNotificationStates(prev => ({
      ...prev,
      [raceId]: !prev[raceId]
    }));

    // TODO: Implement notification subscription via API
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        
        <HeroSection />
        
        <View style={styles.contentContainer}>
          <SearchBar
            value={searchQuery}
            onSearch={handleSearch}
            placeholder="Find a Race"
          />
          
          <FilterTabs
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1BA8D8" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchRaces}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.raceList}>
              {filteredRaces.map((race) => {
                // Handle both local assets (number from require()) and remote URLs (string)
                const imageSource = race.logo_url
                  ? (typeof race.logo_url === 'string'
                      ? { uri: race.logo_url }  // Remote URL
                      : race.logo_url)           // Local asset from require()
                  : require('../assets/images/raceimage1.jpg');

                return (
                  <RaceCard
                    key={race.race_id}
                    raceName={race.name}
                    location={raceService.getRaceLocation(race)}
                    imageSource={imageSource}
                    raceDate={raceService.formatRaceDate(race)}
                    isNotificationEnabled={notificationStates[race.race_id] || false}
                    onPress={() => handleRacePress(race.race_id)}
                    onNotificationPress={() => handleNotificationPress(race.race_id)}
                  />
                );
              })}
              
              {filteredRaces.length === 0 && !loading && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No races found</Text>
                  <Text style={styles.emptySubtext}>
                    Try adjusting your filters or search query
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    paddingBottom: 20,
  },
  
  raceList: {
    marginTop: 20,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#1BA8D8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default IndexScreen;
