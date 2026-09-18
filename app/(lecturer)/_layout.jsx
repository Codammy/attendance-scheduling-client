import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import Colors from "../../constants/Color";

const LecturerLayout = () => {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.title },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="lecturer" options={{ title: "Dashboard", headerShown: false }} />
      <Stack.Screen name="lecturer-sessions" options={{ title: "Attendance Sessions" }} />
      <Stack.Screen name="lecturer-session-create" options={{ title: "New Session" }} />
      <Stack.Screen name="lecturer-session/[publicId]" options={{ title: "Session Details" }} />
      <Stack.Screen name="lecturer-profile" options={{ title: "Profile" }} />
    </Stack>
  );
};

export default LecturerLayout;
