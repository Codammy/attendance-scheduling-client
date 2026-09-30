import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, Image } from "react-native";
import { useRef, useState } from "react";
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
  const passwordRef = useRef(null);

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
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!isSubmitting}
      />
      <Spacer />
      <ThemedInput
        full
        secure
        ref={passwordRef}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!isSubmitting}
      />
      <Spacer />
      {error ? (
        <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{error}</ThemedText>
      ) : null}
      <Spacer />
      <ThemedButton onPress={handleSubmit} disabled={isSubmitting} full>
        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>Login</Text>}
      </ThemedButton>
    </DismissKeyboardView>
  );
}
