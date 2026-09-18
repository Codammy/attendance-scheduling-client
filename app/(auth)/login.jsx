import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, Image } from "react-native";
import { useState } from "react";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import Spacer from "../../components/Spacer";
import logo from "../../assets/android-icon-background.png";
import useAuth from "../../hooks/useAuth";
import Colors from "../../constants/Color";

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      // No navigation here — useProtectedRoute (root layout) redirects away
      // from the (auth) group as soon as isAuthenticated flips true.
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DismissKeyboardView style={{ justifyContent: "center" }}>
      <StatusBar style="auto" />
      <Image source={logo} style={{ width: 300, height: 100 }} />
      <Spacer />
      <Spacer />
      <ThemedInput
        full
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isSubmitting}
      />
      <Spacer />
      <ThemedInput
        full
        secure
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        editable={!isSubmitting}
      />
      <Spacer />
      {error ? <ThemedText styles={{ color: Colors.warning }}>{error}</ThemedText> : null}
      <Spacer />
      <ThemedButton onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>Login</Text>}
      </ThemedButton>
    </DismissKeyboardView>
  );
}
