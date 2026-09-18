import { useCallback, useEffect, useState } from "react";
import { Alert, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import DismissKeyboardView from "../../../components/DismissKeyboardView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import ThemedInput from "../../../components/ThemedInput";
import Spacer from "../../../components/Spacer";
import { LoadingView, ErrorView } from "../../../components/StatusViews";
import { getBleDeviceById, updateBleDevice, deleteBleDevice } from "../../../api/ble";
import Colors from "../../../constants/Color";

export default function AdminDeviceDetail() {
  const { publicId } = useLocalSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [deviceID, setDeviceID] = useState("");
  const [alias, setAlias] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getBleDeviceById(publicId);
      setDeviceID(data.deviceID);
      setAlias(data.alias);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load this device.");
      setStatus("error");
    }
  }, [publicId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!deviceID.trim() || !alias.trim()) {
      setSaveError("Please enter both a device ID and an alias.");
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      await updateBleDevice(publicId, { deviceID: deviceID.trim(), alias: alias.trim() });
      router.back();
    } catch (err) {
      setSaveError(err.message || "Unable to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete Device",
      `Remove "${alias}" from registered devices? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ]
    );
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBleDevice(publicId);
      router.back();
    } catch (err) {
      setSaveError(err.message || "Unable to delete this device.");
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <ThemedView>
        <LoadingView message="Loading device…" />
      </ThemedView>
    );
  }
  if (status === "error") {
    return (
      <ThemedView>
        <ErrorView message={error} onRetry={load} />
      </ThemedView>
    );
  }

  const busy = isSaving || isDeleting;

  return (
    <DismissKeyboardView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
      <ThemedInput
        full
        placeholder="Device ID (BLE address)"
        value={deviceID}
        onChangeText={setDeviceID}
        autoCapitalize="characters"
        editable={!busy}
      />
      <Spacer />
      <ThemedInput full placeholder="Alias" value={alias} onChangeText={setAlias} editable={!busy} />
      <Spacer />
      {saveError ? (
        <>
          <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{saveError}</ThemedText>
          <Spacer />
        </>
      ) : null}
      <ThemedButton onPress={handleSave} disabled={busy} otherStyles={{ marginBottom: 10 }}>
        <Text style={{ color: "white" }}>{isSaving ? "Saving…" : "Save Changes"}</Text>
      </ThemedButton>
      <ThemedButton onPress={confirmDelete} disabled={busy} otherStyles={{ backgroundColor: Colors.warning }}>
        <Text style={{ color: "white" }}>{isDeleting ? "Deleting…" : "Delete Device"}</Text>
      </ThemedButton>
    </DismissKeyboardView>
  );
}
