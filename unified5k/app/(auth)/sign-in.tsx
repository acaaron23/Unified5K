import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Alert, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [loading, setLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace("/"); 
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
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={32} color="#000" />
                    </TouchableOpacity>
                </View>

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

                <View className="rounded-2xl border-2 border-[#1BA8D8] px-2 mx-4" style={{ paddingVertical: isSmallDevice ? 32 : 64 }}>
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
                            secureTextEntry={hidePassword}
                            value={password}
                            onChangeText={setPassword}
                            right={
                                <TextInput.Icon
                                    icon={hidePassword ? "eye" : "eye-off"}
                                    onPress={() => setHidePassword(!hidePassword)}
                                />
                            }
                        />
                    </View>

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

                    <View style={{ marginTop: isSmallDevice ? 16 : 24, gap: isSmallDevice ? 20 : 32 }}>
                        <Button
                            mode="contained"
                            buttonColor="#1BA8D8"
                            style={{
                                borderRadius: 8,
                            }}
                            onPress={onSignInPress}
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

                        <Button
                            mode="outlined"
                            textColor="#000000"
                            style={{
                                borderRadius: 8,
                                borderColor: '#1BA8D8',
                            }}
                            onPress={() => router.replace("/")}
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