import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { Stack } from "expo-router";
import useProtectedRoute from "../hooks/useProtectedRoute";

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{
        headerShown: false
    }}>

    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
