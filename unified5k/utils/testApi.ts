/**
 * API Test Utility
 * Use this to test your RunSignUp API connection
 */

import { raceService } from '../services/runsignup';

/**
 * Test the API connection by fetching upcoming races
 * Call this from any component to verify your API credentials are working
 *
 * Usage:
 * ```
 * import { testApiConnection } from '../utils/testApi';
 *
 * useEffect(() => {
 *   testApiConnection();
 * }, []);
 * ```
 */
export async function testApiConnection(): Promise<boolean> {
  console.log('🔍 Testing RunSignUp API connection...');

  try {
    // Try to fetch a small number of upcoming races
    const races = await raceService.getUpcomingRaces(5);

    console.log('✅ API connection successful!');
    console.log(`📊 Fetched ${races.length} races`);

    if (races.length > 0) {
      console.log('📍 Sample race:', {
        name: races[0].name,
        location: `${races[0].address.city}, ${races[0].address.state}`,
        date: races[0].next_date,
      });
    }

    return true;
  } catch (error: any) {
    console.error('❌ API connection failed:', error.message);
    console.error('💡 Check your API credentials in the .env file');
    return false;
  }
}

/**
 * Test search functionality
 */
export async function testSearchRaces(query: string = '5k'): Promise<void> {
  console.log(`🔍 Testing race search with query: "${query}"`);

  try {
    const races = await raceService.searchRaces(query, 10);
    console.log(`✅ Found ${races.length} races matching "${query}"`);

    races.slice(0, 3).forEach((race, index) => {
      console.log(`${index + 1}. ${race.name} - ${race.address.city}, ${race.address.state}`);
    });
  } catch (error: any) {
    console.error('❌ Search failed:', error.message);
  }
}

/**
 * Test fetching race details
 */
export async function testGetRaceDetails(raceId: number): Promise<void> {
  console.log(`🔍 Testing race details for race ID: ${raceId}`);

  try {
    const race = await raceService.getRaceDetails(raceId, true);
    console.log('✅ Successfully fetched race details');
    console.log('📋 Race info:', {
      name: race.name,
      description: race.description,
      location: `${race.address.city}, ${race.address.state}`,
      events: race.events?.length || 0,
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch race details:', error.message);
  }
}
