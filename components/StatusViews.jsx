import { ActivityIndicator, Text, View } from "react-native";
import ThemedText from "./ThemedText";
import ThemedButton from "./ThemedButton";
import Spacer from "./Spacer";
import Colors from "../constants/Color";

// Content-only (no ThemedView wrapper) so screens can embed these inline —
// e.g. below a search bar that should stay visible while the list below it
// is loading/empty/errored — instead of replacing the whole screen.
const containerStyle = { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 };

export function LoadingView({ message = "Loading…" }) {
  return (
    <View style={containerStyle}>
      <ActivityIndicator size="large" color={Colors.secondary} />
      <Spacer />
      <ThemedText>{message}</ThemedText>
    </View>
  );
}

export function EmptyView({ message = "Nothing to show yet." }) {
  return (
    <View style={containerStyle}>
      <ThemedText styles={{ textAlign: "center" }}>{message}</ThemedText>
    </View>
  );
}

export function ErrorView({ message = "Something went wrong.", onRetry }) {
  return (
    <View style={containerStyle}>
      <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
        {message}
      </ThemedText>
      {onRetry ? (
        <>
          <Spacer />
          <ThemedButton onPress={onRetry}>
            <Text style={{ color: "white" }}>Retry</Text>
          </ThemedButton>
        </>
      ) : null}
    </View>
  );
}
