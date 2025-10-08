// Profile Page

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import CollapsibleSection from '../components/profile/CollapsibleSection';
import Header from '../components/Header';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
    const { isSignedIn, signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const [selectedTab, setSelectedTab] = useState<'Participant' | 'Volunteer' | 'Organization'>('Organization');
    const [imageUri, setImageUri] = useState<string | null>(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // If user is not signed in, show login prompt
    if (!isSignedIn) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView 
                    contentContainerStyle={styles.loginScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerWrapper}>
                        <Header />
                    </View>
                    
                    <View style={styles.loginPromptContainer}>
                        <Image
                            source={require('../assets/images/profile-placeholder.jpg')}
                            style={styles.placeholderImage}
                        />
                        <Text style={styles.loginPromptTitle}>Sign in to view your profile</Text>
                        <Text style={styles.loginPromptSubtitle}>
                            Access your events, volunteer history, and organization details
                        </Text>
                        
                        <Link href="/(auth)/sign-in" asChild>
                            <TouchableOpacity style={styles.loginButtonWrapper}>
                                <View style={styles.loginButtonContainer}>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                        
                        <View style={styles.signupPrompt}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <Link href="/(auth)/sign-up" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.signupLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // User is signed in - show profile
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header OUTSIDE ScrollView to match login behavior */}
            <Header />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Row (image + name/email/badge) */}
                <View style={styles.profileRow}>
                    <View style={styles.profileImageWrapper}>
                        <TouchableOpacity onPress={pickImage}>
                            <View style={styles.profileImageWrapper}>
                                <Image
                                    source={
                                        imageUri
                                            ? { uri: imageUri }
                                            : user?.imageUrl
                                            ? { uri: user.imageUrl }
                                            : require('../assets/images/profile-placeholder.jpg')
                                    }
                                    style={styles.profileImage}
                                />
                                <View style={styles.editIcon}>
                                    <Text style={styles.editText}>✎</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>
                            {user?.firstName && user?.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user?.username || 'User'}
                        </Text>
                        <Text style={styles.email}>
                            {user?.primaryEmailAddress?.emailAddress || 'No email'}
                        </Text>
                        <View style={styles.participantBadge}>
                            <Text style={styles.badgeText}>Participant</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsRow}>
                    {['Participant', 'Volunteer', 'Organization'].map((tab) => (
                        <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab as any)}>
                            <Text style={[styles.tab, selectedTab === tab && styles.activeTab]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedTab === 'Participant' && (
                    <View style={{ paddingTop: 20 }}>
                        <CollapsibleSection title="Upcoming Events">
                            <Text>Race Card</Text>
                            <Text>RaceCard</Text>
                        </CollapsibleSection>

                        <CollapsibleSection title="Past Events">
                            <Text>Race Card</Text>
                        </CollapsibleSection>
                    </View>
                )}

                {/* Sign Out Button */}
                <View style={styles.signOutContainer}>
                    <Button
                        mode="outlined"
                        onPress={() => signOut()}
                        style={styles.signOutButton}
                        textColor="#DC2626"
                    >
                        Sign Out
                    </Button>
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
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    
    // Login Screen Styles
    loginScrollContent: {
        minHeight: SCREEN_HEIGHT * 0.9, // Use 90% of screen height
        justifyContent: 'space-between',
    },
    headerWrapper: {
        // Header at top
    },
    loginPromptContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 24,
        opacity: 0.5,
    },
    loginPromptTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    loginPromptSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    loginButtonWrapper: {
        width: '100%',
        maxWidth: 400, // Limit width on larger screens
    },
    loginButtonContainer: {
        backgroundColor: '#1BA8D8',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    signupPrompt: {
        flexDirection: 'row',
        marginTop: 16,
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#1BA8D8',
        fontWeight: '600',
    },

    // Profile Styles
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 16,
    },
    profileImageWrapper: {
        position: 'relative',
        marginRight: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#000',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#00BFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    name: { fontSize: 18, fontWeight: '600' },
    email: { fontSize: 14, color: 'gray', marginBottom: 6 },

    participantBadge: {
        backgroundColor: '#E2F6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#0077AA',
        fontSize: 12,
        fontWeight: '500',
    },

    tabsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tab: {
        fontSize: 16,
        color: 'gray',
        paddingBottom: 4,
    },
    activeTab: {
        color: '#00BFFF',
        borderBottomWidth: 2,
        borderColor: '#00BFFF',
    },

    // Sign Out Button
    signOutContainer: {
        marginTop: 32,
        marginBottom: 40,
    },
    signOutButton: {
        borderRadius: 8,
        borderColor: '#DC2626',
        borderWidth: 1,
    },
});