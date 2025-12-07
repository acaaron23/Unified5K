import { View, Text, TouchableOpacity, SafeAreaView, Linking, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export default function Donation() {
    const router = useRouter();
    const open = (url: string) => Linking.openURL(url).catch(() => { });

    const buttons: { label: string; onPress: () => void; variant?: 'filled' | 'outline' }[] = [
        { label: 'Donate to AdaptX', onPress: () => open('https://www.adaptx.org/donate'), variant: 'outline' },
        { label: 'Donate through a DAF', onPress: () => open('https://www.adaptx.org/donate'), variant: 'outline' },
        { label: 'Become a Sponsor/Vendor', onPress: () => router.push('/sponsor-tiers'), variant: 'filled' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Logo / header */}
            <Header />

            {/* Title */}
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

            {/* Buttons - centered vertically in remaining space */}
            <View className="flex-1 px-5">
                <View className="flex-1" style={{ marginTop: isSmallDevice ? 32 : 48 }}>
                    {buttons.map((btn) => (
                        <TouchableOpacity
                            key={btn.label}
                            activeOpacity={0.85}
                            onPress={btn.onPress}
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
