import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import FormLabel from "../../components/FormLabel";
import Spacer from "../../components/Spacer";
import BleDeviceScanner from "../../components/BleDeviceScanner";
import { createBleDevice } from "../../api/ble";
import Colors from "../../constants/Color";

export default function AdminDeviceCreate() {
  const router = useRouter();
  const [alias, setAlias] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  async function handleSubmit() {
    if (!selectedDevice || !alias.trim()) {
      setError("Please scan and select a BLE device, and enter an alias.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // Use the scanned device's hardware ID (device.id) directly
      const data = await createBleDevice({ deviceID: selectedDevice.id, alias: alias.trim() });
      router.replace(`/admin-device/${data.publicId}`);
    } catch (err) {
      setError(err.message || "Unable to register this device.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeviceSelected(device) {
    setSelectedDevice(device);
  }

  function handleRescan() {
    setSelectedDevice(null);
  }

  return (
    <DismissKeyboardView style={{ justifyContent: "center", paddingHorizontal: 24, flex: 1 }}>
      <BleDeviceScanner
        onDeviceSelected={handleDeviceSelected}
        title="Register BLE Device"
        subtitle="Scan for the classroom BLE device and select it to register."
        showTitle={true}
        initialPhase="intro"
      />
      {selectedDevice && (
        <>
          <Spacer />
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
          <ThemedButton onPress={handleSubmit} disabled={isSubmitting || !selectedDevice}>
            <Text style={{ color: "white" }}>{isSubmitting ? "Registering…" : "Register Device"}</Text>
          </ThemedButton>
          <Spacer />
          <ThemedButton
            onPress={handleRescan}
            otherStyles={{ backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.secondary }}
          >
            <Text style={{ color: Colors.secondary }}>Rescan / Change Device</Text>
          </ThemedButton>
        </>
      )}
    </DismissKeyboardView>
  );
}