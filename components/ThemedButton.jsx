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
    backgroundColor: Colors.primary,
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
