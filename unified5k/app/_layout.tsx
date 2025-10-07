import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, Slot, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ClerkProvider } from "@clerk/clerk-expo";
import './global.css';

// Dummy tokenCache to avoid SecureStore issues
const tokenCache = {
    async getToken(key: string) {
        return null;
    },
    async saveToken(key: string, value: string) {
        return;
    },
};

export default function RootLayout() {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
    const segments = useSegments();

    // Only show tabs if we are NOT in an auth group
    const showTabs = segments[0] !== "(auth)";

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <PaperProvider>
                {showTabs ? (
                    <Tabs
                        screenOptions={({ route }) => ({
                            tabBarActiveTintColor: "#009EE2",
                            tabBarInactiveTintColor: "gray",
                            tabBarStyle: {
                                backgroundColor: "#fff",
                                borderTopColor: "#eee",
                                height: 70,
                            },
                            tabBarLabelStyle: {
                                fontSize: 12,
                                marginBottom: 4,
                            },
                            tabBarIcon: ({ color, size }) => {
                                switch (route.name) {
                                    case "media":
                                        return <FontAwesome5 name="globe" size={size} color={color} />;
                                    case "resources":
                                        return <MaterialIcons name="folder" size={size} color={color} />;
                                    case "index":
                                        return <Ionicons name="home-outline" size={size} color={color} />;
                                    case "donation":
                                        return <Ionicons name="heart-outline" size={size} color={color} />;
                                    case "profile":
                                        return <Ionicons name="person-outline" size={size} color={color} />;
                                    default:
                                        return null;
                                }
                            },
                            headerShown: false,
                        })}
                    >
                        {/* Main tabs */}
                        <Tabs.Screen name="media" options={{ title: "Media" }} />
                        <Tabs.Screen name="resources" options={{ title: "Resources" }} />
                        <Tabs.Screen name="index" options={{ title: "Home" }} />
                        <Tabs.Screen name="donation" options={{ title: "Donation" }} />
                        <Tabs.Screen name="profile" options={{ title: "Profile" }} />

                        {/* Hidden routes: no tab button */}
                        <Tabs.Screen name="race_details" options={{ tabBarButton: () => null }} />
                        <Tabs.Screen name="sponsor-tiers" options={{ tabBarButton: () => null }} />
                    </Tabs>
                ) : (
                    <Slot />
                )}
            </PaperProvider>
        </ClerkProvider>
    );
}
