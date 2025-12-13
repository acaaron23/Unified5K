/**
 * DONATION PAGE - Fundraising and sponsorship options
 * Shows donation links and sponsor signup
 * Opens external links or navigates to sponsor tiers
 */

import { View, Text, TouchableOpacity, SafeAreaView, Linking, Dimensions } from 'react-native';
import { useRouter } from 'expo-router'; // Navigation
import Header from '../components/Header'; // App header

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380; // Responsive layout flag

export default function Donation() {
    const router = useRouter(); // Navigation
    const open = (url: string) => Linking.openURL(url).catch(() => { }); // Open external URLs

    // Donation options - AdaptX links and sponsor signup
    const buttons: { label: string; onPress: () => void; variant?: 'filled' | 'outline' }[] = [
        { label: 'Donate to AdaptX', onPress: () => open('https://www.adaptx.org/donate'), variant: 'outline' },
        { label: 'Donate through a DAF', onPress: () => open('https://www.adaptx.org/donate'), variant: 'outline' },
        { label: 'Become a Sponsor/Vendor', onPress: () => router.push('/sponsor-tiers?returnTo=donation'), variant: 'filled' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* App header */}
            <Header />

            {/* Page title */}
            <View className="px-6 items-center" style={{ marginTop: isSmallDevice ? 16 : 24 }}>
                <Text
                    className="text-center font-extrabold text-gray-900"
                    style={{
                        fontSize: isSmallDevice ? 24 : 30,
                        lineHeight: isSmallDevice ? 32 : 36,
                    }}
                >
                    Help Us Make{'\n'}Fitness Accessible
                </Text>
            </View>

            {/* Donation buttons */}
            <View className="flex-1 px-5">
                <View className="flex-1" style={{ marginTop: isSmallDevice ? 32 : 48 }}>
                    {buttons.map((btn) => (
                        <TouchableOpacity
                            key={btn.label}
                            activeOpacity={0.85}
                            onPress={btn.onPress} // Open link or navigate
                            className={`w-full rounded-2xl border-2 shadow-sm ${btn.variant === 'filled' ? 'bg-sky-100 border-sky-500' : 'bg-white border-sky-500'}`}
                            style={{
                                paddingVertical: isSmallDevice ? 14 : 16,
                                paddingHorizontal: 20,
                                marginTop: 20,
                            }}
                        >
                            <Text
                                className="text-center font-extrabold text-black"
                                style={{ fontSize: isSmallDevice ? 16 : 18 }}
                            >
                                {btn.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}
