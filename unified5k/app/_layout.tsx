import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useEffect, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import "./global.css";

// --- Token cache setup ---
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  },
};

// --- Auth-aware layout navigation ---
function RootLayoutNav() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Redirect signed-in users away from auth pages
    if (isSignedIn && inAuthGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/");
    }

    // Redirect signed-out users away from protected routes
    if (!isSignedIn && !inAuthGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return null; // could replace with a splash screen later
  }

  return (
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

      {/* Hidden routes */}
      <Tabs.Screen name="race_details" options={{ href: null }} />
      <Tabs.Screen name="sponsor-tiers" options={{ href: null }} />
      <Tabs.Screen name="(auth)" options={{ href: null }} />
    </Tabs>
  );
}

// --- Root provider setup ---
export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </ClerkProvider>
  );
}
