import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import Colors from "../../constants/Color";

const AdminLayout = () => {
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
      <Stack.Screen name="admin" options={{ title: "Dashboard", headerShown: false }} />
      <Stack.Screen name="admin-invite" options={{ title: "Invite User" }} />
      <Stack.Screen name="admin-sessions" options={{ title: "All Attendance Sessions" }} />
      <Stack.Screen name="admin-session/[publicId]" options={{ title: "Session Details" }} />
      <Stack.Screen name="admin-devices" options={{ title: "BLE Devices" }} />
      <Stack.Screen name="admin-device-create" options={{ title: "New Device" }} />
      <Stack.Screen name="admin-device/[publicId]" options={{ title: "Device Details" }} />
      <Stack.Screen name="admin-profile" options={{ title: "Profile" }} />
    </Stack>
  );
};

export default AdminLayout;
