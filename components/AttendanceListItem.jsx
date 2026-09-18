import { Pressable, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import ThemedText from "./ThemedText";
import StatusBadge from "./StatusBadge";
import Colors from "../constants/Color";
import { formatDateTime } from "../utils/date";

export default function AttendanceListItem({ record, onPress }) {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();
  const handlePress = onPress ?? (() => router.push(`/student-attendance/${record.publicId}`));

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          width: "100%",
          padding: 16,
          borderRadius: 10,
          backgroundColor: theme.uiBackground,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 12,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <ThemedText isHeader styles={{ fontSize: 16, flexShrink: 1 }}>
          {record.courseCode}
        </ThemedText>
        <StatusBadge status={record.status} />
      </View>
      {record.dept ? <ThemedText styles={{ marginTop: 2 }}>{record.dept}</ThemedText> : null}
      <ThemedText styles={{ marginTop: 6, color: theme.iconColor }}>
        Valid till {formatDateTime(record.validTill)}
      </ThemedText>
    </Pressable>
  );
}
