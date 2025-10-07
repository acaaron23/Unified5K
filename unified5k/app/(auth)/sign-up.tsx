import * as React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [hidePassword, setHidePassword] = React.useState(true);
    const [pendingVerification, setPendingVerification] = React.useState(false);
    const [code, setCode] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            await signUp.create({
                emailAddress,
                password,
            });

            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code'
            });

            setPendingVerification(true);
            Alert.alert('Success', 'Verification code sent to your email!');
        } catch (err: any) {
            const errorMessage = err.errors?.[0]?.message || 'Sign up failed';
            Alert.alert('Error', errorMessage);
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setLoading(false);
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', 'Verification incomplete');
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (err: any) {
            const errorMessage = err.errors?.[0]?.message || 'Invalid verification code';
            Alert.alert('Verification Failed', errorMessage);
            console.error(JSON.stringify(err, null, 2));
        } finally {
            setLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Header />

                    <Text variant="displayMedium" style={styles.title}>
                        Verify Email
                    </Text>

                    <View style={styles.formContainer}>
                        <View style={styles.form}>
                            <Text style={styles.instructions}>
                                We sent a verification code to {emailAddress}
                            </Text>

                            <TextInput
                                label="Verification Code"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                mode="outlined"
                                outlineColor="#1BA8D8"
                                style={styles.input}
                            />

                            <Button
                                mode="contained"
                                onPress={onVerifyPress}
                                loading={loading}
                                disabled={loading}
                                buttonColor="#1BA8D8"
                                style={styles.button}
                            >
                                <Text variant="headlineSmall" style={{ color: '#fff' }}>
                                    Verify Email
                                </Text>
                            </Button>

                            <Button
                                mode="text"
                                onPress={() => setPendingVerification(false)}
                                disabled={loading}
                            >
                                Go Back
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Header />

                <Text variant="displayMedium" style={styles.title}>
                    Create Account
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

                        <Button
                            mode="contained"
                            onPress={onSignUpPress}
                            loading={loading}
                            disabled={loading}
                            buttonColor="#1BA8D8"
                            style={styles.button}
                        >
                            <Text variant="headlineSmall" style={{ color: '#fff' }}>
                                Continue
                            </Text>
                        </Button>

                        <View style={styles.footer}>
                            <Text>Already have an account? </Text>
                            <Link href="/(auth)/sign-in" asChild>
                                <Text style={styles.link}>Sign in</Text>
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
    instructions: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 8,
    },
    button: {
        marginTop: 8,
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