/**
 * AUTH LAYOUT - Authentication pages navigation
 * Stack navigator for login and signup flows
 */

import { Stack } from 'expo-router'; // Navigation stack

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Hide default header
            }}
        >
            <Stack.Screen name="sign-in" /> {/* Login page */}
            <Stack.Screen name="sign-up" /> {/* Registration page */}
        </Stack>
    );
}