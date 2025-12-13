/**
 * SIGN IN PAGE - User login screen
 * Handles email/password authentication via Clerk
 * Includes guest access option
 */

import { useSignIn } from '@clerk/clerk-expo'; // Clerk auth hook
import { Link, useRouter } from 'expo-router'; // Navigation
import React, { useState } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper'; // Material UI
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header'; // App header with logo
import { Ionicons } from '@expo/vector-icons'; // Icons

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380; // Responsive layout flag

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn(); // Clerk sign in methods
    const router = useRouter(); // Navigation

    const [emailAddress, setEmailAddress] = useState(''); // Email input
    const [password, setPassword] = useState(''); // Password input
    const [hidePassword, setHidePassword] = useState(true); // Show/hide password
    const [loading, setLoading] = useState(false); // Submit state

    // Handle login button press
    const onSignInPress = async () => {
        if (!isLoaded) return; // Wait for Clerk to load

        setLoading(true);
        try {
            // Attempt sign in with email and password
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId }); // Activate session
                router.replace("/"); // Go to home
            } else {
                Alert.alert('Error', 'Sign in incomplete. Please try again.');
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch (err: any) {
            const errorMessage = err.errors?.[0]?.message || 'Invalid email or password';
            Alert.alert('Sign In Failed', errorMessage);
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="bg-white flex-1" edges={['top']}>
            <ScrollView>
                {/* Header with close button */}
                <View style={{ position: 'relative' }}>
                    <Header />
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: 16,
                            top: 8,
                            padding: 8,
                            zIndex: 10,
                        }}
                        onPress={() => router.back()} // Go back to previous page
                    >
                        <Ionicons name="close" size={32} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Page title */}
                <Text
                    style={{
                        textAlign: "center",
                        marginBottom: isSmallDevice ? 12 : 16,
                        fontWeight: "bold",
                        fontSize: isSmallDevice ? 28 : 36,
                    }}
                >
                    Login
                </Text>

                {/* Login form container */}
                <View className="rounded-2xl border-2 border-[#1BA8D8] px-2 mx-4" style={{ paddingVertical: isSmallDevice ? 32 : 64 }}>
                    {/* Form inputs */}
                    <View style={{ gap: isSmallDevice ? 20 : 32 }}>
                        <TextInput
                            placeholder="Email"
                            outlineColor="#1BA8D8"
                            mode="outlined"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            placeholder="Password"
                            outlineColor="#1BA8D8"
                            mode="outlined"
                            secureTextEntry={hidePassword} // Hide password by default
                            value={password}
                            onChangeText={setPassword}
                            right={
                                <TextInput.Icon
                                    icon={hidePassword ? "eye" : "eye-off"} // Toggle icon
                                    onPress={() => setHidePassword(!hidePassword)} // Show/hide password
                                />
                            }
                        />
                    </View>

                    {/* Forgot password link */}
                    <Link
                        style={{
                            alignSelf: "flex-end",
                            color: "#0023DD",
                            marginTop: 8,
                            fontWeight: "400",
                        }}
                        href="/"
                    >
                        Forgot Password?
                    </Link>

                    {/* Action buttons */}
                    <View style={{ marginTop: isSmallDevice ? 16 : 24, gap: isSmallDevice ? 20 : 32 }}>
                        {/* Login button */}
                        <Button
                            mode="contained"
                            buttonColor="#1BA8D8"
                            style={{
                                borderRadius: 8,
                            }}
                            onPress={onSignInPress} // Submit login form
                            loading={loading}
                            disabled={loading}
                        >
                            <Text
                                variant={isSmallDevice ? "titleLarge" : "headlineSmall"}
                                style={{
                                    color: "#ffffff",
                                    fontWeight: "700",
                                }}
                            >
                                Login
                            </Text>
                        </Button>

                        {/* Sign up link */}
                        <Link href="/(auth)/sign-up" asChild>
                            <TouchableOpacity>
                                <Button
                                    mode="outlined"
                                    textColor="#000000"
                                    style={{
                                        borderRadius: 8,
                                        borderColor: '#1BA8D8',
                                    }}
                                    disabled={loading}
                                >
                                    <Text variant={isSmallDevice ? "titleLarge" : "headlineSmall"} style={{ fontWeight: "700" }}>
                                        Create new account
                                    </Text>
                                </Button>
                            </TouchableOpacity>
                        </Link>

                        {/* Guest access button */}
                        <Button
                            mode="outlined"
                            textColor="#000000"
                            style={{
                                borderRadius: 8,
                                borderColor: '#1BA8D8',
                            }}
                            onPress={() => router.replace("/")} // Skip login
                            disabled={loading}
                        >
                            <Text variant={isSmallDevice ? "titleLarge" : "headlineSmall"} style={{ fontWeight: "700" }}>
                                Continue as guest
                            </Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}