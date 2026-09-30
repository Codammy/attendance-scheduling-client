import { Pressable, useColorScheme } from "react-native";
import ThemedText from "./ThemedText";
import Colors from "../constants/Color";

export default function BleDeviceListItem({ device, onPress, selected }) {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <Pressable
      onPress={() => onPress(device)}
      style={({ pressed }) => [
        {
          width: "100%",
          padding: 16,
          borderRadius: 10,
          backgroundColor: theme.uiBackground,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? Colors.secondary : theme.border,
          marginBottom: 12,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <ThemedText isHeader styles={{ fontSize: 16 }}>
        {selected ? "✓ " : ""}
        {device.alias || "Unnamed device"}
      </ThemedText>
      <ThemedText styles={{ marginTop: 2, color: theme.iconColor }}>{device.deviceID}</ThemedText>
    </Pressable>
  );
}
