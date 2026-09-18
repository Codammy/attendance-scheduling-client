import { View, useColorScheme } from "react-native";
import ThemedText from "./ThemedText";
import Colors from "../constants/Color";

// Backend Status enum is exactly: ACTIVE, EXPIRED, OPEN, DEACTIVATED,
// INACTIVE — rendered here with a distinct tone each. Any other value
// (should never happen, but the frontend must not assume the enum is
// exhaustive) falls back to a neutral outline showing the raw string.
const FILLED_COLOR = {
  ACTIVE: Colors.secondary,
  OPEN: Colors.primary,
  EXPIRED: Colors.warning,
};

export default function StatusBadge({ status }) {
  const theme = Colors[useColorScheme() ?? "light"];
  if (!status) return null;

  const fill = FILLED_COLOR[status];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: fill || theme.uiBackground,
        borderWidth: fill ? 0 : 1,
        borderColor: theme.border,
      }}
    >
      <ThemedText styles={{ fontSize: 12, color: fill ? "white" : theme.text }}>{status}</ThemedText>
    </View>
  );
}
