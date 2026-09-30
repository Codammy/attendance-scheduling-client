import ThemedText from "./ThemedText";
import Colors from "../constants/Color";

// Small label above a form input. Stands in for the placeholder, which
// disappears (or is the only hint before the field is prefilled) — same
// style as FieldRow labels for consistency.
export default function FormLabel({ children }) {
  return (
    <ThemedText styles={{ color: Colors.secondary, fontSize: 12, marginBottom: 4 }}>
      {children}
    </ThemedText>
  );
}
