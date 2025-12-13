/**
 * SIGN UP PAGE - User registration screen
 * Two-step process: account creation and email verification
 * Handles user registration via Clerk
 */

import * as React from "react";
import {
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Dimensions,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper"; // Material UI
import { useSignUp } from "@clerk/clerk-expo"; // Clerk registration hook
import { Link, useRouter } from "expo-router"; // Navigation
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header"; // App header
import { Ionicons } from "@expo/vector-icons"; // Icons

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380; // Responsive layout flag

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp(); // Clerk sign up methods
  const router = useRouter(); // Navigation

  const [emailAddress, setEmailAddress] = React.useState(""); // Email input
  const [password, setPassword] = React.useState(""); // Password input
  const [firstName, setFirstName] = React.useState(""); // First name input
  const [lastName, setLastName] = React.useState(""); // Last name input
  const [confirmPassword, setConfirmPassword] = React.useState(""); // Password confirmation
  const [hidePassword, setHidePassword] = React.useState(true); // Show/hide password
  const [hideConfirmPassword, setHideConfirmPassword] = React.useState(true); // Show/hide confirm password
  const [pendingVerification, setPendingVerification] = React.useState(false); // Verification step flag
  const [code, setCode] = React.useState(""); // Email verification code
  const [loading, setLoading] = React.useState(false); // Submit state

  // Handle registration button press - Step 1: Create account
  const onSignUpPress = async () => {
    if (!isLoaded) return; // Wait for Clerk to load

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Create new user account
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // Send verification code to email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true); // Show verification screen
      Alert.alert("Success", "Verification code sent to your email!");
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || "Sign up failed";
      Alert.alert("Error", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Handle verification button press - Step 2: Verify email
  const onVerifyPress = async () => {
    if (!isLoaded) return; // Wait for Clerk to load

    setLoading(true);
    try {
      // Verify email with code from email
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId }); // Activate session
        router.replace("/"); // Go to home
      } else {
        Alert.alert("Error", "Verification incomplete");
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "Invalid verification code";
      Alert.alert("Verification Failed", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Show verification screen after account creation
  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          {/* Header with close button */}
          <View className="flex-row justify-between items-center px-0 pt-0 relative">
            <Header />
            <TouchableOpacity
              className="absolute right-4 top-2 p-2 z-10"
              onPress={() => router.back()} // Go back
            >
              <Ionicons name="close" size={32} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Page title */}
          <Text
            style={{
              textAlign: "center",
              marginBottom: isSmallDevice ? 16 : 24,
              marginTop: 16,
              fontWeight: "bold",
              fontSize: isSmallDevice ? 28 : 36,
            }}
          >
            Verify Email
          </Text>

          {/* Verification form */}
          <View className="mx-4 border-2 border-[#1BA8D8] rounded-2xl px-4" style={{ paddingVertical: isSmallDevice ? 32 : 64 }}>
            <Text className="text-center text-gray-600 mb-4 text-sm">
              We sent a verification code to {emailAddress}
            </Text>

            {/* Verification code input */}
            <TextInput
              placeholder="Verification Code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
            />

            {/* Action buttons */}
            <View style={{ marginTop: isSmallDevice ? 16 : 24, gap: 16 }}>
              <Button
                mode="contained"
                onPress={onVerifyPress} // Submit verification code
                loading={loading}
                disabled={loading}
                buttonColor="#1BA8D8"
                style={{ borderRadius: 8 }}
              >
                <Text
                  variant={isSmallDevice ? "titleLarge" : "headlineSmall"}
                  style={{ color: "#fff", fontWeight: "700" }}
                >
                  Verify Email
                </Text>
              </Button>

              {/* Back button to edit info */}
              <Button
                mode="text"
                onPress={() => setPendingVerification(false)} // Go back to form
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

  // Main registration form
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        {/* Header with close button */}
        <View className="flex-row justify-between items-center px-0 pt-0 relative">
          <Header />
          <TouchableOpacity
            className="absolute right-4 top-2 p-2 z-10"
            onPress={() => router.back()} // Go back
          >
            <Ionicons name="close" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Page title */}
        <Text
          style={{
            textAlign: "center",
            marginBottom: isSmallDevice ? 16 : 24,
            marginTop: 16,
            fontWeight: "bold",
            fontSize: isSmallDevice ? 28 : 36,
          }}
        >
          Create an account
        </Text>

        {/* Registration form */}
        <View className="mx-4 border-2 border-[#1BA8D8] rounded-2xl px-4" style={{ paddingVertical: isSmallDevice ? 32 : 64 }}>
          {/* Form inputs */}
          <View style={{ gap: isSmallDevice ? 20 : 32 }}>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
            />

            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
            />

            <TextInput
              placeholder="Email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword} // Hide password by default
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
              right={
                <TextInput.Icon
                  icon={hidePassword ? "eye" : "eye-off"} // Toggle icon
                  onPress={() => setHidePassword(!hidePassword)} // Show/hide password
                />
              }
            />

            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={hideConfirmPassword} // Hide password by default
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
              right={
                <TextInput.Icon
                  icon={hideConfirmPassword ? "eye" : "eye-off"} // Toggle icon
                  onPress={() => setHideConfirmPassword(!hideConfirmPassword)} // Show/hide password
                />
              }
            />
          </View>

          {/* Submit button */}
          <View style={{ marginTop: isSmallDevice ? 16 : 24, gap: 16 }}>
            <Button
              mode="contained"
              onPress={onSignUpPress} // Submit registration
              loading={loading}
              disabled={loading}
              buttonColor="#1BA8D8"
              style={{ borderRadius: 8 }}
            >
              <Text variant={isSmallDevice ? "titleLarge" : "headlineSmall"} style={{ color: "#fff", fontWeight: "700" }}>
                Register
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
