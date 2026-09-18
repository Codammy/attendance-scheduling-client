import { View } from "react-native";
import ThemedText from "./ThemedText";
import Spacer from "./Spacer";
import Colors from "../constants/Color";

export default function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={{ alignItems: "flex-start", width: "100%" }}>
      <ThemedText styles={{ color: Colors.secondary, fontSize: 12 }}>{label}</ThemedText>
      <ThemedText styles={{ fontSize: 16 }}>{value}</ThemedText>
      <Spacer />
    </View>
  );
}
