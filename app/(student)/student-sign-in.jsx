import { useEffect, useState } from "react";
import { FlatList, Linking, Platform, Text, useColorScheme } from "react-native";
import ThemedView from "../../components/ThemedView";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import FormLabel from "../../components/FormLabel";
import Spacer from "../../components/Spacer";
import { LoadingView, EmptyView, ErrorView } from "../../components/StatusViews";
import useBleScanner from "../../ble/useBleScanner";
import { PermissionResult } from "../../ble/permissions";
import { signInAttendance } from "../../api/attendance";
import Colors from "../../constants/Color";

const BLUETOOTH_STATE_MESSAGES = {
  PoweredOff: "Bluetooth is turned off. Please enable Bluetooth and try again.",
  Unauthorized: "This app isn't authorized to use Bluetooth. Check your device's privacy settings.",
  Unsupported: "This device doesn't support Bluetooth Low Energy.",
  Resetting: "Bluetooth is resetting. Please try again in a moment.",
};

function DeviceRow({ device, onPress, isSelected }) {
  const theme = Colors[useColorScheme() ?? "light"];
  return (
    <ThemedButton
      onPress={() => onPress(device)}
      otherStyles={{
        width: "100%",
        backgroundColor: isSelected ? Colors.secondary : theme.uiBackground,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? Colors.secondary : theme.border,
        alignItems: "flex-start",
        marginBottom: 10,
      }}
    >
      <ThemedText
        isHeader
        styles={{
          fontSize: 15,
          color: isSelected ? "#FFFFFF" : theme.title,
        }}
      >
        {device.name || device.localName || "Unknown BLE Device"}
      </ThemedText>
      <ThemedText
        styles={{
          fontSize: 12,
          color: isSelected ? "#D7ECDA" : theme.iconColor,
        }}
      >
        ID: {device.id}
      </ThemedText>
      <ThemedText
        styles={{
          fontSize: 12,
          marginTop: 2,
          color: isSelected ? "#D7ECDA" : theme.iconColor,
        }}
      >
        Signal: {device.rssi ?? "N/A"} dBm
      </ThemedText>
      <ThemedText
        styles={{
          fontSize: 13,
          marginTop: 6,
          fontWeight: "600",
          color: isSelected ? "#FFFFFF" : Colors.secondary,
        }}
      >
        {isSelected ? "✓ Selected" : "Select"}
      </ThemedText>
    </ThemedButton>
  );
}

