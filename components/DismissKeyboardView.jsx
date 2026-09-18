import { Keyboard, TouchableWithoutFeedback } from "react-native";
import ThemedView from "./ThemedView";

// Same tap-outside-to-dismiss pattern as the login screen, extracted for
// reuse across every multi-field form screen.
export default function DismissKeyboardView({ style, children, ...props }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={style} {...props}>
        {children}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
