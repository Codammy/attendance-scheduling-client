import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import FormLabel from "../../components/FormLabel";
import Spacer from "../../components/Spacer";
import { createBleDevice } from "../../api/ble";
import Colors from "../../constants/Color";

export default function AdminDeviceCreate() {
  const router = useRouter();
  const [deviceID, setDeviceID] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!deviceID.trim() || !alias.trim()) {
      setError("Please enter both a device ID and an alias.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const data = await createBleDevice({ deviceID: deviceID.trim(), alias: alias.trim() });
      router.replace(`/admin-device/${data.publicId}`);
    } catch (err) {
      setError(err.message || "Unable to register this device.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DismissKeyboardView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
      <ThemedText styles={{ textAlign: "center" }}>
        Enter the classroom BLE device's hardware identifier (as registered
        by its manufacturer/firmware) and a friendly name for it.
      </ThemedText>
      <Spacer />
      <Spacer />
      <FormLabel>Device ID (BLE address)</FormLabel>
      <ThemedInput
        full
        placeholder="e.g. AA:BB:CC:DD:EE:FF"
        value={deviceID}
        onChangeText={setDeviceID}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Spacer />
      <FormLabel>Alias</FormLabel>
      <ThemedInput full placeholder="e.g. Room 101" value={alias} onChangeText={setAlias} />
      <Spacer />
      {error ? (
        <>
          <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{error}</ThemedText>
          <Spacer />
        </>
      ) : null}
      <ThemedButton onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={{ color: "white" }}>{isSubmitting ? "Registering…" : "Register Device"}</Text>
      </ThemedButton>
    </DismissKeyboardView>
  );
}
