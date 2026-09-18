import { useState } from "react";
import { Text } from "react-native";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import Spacer from "../../components/Spacer";
import { invite, reInvite } from "../../api/auth";
import Colors from "../../constants/Color";

const ROLES = ["STUDENT", "LECTURER"];

export default function AdminInvite() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(sendFn, successText) {
    if (!username.trim() || !email.trim()) {
      setError("Please enter a username and email.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await sendFn({ username: username.trim(), email: email.trim(), role });
      setSuccessMessage(successText);
    } catch (err) {
      setError(err.message || "Unable to send invite.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DismissKeyboardView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
      <ThemedInput full placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <Spacer />
      <ThemedInput full placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Spacer />

      <ThemedText>Role</ThemedText>
      <Spacer />
      {ROLES.map((r) => (
        <ThemedButton
          key={r}
          otherStyles={{
            width: "100%",
            marginBottom: 10,
            backgroundColor: role === r ? Colors.secondary : Colors.primary,
          }}
          onPress={() => setRole(r)}
        >
          <Text style={{ color: "white" }}>{r === "STUDENT" ? "Student" : "Lecturer"}</Text>
        </ThemedButton>
      ))}

      <Spacer />
      {error ? (
        <>
          <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{error}</ThemedText>
          <Spacer />
        </>
      ) : null}
      {successMessage ? (
        <>
          <ThemedText styles={{ color: Colors.secondary, textAlign: "center" }}>{successMessage}</ThemedText>
          <Spacer />
        </>
      ) : null}

      <ThemedButton
        onPress={() => handleSubmit(invite, "Invite sent.")}
        disabled={isSubmitting}
        otherStyles={{ marginBottom: 10 }}
      >
        <Text style={{ color: "white" }}>{isSubmitting ? "Sending…" : "Send Invite"}</Text>
      </ThemedButton>
      <ThemedButton
        onPress={() => handleSubmit(reInvite, "Invite resent.")}
        disabled={isSubmitting}
        otherStyles={{ backgroundColor: Colors.secondary }}
      >
        <Text style={{ color: "white" }}>Resend Invite</Text>
      </ThemedButton>
    </DismissKeyboardView>
  );
}
