/**
 * ROOT LAYOUT - Main app navigation with tab bar
 * Sets up Clerk authentication and tab navigation
 * Handles routing between authenticated and public pages
 */

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments, usePathname } from "expo-router";
import { PaperProvider } from "react-native-paper"; // Material Design components
import { ClerkProvider, useAuth } from "@clerk/clerk-expo"; // User auth
import { useEffect, useRef } from "react";
import * as SecureStore from "expo-secure-store"; // Secure token storage
import "./global.css";

// Securely cache auth tokens on device
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key); // Retrieve from secure storage
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value); // Save to secure storage
    } catch (error) {
      console.error("Error saving token:", error);
    }
  },
};

// Main navigation with auth protection
function RootLayoutNav() {
  const { isSignedIn, isLoaded } = useAuth(); // Check auth status
  const segments = useSegments(); // Current route segments
  const router = useRouter();
  const pathname = usePathname(); // Current page path
  const hasNavigated = useRef(false); // Prevent multiple redirects

  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load

    const inAuthGroup = segments[0] === "(auth)"; // Check if on login/signup

    // Redirect logged-in users away from login pages
    if (isSignedIn && inAuthGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/"); // Go to home
    }

    // Redirect logged-out users to login
    if (!isSignedIn && !inAuthGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(auth)/sign-in"); // Go to login
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return null; // Show nothing while loading
  }

  return (
    <Tabs
      screenOptions={({ route }) => {
        // Highlight Home tab when viewing race details
        const isOnRaceDetails = pathname?.includes('race_details');

        return {
          tabBarActiveTintColor: "#009EE2", // Active tab color
          tabBarInactiveTintColor: "gray", // Inactive tab color
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#eee",
            height: 70, // Tab bar height
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
            // Keep Home highlighted when on race details
            color: (route.name === "index" && isOnRaceDetails) ? "#009EE2" : undefined,
          },
          tabBarIcon: ({ color, size, focused }) => {
            // Override Home icon color for race details
            const iconColor = (route.name === "index" && isOnRaceDetails)
              ? "#009EE2"
              : color;

            // Render appropriate icon for each tab
            switch (route.name) {
              case "media":
                return <FontAwesome5 name="globe" size={size} color={color} />;
              case "resources":
                return <MaterialIcons name="folder" size={size} color={color} />;
              case "index": // Home tab
                return <Ionicons name="home-outline" size={size} color={iconColor} />;
              case "donation":
                return <Ionicons name="heart-outline" size={size} color={color} />;
              case "profile":
                return <Ionicons name="person-outline" size={size} color={color} />;
              default:
                return null;
            }
          },
          headerShown: false, // Hide default header
        };
      }}
    >
      {/* Main visible tabs */}
      <Tabs.Screen name="media" options={{ title: "Media" }} />
      <Tabs.Screen name="resources" options={{ title: "Resources" }} />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="donation" options={{ title: "Donation" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />

      {/* Hidden routes - accessible but not in tab bar */}
      <Tabs.Screen name="race_details" options={{ href: null }} />
      <Tabs.Screen name="sponsor-tiers" options={{ href: null }} />
      <Tabs.Screen name="(auth)" options={{ href: null }} />
    </Tabs>
  );
}

// App root with auth and UI providers
export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"); // Env check
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PaperProvider> {/* Material Design wrapper */}
        <RootLayoutNav />
      </PaperProvider>
    </ClerkProvider>
  );
}
