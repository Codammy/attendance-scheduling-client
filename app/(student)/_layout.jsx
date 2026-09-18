import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import Colors from "../../constants/Color";

const StudentLayout = () => {
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
      <Stack.Screen name="student" options={{ title: "Dashboard", headerShown: false }} />
      <Stack.Screen name="student-history" options={{ title: "Attendance History" }} />
      <Stack.Screen name="student-sign-in" options={{ title: "Sign In" }} />
      <Stack.Screen name="student-profile" options={{ title: "Profile" }} />
      <Stack.Screen name="student-attendance/[publicId]" options={{ title: "Attendance Details" }} />
    </Stack>
  );
};

export default StudentLayout;
