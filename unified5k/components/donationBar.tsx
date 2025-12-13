/**
 * DONATION BAR - Fundraising progress indicator
 * Shows current fundraising amount vs goal with visual progress bar
 * Displays on race details page for races with fundraising enabled
 * Includes donate button linking to donation page
 */

import { Text, View, TouchableOpacity } from "react-native";
import {useFonts} from 'expo-font'; // Custom font loader
import { useRouter } from 'expo-router'; // Navigation

// Component showing fundraising progress with visual bar
export default function DonationBar({currentAmount, totalAmount}: {currentAmount: number, totalAmount: number}) {
    const router = useRouter(); // Navigation

    // Load Poppins font family for text display
    const [fontsLoaded] = useFonts({
        "Poppins": require('../assets/fonts/Poppins-Regular.ttf'),
        "Poppins-Bold": require('../assets/fonts/Poppins-SemiBold.ttf'),
       "Poppins-SemiBold": require('../assets/fonts/Poppins-SemiBold.ttf'),
    });

    // Only display if current amount hasn't exceeded goal
    if (currentAmount <= totalAmount) {
        return (
            // Main container with border and padding
            <View
                style={{
                    height: 140,
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: '#1BA8D8',
                    width: '90%',
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                    backgroundColor: '#fff',
                }}
            >
                {/* Top row: fundraising text and donate button */}
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}>

                    {/* Display current vs goal amount */}
                    <Text style={{ fontFamily: 'Poppins', fontSize: 15, flex: 1, color: '#000' }} >
                        {"$" + currentAmount.toLocaleString() + " out of $" + totalAmount.toLocaleString() + "\ngoal reached"}
                    </Text>

                    {/* Donate button - navigates to donation page */}
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#1BA8D8',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 8,
                        }}
                        onPress={() => router.push('/donation')}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Donate</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress bar container - background track */}
                <View
                    style={{
                        width: '100%',
                        height: 28,
                        borderWidth: 2,
                        borderColor: '#1BA8D8',
                        borderRadius: 14,
                        backgroundColor: '#E8F4FC',
                        overflow: 'hidden',
                    }}>

                    {/* Filled progress bar - width based on percentage */}
                    <View
                        style={{
                            width: `${(currentAmount / totalAmount) * 100}%`,
                            height: '100%',
                            backgroundColor: '#6BA7C5',
                            borderRadius: 12,
                            position: 'absolute'
                        }}>
                    </View>

                </View>
            </View>
        );
    }
}