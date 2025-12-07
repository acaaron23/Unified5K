import * as React from "react";
import {
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Dimensions,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [hidePassword, setHidePassword] = React.useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = React.useState(true);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
      Alert.alert("Success", "Verification code sent to your email!");
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || "Sign up failed";
      Alert.alert("Error", errorMessage);
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

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
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

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="flex-row justify-between items-center px-0 pt-0 relative">
            <Header />
            <TouchableOpacity
              className="absolute right-4 top-2 p-2 z-10"
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={32} color="#000" />
            </TouchableOpacity>
          </View>

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

          <View className="mx-4 border-2 border-[#1BA8D8] rounded-2xl px-4" style={{ paddingVertical: isSmallDevice ? 32 : 64 }}>
            <Text className="text-center text-gray-600 mb-4 text-sm">
              We sent a verification code to {emailAddress}
            </Text>

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

            <View style={{ marginTop: isSmallDevice ? 16 : 24, gap: 16 }}>
              <Button
                mode="contained"
                onPress={onVerifyPress}
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <View className="flex-row justify-between items-center px-0 pt-0 relative">
          <Header />
          <TouchableOpacity
            className="absolute right-4 top-2 p-2 z-10"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={32} color="#000" />
          </TouchableOpacity>
        </View>

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

        <View className="mx-4 border-2 border-[#1BA8D8] rounded-2xl px-4" style={{ paddingVertical: isSmallDevice ? 32 : 64 }}>
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
              secureTextEntry={hidePassword}
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
              right={
                <TextInput.Icon
                  icon={hidePassword ? "eye" : "eye-off"}
                  onPress={() => setHidePassword(!hidePassword)}
                />
              }
            />

            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={hideConfirmPassword}
              mode="outlined"
              outlineColor="#1BA8D8"
              activeOutlineColor="#1BA8D8"
              style={{ backgroundColor: "#fff" }}
              right={
                <TextInput.Icon
                  icon={hideConfirmPassword ? "eye" : "eye-off"}
                  onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                />
              }
            />
          </View>

          <View style={{ marginTop: isSmallDevice ? 16 : 24, gap: 16 }}>
            <Button
              mode="contained"
              onPress={onSignUpPress}
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
