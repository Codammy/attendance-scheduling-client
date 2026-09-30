import { Pressable, StyleSheet } from "react-native";
import Colors from "../constants/Color";

const ThemedButton = ({ otherStyles, onPress, full, disabled, ...props }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        full && styles.full,
        otherStyles,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  btn: {
    textAlign: "center",
    // Green (white label = 7.9:1) instead of the old yellow primary, where
    // white label text was 2.1:1 and the surface blended into the mint page.
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  full: {
    width: "80%",
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ThemedButton;