export default function StudentSignIn() {
  const scanner = useBleScanner();

  const [phase, setPhase] = useState(Platform.OS === "android" ? "intro" : "unsupported-platform");
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [dept, setDept] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Natural scan completion (timeout elapsed) — asynchronous, so it can't be
  // captured by handleStartScan's return value; must be observed reactively.
  useEffect(() => {
    if (phase === "scanning" && scanner.scanComplete) {
      setPhase("results");
    }
  }, [scanner.scanComplete, phase]);

  useEffect(() => {
    if (phase === "scanning" && scanner.scanError) {
      setPhase("scan-error");
    }
  }, [scanner.scanError, phase]);

  // Update discovered devices list reactively during scanning
  useEffect(() => {
    if (phase === "scanning") {
      setDiscoveredDevices(scanner.devices);
    }
  }, [scanner.devices, phase]);

  function resetToIntro() {
    setPhase("intro");
    setDiscoveredDevices([]);
    setSelectedDevice(null);
    setSubmitError(null);
    setSuccessMessage(null);
    setDept("");
  }

  async function handleStartScan() {
    setDiscoveredDevices([]);
    setSelectedDevice(null);
    setSubmitError(null);
    setSuccessMessage(null);
    setDept("");
    setPhase("scanning");

    const result = await scanner.startScan();
    if (result.outcome === "bluetooth-off") {
      setPhase("bluetooth-off");
    } else if (result.outcome === "permission") {
      setPhase(result.permission === PermissionResult.BLOCKED ? "permission-blocked" : "permission-denied");
    } else if (result.outcome === "error") {
      setPhase("scan-error");
    }
    // "started" — stays on "scanning"; resolved reactively above.
  }

  function handleStopAndContinue() {
    scanner.stopScan();
    setPhase("results");
  }

  function handleSelectDevice(device) {
    setSelectedDevice(device);
    setPhase("confirm");
  }

  function handleRescan() {
    setSelectedDevice(null);
    handleStartScan();
  }

  async function handleConfirmSignIn() {
    if (!selectedDevice) {
      setSubmitError("Please select a BLE device first.");
      return;
    }
    setPhase("submitting");
    try {
      const data = await signInAttendance({
        bleDeviceID: selectedDevice.id,
        dept: dept.trim() || undefined,
      });
      setSuccessMessage(data?.message || "Attendance recorded successfully.");
      setPhase("success");
    } catch (err) {
      setSubmitError(err.message || "Sign-in failed. Please try again.");
      setPhase("submit-error");
    }
  }

  if (phase === "unsupported-platform") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText isHeader styles={{ fontSize: 20, textAlign: "center" }}>
          Not Available on iOS Yet
        </ThemedText>
        <Spacer />
        <ThemedText styles={{ textAlign: "center" }}>
          iOS doesn't expose a Bluetooth device's real hardware identifier to
          apps, so BLE attendance sign-in can't reliably match a registered
          classroom device yet. Please use an Android device for now.
        </ThemedText>
      </ThemedView>
    );
  }

  if (phase === "intro") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText isHeader styles={{ fontSize: 20, textAlign: "center" }}>
          BLE Attendance Sign-In
        </ThemedText>
        <Spacer />
        <ThemedText styles={{ textAlign: "center" }}>
          Scan for nearby classroom BLE devices and select the one you are
          signing in to.
        </ThemedText>
        <Spacer />
        <Spacer />
        <ThemedButton onPress={handleStartScan}>
          <Text style={{ color: "white" }}>Start Scanning</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "scanning") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <LoadingView message={`Scanning for nearby BLE devices… (${scanner.devices.length} found)`} />
        <ThemedButton onPress={handleStopAndContinue} otherStyles={{ backgroundColor: Colors.secondary }}>
          <Text style={{ color: "white" }}>Stop & View Results</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "bluetooth-off") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
          {BLUETOOTH_STATE_MESSAGES[scanner.bluetoothState] ||
            "Bluetooth isn't ready. Please check your settings and try again."}
        </ThemedText>
        <Spacer />
        <ThemedButton onPress={handleStartScan}>
          <Text style={{ color: "white" }}>Try Again</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "permission-denied") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
          Bluetooth permission is required to scan for the attendance device.
        </ThemedText>
        <Spacer />
        <ThemedButton onPress={handleStartScan}>
          <Text style={{ color: "white" }}>Grant Permission</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "permission-blocked") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
          Bluetooth permission was denied. Enable it from your device
          settings to sign in.
        </ThemedText>
        <Spacer />
        <ThemedButton onPress={() => Linking.openSettings()}>
          <Text style={{ color: "white" }}>Open Settings</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "scan-error") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
          {scanner.scanError || "The Bluetooth scan failed."}
        </ThemedText>
        <Spacer />
        <ThemedButton onPress={handleStartScan}>
          <Text style={{ color: "white" }}>Try Again</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "results") {
    if (discoveredDevices.length === 0) {
      return (
        <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
          <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
            No BLE Devices Found
          </ThemedText>
          <Spacer />
          <ThemedText styles={{ textAlign: "center" }}>
            Make sure the attendance device is powered on and nearby, then try again.
          </ThemedText>
          <Spacer />
          <ThemedButton onPress={handleRescan}>
            <Text style={{ color: "white" }}>Rescan</Text>
          </ThemedButton>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={{ paddingHorizontal: 16, flex: 1 }}>
        <Spacer />
        <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
          Nearby BLE Devices
        </ThemedText>
        <Spacer />
        <ThemedText styles={{ textAlign: "center", color: Colors.iconColor }}>
          Select the device you are signing in to.
        </ThemedText>
        <Spacer />
        <FlatList
          style={{ flex: 1, width: "100%" }}
          data={discoveredDevices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DeviceRow
              device={item}
              onPress={handleSelectDevice}
              isSelected={selectedDevice?.id === item.id}
            />
          )}
          ListFooterComponent={
            <ThemedButton onPress={handleRescan} otherStyles={{ marginTop: 10 }}>
              <Text style={{ color: "white" }}>Rescan</Text>
            </ThemedButton>
          }
        />
      </ThemedView>
    );
  }

  if (phase === "confirm" || phase === "submitting" || phase === "submit-error") {
    return (
      <DismissKeyboardView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
          Selected Device
        </ThemedText>
        <Spacer />
        <ThemedText isHeader styles={{ fontSize: 16, textAlign: "center" }}>
          {selectedDevice?.name || selectedDevice?.localName || "Unknown BLE Device"}
        </ThemedText>
        <ThemedText styles={{ textAlign: "center", fontSize: 12, color: Colors.iconColor }}>
          ID: {selectedDevice?.id}
        </ThemedText>
        <ThemedText styles={{ textAlign: "center", fontSize: 12, color: Colors.iconColor }}>
          Signal: {selectedDevice?.rssi ?? "N/A"} dBm
        </ThemedText>
        <Spacer />
        <FormLabel>Department (optional)</FormLabel>
        <ThemedInput
          full
          placeholder="e.g. Computer Science"
          value={dept}
          onChangeText={setDept}
          editable={phase === "confirm"}
        />
        <Spacer />
        {phase === "submit-error" ? (
          <>
            <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
              {submitError}
            </ThemedText>
            <Spacer />
          </>
        ) : null}
        <ThemedButton onPress={handleConfirmSignIn} disabled={phase === "submitting" || !selectedDevice}>
          <Text style={{ color: "white" }}>
            {phase === "submitting" ? "Signing In…" : "Confirm Sign In"}
          </Text>
        </ThemedButton>
        <Spacer />
        <ThemedButton
          onPress={() => {
            setSelectedDevice(null);
            setPhase("results");
          }}
          otherStyles={{ backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.secondary }}
        >
          <Text style={{ color: Colors.secondary }}>Change Device</Text>
        </ThemedButton>
      </DismissKeyboardView>
    );
  }

  if (phase === "success") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText isHeader styles={{ fontSize: 20, textAlign: "center", color: Colors.secondary }}>
          Attendance Recorded
        </ThemedText>
        <Spacer />
        <ThemedText styles={{ textAlign: "center" }}>{successMessage}</ThemedText>
        <Spacer />
        <Spacer />
        <ThemedButton onPress={resetToIntro}>
          <Text style={{ color: "white" }}>Done</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  return null;
}