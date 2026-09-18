import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedButton from "../components/ThemedButton";
import Spacer from "../components/Spacer";
import useAuth from "../hooks/useAuth";
import logo from "../assets/android-icon-background.png";
import Colors from "../constants/Color";

// App entry point. `useProtectedRoute` (mounted in the root layout) already
// sends unauthenticated users to /login from anywhere in the app — this
// screen's only job is routing an authenticated user to their role's
// dashboard once the stored session has been restored.
export default function Index() {
  const { isAuthenticated, isRestoring, user, logout } = useAuth();
  const router = useRouter();
  const role = user?.role?.toLowerCase();

  useEffect(() => {
    if (isRestoring || !isAuthenticated || !role) return;
    router.replace(`/${role}`);
  }, [isRestoring, isAuthenticated, role, router]);

  if (!isRestoring && isAuthenticated && !role) {
    // Authenticated, but the backend didn't give us a role to route on.
    // Do not guess a destination — surface it instead of silently failing.
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <StatusBar style="auto" />
        <ThemedText isHeader>Unable to determine your role</ThemedText>
        <Spacer />
        <ThemedText styles={{ textAlign: "center" }}>
          You're signed in, but we couldn't find a role on your account.
          Please contact an administrator.
        </ThemedText>
        <Spacer />
        <Spacer />
        <ThemedButton onPress={logout}>
          <Text style={{ color: "white" }}>Log out</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ justifyContent: "center" }}>
      <StatusBar style="auto" />
      <Image source={logo} style={{ width: 300, height: 100 }} />
      <Spacer />
      <ActivityIndicator size="large" color={Colors.secondary} />
      <Spacer />
      <ThemedText>Loading…</ThemedText>
    </ThemedView>
  );
}
