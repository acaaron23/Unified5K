import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

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
                router.replace('/(tabs)');
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Header />

                <Text variant="displayMedium" style={styles.title}>
                    Sign In
                </Text>

                <View style={styles.formContainer}>
                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            mode="outlined"
                            outlineColor="#1BA8D8"
                            style={styles.input}
                        />

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={hidePassword}
                            mode="outlined"
                            outlineColor="#1BA8D8"
                            style={styles.input}
                            right={
                                <TextInput.Icon
                                    icon={hidePassword ? "eye" : "eye-off"}
                                    onPress={() => setHidePassword(!hidePassword)}
                                />
                            }
                        />

                        <Link href="/" style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </Link>

                        <Button
                            mode="contained"
                            onPress={onSignInPress}
                            loading={loading}
                            disabled={loading}
                            buttonColor="#1BA8D8"
                            style={styles.button}
                        >
                            <Text variant="headlineSmall" style={{ color: '#fff' }}>
                                Sign In
                            </Text>
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={() => router.push('/(tabs)')}
                            style={styles.guestButton}
                        >
                            <Text variant="headlineSmall">Continue as Guest</Text>
                        </Button>

                        <View style={styles.footer}>
                            <Text>Don't have an account? </Text>
                            <Link href="/(auth)/sign-up" asChild>
                                <Text style={styles.link}>Sign up</Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    formContainer: {
        marginHorizontal: 16,
        borderWidth: 2,
        borderColor: '#1BA8D8',
        borderRadius: 16,
        padding: 16,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: '#fff',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotPasswordText: {
        color: '#0023DD',
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
    },
    guestButton: {
        borderRadius: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    link: {
        color: '#1BA8D8',
        fontWeight: '600',
    },
});