import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Modal } from 'react-native';
import CollapsibleSection from '../components/profile/CollapsibleSection';
import Header from '../components/Header';
import RaceCard from '../components/RaceCard';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRunSignUp } from '../hooks/useRunSignUp';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
    const { isSignedIn, signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    // RunSignUp integration
    const {
        isLinked,
        isLoading: runSignUpLoading,
        runSignUpUser,
        runSignUpUserId,
        upcomingRegistrations,
        pastRegistrations,
        linkAccount,
        unlinkAccount,
        fetchRegistrations,
        error: runSignUpError,
        adminInfo,
    } = useRunSignUp();

    // Check if user is admin (you can customize this logic)
    const isAdmin = user?.publicMetadata?.role === 'admin' || user?.publicMetadata?.isAdmin === true;

    const [selectedTab, setSelectedTab] = useState<'Participant' | 'Volunteer' | 'Organization'>('Participant');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [adaptiveCategory, setAdaptiveCategory] = useState<string>('');
    const [tshirtSize, setTshirtSize] = useState<string>('');

    // Mock race data for display
    const mockUpcomingRaces = [
        {
            registration_id: 1001,
            race_id: 1,
            race_name: "Boston Marathon",
            event_name: "Full Marathon",
            race_date: "2025-04-21",
            race_location: { city: "Boston", state: "MA" },
            bib_num: "12345",
            logo_url: require('../assets/images/raceimage1.jpg') as any,
        },
        {
            registration_id: 1002,
            race_id: 2,
            race_name: "NYC Inclusive 5K",
            event_name: "5K Run",
            race_date: "2025-05-15",
            race_location: { city: "New York", state: "NY" },
            bib_num: "5678",
            logo_url: require('../assets/images/raceimage2.jpg') as any,
        },
    ];

    const mockPastRaces = [
        {
            registration_id: 1003,
            race_id: 3,
            race_name: "Chicago Run for Unity",
            event_name: "10K Run",
            race_date: "2024-11-10",
            race_location: { city: "Chicago", state: "IL" },
            bib_num: "9012",
            logo_url: require('../assets/images/raceimage3.jpg') as any,
        },
        {
            registration_id: 1004,
            race_id: 4,
            race_name: "LA Marathon",
            event_name: "Half Marathon",
            race_date: "2024-10-16",
            race_location: { city: "Los Angeles", state: "CA" },
            logo_url: require('../assets/images/raceimage4.jpg') as any,
        },
    ];

    const [notificationStates, setNotificationStates] = useState<{[key: number]: boolean}>({});

    // Load registrations when linked (only if we have real user data)
    useEffect(() => {
        if (isLinked && !runSignUpLoading && runSignUpUserId && runSignUpUserId > 1) {
            fetchRegistrations();
        }
    }, [isLinked, runSignUpLoading, runSignUpUserId, fetchRegistrations]);

    const handleNotificationPress = (raceId: number): void => {
        setNotificationStates(prev => ({
            ...prev,
            [raceId]: !prev[raceId]
        }));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

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
                            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
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

                {/* RunSignUp Link Status */}
                <View style={styles.linkSection}>
                    {runSignUpError && (
                        <View style={styles.errorBanner}>
                            <Ionicons name="alert-circle" size={20} color="#DC2626" />
                            <Text style={styles.errorText}>{runSignUpError}</Text>
                        </View>
                    )}
                    {isAdmin && adminInfo && (
                        <View style={styles.infoBanner}>
                            <Ionicons name="information-circle" size={20} color="#10b981" />
                            <Text style={styles.infoText}>{adminInfo}</Text>
                        </View>
                    )}
                    {!isLinked ? (
                        <View style={styles.linkPrompt}>
                            <Ionicons name="link-outline" size={24} color="#0ea5e9" />
                            <View style={styles.linkTextContainer}>
                                <Text style={styles.linkTitle}>Link RunSignUp Account</Text>
                                <Text style={styles.linkSubtitle}>
                                    Connect to view and manage your race registrations
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={linkAccount}
                                disabled={runSignUpLoading}
                            >
                                {runSignUpLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.linkButtonText}>Link Account</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.linkedStatus}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.linkedText}>
                                RunSignUp account linked
                            </Text>
                            <TouchableOpacity onPress={unlinkAccount}>
                                <Text style={styles.unlinkText}>Unlink</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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

                {/* Participant Tab Content */}
                {selectedTab === 'Participant' && (
                    <View style={{ paddingTop: 20 }}>
                        <CollapsibleSection title="Upcoming Events">
                            {mockUpcomingRaces.map((reg) => (
                                <RaceCard
                                    key={reg.registration_id}
                                    raceName={reg.race_name}
                                    location={`${reg.race_location.city}, ${reg.race_location.state}`}
                                    imageSource={reg.logo_url}
                                    raceDate={formatDate(reg.race_date)}
                                    isNotificationEnabled={notificationStates[reg.race_id] || false}
                                    onPress={() => router.push(`/race_details?raceId=${reg.race_id}`)}
                                    onNotificationPress={() => handleNotificationPress(reg.race_id)}
                                />
                            ))}
                        </CollapsibleSection>

                        <CollapsibleSection title="Past Events">
                            {mockPastRaces.map((reg) => (
                                <RaceCard
                                    key={reg.registration_id}
                                    raceName={reg.race_name}
                                    location={`${reg.race_location.city}, ${reg.race_location.state}`}
                                    imageSource={reg.logo_url}
                                    raceDate={formatDate(reg.race_date)}
                                    isNotificationEnabled={notificationStates[reg.race_id] || false}
                                    onPress={() => router.push(`/race_details?raceId=${reg.race_id}`)}
                                    onNotificationPress={() => handleNotificationPress(reg.race_id)}
                                />
                            ))}
                        </CollapsibleSection>
                    </View>
                )}

                {/* Volunteer Tab Content */}
                {selectedTab === 'Volunteer' && (
                    <View style={{ paddingTop: 20 }}>
                        <CollapsibleSection title="Upcoming Events">
                            {mockUpcomingRaces.map((reg) => (
                                <RaceCard
                                    key={reg.registration_id}
                                    raceName={reg.race_name}
                                    location={`${reg.race_location.city}, ${reg.race_location.state}`}
                                    imageSource={reg.logo_url}
                                    raceDate={formatDate(reg.race_date)}
                                    isNotificationEnabled={notificationStates[reg.race_id] || false}
                                    onPress={() => router.push(`/race_details?raceId=${reg.race_id}`)}
                                    onNotificationPress={() => handleNotificationPress(reg.race_id)}
                                />
                            ))}
                        </CollapsibleSection>

                        <CollapsibleSection title="Past Events">
                            {mockPastRaces.map((reg) => (
                                <RaceCard
                                    key={reg.registration_id}
                                    raceName={reg.race_name}
                                    location={`${reg.race_location.city}, ${reg.race_location.state}`}
                                    imageSource={reg.logo_url}
                                    raceDate={formatDate(reg.race_date)}
                                    isNotificationEnabled={notificationStates[reg.race_id] || false}
                                    onPress={() => router.push(`/race_details?raceId=${reg.race_id}`)}
                                    onNotificationPress={() => handleNotificationPress(reg.race_id)}
                                />
                            ))}
                        </CollapsibleSection>
                    </View>
                )}

                {/* Organization Tab Content */}
                {selectedTab === 'Organization' && (
                    <View style={{ paddingTop: 20 }}>
                        <CollapsibleSection title="Hosted Events">
                            <RaceCard
                                raceName="Boston Marathon"
                                location="Boston, MA"
                                imageSource={require('../assets/images/raceimage1.jpg')}
                                raceDate="Apr 21"
                                isNotificationEnabled={notificationStates[1] || false}
                                onPress={() => router.push('/race_details?raceId=1')}
                                onNotificationPress={() => handleNotificationPress(1)}
                            />
                            <RaceCard
                                raceName="NYC Inclusive 5K"
                                location="New York, NY"
                                imageSource={require('../assets/images/raceimage2.jpg')}
                                raceDate="May 15"
                                isNotificationEnabled={notificationStates[2] || false}
                                onPress={() => router.push('/race_details?raceId=2')}
                                onNotificationPress={() => handleNotificationPress(2)}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection title="Past Events">
                            <RaceCard
                                raceName="Chicago Run for Unity"
                                location="Chicago, IL"
                                imageSource={require('../assets/images/raceimage3.jpg')}
                                raceDate="Nov 10"
                                isNotificationEnabled={notificationStates[3] || false}
                                onPress={() => router.push('/race_details?raceId=3')}
                                onNotificationPress={() => handleNotificationPress(3)}
                            />
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
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
    loginScrollContent: { minHeight: SCREEN_HEIGHT * 0.9, justifyContent: 'space-between' },
    headerWrapper: {},
    loginPromptContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
    placeholderImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 24, opacity: 0.5 },
    loginPromptTitle: { fontSize: 24, fontWeight: '600', color: '#000', marginBottom: 8, textAlign: 'center' },
    loginPromptSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    loginButtonWrapper: { width: '100%', maxWidth: 400 },
    loginButtonContainer: { backgroundColor: '#1BA8D8', borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    signupPrompt: { flexDirection: 'row', marginTop: 16 },
    signupText: { fontSize: 14, color: '#666' },
    signupLink: { fontSize: 14, color: '#1BA8D8', fontWeight: '600' },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 16 },
    profileImageWrapper: { position: 'relative', marginRight: 16 },
    profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#000' },
    editIcon: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#00BFFF', alignItems: 'center', justifyContent: 'center' },
    editText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    profileInfo: { flex: 1 },
    name: { fontSize: 18, fontWeight: '600' },
    email: { fontSize: 14, color: 'gray', marginBottom: 6 },
    participantBadge: { backgroundColor: '#E2F6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
    badgeText: { color: '#0077AA', fontSize: 12, fontWeight: '500' },
    linkSection: { marginBottom: 20 },
    linkPrompt: { backgroundColor: '#f0f9ff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#0ea5e9' },
    linkTextContainer: { marginVertical: 12 },
    linkTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
    linkSubtitle: { fontSize: 14, color: '#666' },
    linkButton: { backgroundColor: '#0ea5e9', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
    linkButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    linkedStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#10b981' },
    linkedText: { flex: 1, marginLeft: 8, fontSize: 14, color: '#059669', fontWeight: '500' },
    unlinkText: { fontSize: 14, color: '#0ea5e9', fontWeight: '600' },
    tabsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#ccc' },
    tab: { fontSize: 16, color: 'gray', paddingBottom: 4 },
    activeTab: { color: '#00BFFF', borderBottomWidth: 2, borderColor: '#00BFFF' },
    registrationCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    raceName: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
    eventName: { fontSize: 14, color: '#0ea5e9', marginBottom: 4 },
    location: { fontSize: 14, color: '#666', marginBottom: 4 },
    raceDate: { fontSize: 14, color: '#666', marginBottom: 8 },
    bibBadge: { backgroundColor: '#0ea5e9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    bibText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    volunteerBadge: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    volunteerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    orgStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 18, fontWeight: 'bold', color: '#0ea5e9' },
    statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
    emptyText: { textAlign: 'center', color: '#999', fontSize: 14, paddingVertical: 20 },
    notLinkedMessage: { padding: 20, alignItems: 'center' },
    notLinkedText: { textAlign: 'center', color: '#666', fontSize: 14 },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#DC2626',
    },
    errorText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#DC2626',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#059669',
    },
    signOutContainer: { marginTop: 32, marginBottom: 40 },
    signOutButton: { borderRadius: 8, borderColor: '#DC2626', borderWidth: 1 },
});
