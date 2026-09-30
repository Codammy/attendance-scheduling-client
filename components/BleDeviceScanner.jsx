import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Text,
  View,
  useColorScheme,
} from "react-native";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import ThemedButton from "../components/ThemedButton";
import Spacer from "../components/Spacer";
import { LoadingView, EmptyView, ErrorView } from "../components/StatusViews";
import useBleScanner from "../ble/useBleScanner";
import { PermissionResult } from "../ble/permissions";
import Colors from "../constants/Color";

// Reusable BLE device scanner component for admin/lecturer flows.
// Handles: permissions, scanning, device list, selection, empty/loading/error states,
// rescan, and cleanup. Designed to be embedded in other screens (not full-screen).
// Returns the selected device via onDeviceSelected callback.

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

export default function BleDeviceScanner({
  onDeviceSelected,
  title = "Nearby BLE Devices",
  subtitle = "Select the device you want to use.",
  showTitle = true,
  initialPhase = "intro",
  disabled = false,
  style,
}) {
  const scanner = useBleScanner();

  const [phase, setPhase] = useState(initialPhase);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [lastError, setLastError] = useState(null);

  // Keep discovered devices in sync during scanning
  useEffect(() => {
    if (phase === "scanning") {
      setDiscoveredDevices(scanner.devices);
    }
  }, [scanner.devices, phase]);

  // Auto-advance when scan completes
  useEffect(() => {
    if (phase === "scanning" && scanner.scanComplete) {
      setPhase("results");
    }
  }, [scanner.scanComplete, phase]);

  // Handle scan errors
  useEffect(() => {
    if (phase === "scanning" && scanner.scanError) {
      setPhase("scan-error");
      setLastError(scanner.scanError);
    }
  }, [scanner.scanError, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scanner.stopScan();
    };
  }, [scanner]);

  const resetToIntro = useCallback(() => {
    setPhase("intro");
    setDiscoveredDevices([]);
    setSelectedDevice(null);
    setLastError(null);
    if (onDeviceSelected) onDeviceSelected(null);
  }, [onDeviceSelected]);

  const handleStartScan = useCallback(async () => {
    setDiscoveredDevices([]);
    setSelectedDevice(null);
    setLastError(null);
    if (onDeviceSelected) onDeviceSelected(null);
    setPhase("scanning");

    const result = await scanner.startScan();
    if (result.outcome === "bluetooth-off") {
      setPhase("bluetooth-off");
    } else if (result.outcome === "permission") {
      setPhase(result.permission === PermissionResult.BLOCKED ? "permission-blocked" : "permission-denied");
    } else if (result.outcome === "error") {
      setPhase("scan-error");
      setLastError(result.message);
    }
  }, [scanner]);

  const handleStopAndContinue = useCallback(() => {
    scanner.stopScan();
    setPhase("results");
  }, [scanner]);

  const handleSelectDevice = useCallback((device) => {
    setSelectedDevice(device);
    if (onDeviceSelected) onDeviceSelected(device);
    setPhase("confirm");
  }, [onDeviceSelected]);

  const handleRescan = useCallback(() => {
    setSelectedDevice(null);
    if (onDeviceSelected) onDeviceSelected(null);
    handleStartScan();
  }, [handleStartScan, onDeviceSelected]);

  const handleChangeDevice = useCallback(() => {
    setSelectedDevice(null);
    if (onDeviceSelected) onDeviceSelected(null);
    setPhase("results");
  }, [onDeviceSelected]);

  const handleConfirm = useCallback(() => {
    // Just notify parent; parent handles submission
    // Phase stays at "confirm" until parent resets
  }, []);

  // --- Render by phase ---

  if (phase === "unsupported-platform") {
    return (
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
        <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
          Not Available on iOS Yet
        </ThemedText>
        <ThemedText styles={{ textAlign: "center", marginTop: 8 }}>
          iOS doesn't expose a Bluetooth device's real hardware identifier to apps.
          Please use an Android device for BLE attendance.
        </ThemedText>
      </ThemedView>
    );
  }

  if (phase === "intro") {
    return (
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
        {showTitle && (
          <>
            <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
              Scan for BLE Device
            </ThemedText>
            <ThemedText styles={{ textAlign: "center", marginTop: 8, color: Colors.iconColor }}>
              {subtitle}
            </ThemedText>
            <Spacer />
          </>
        )}
        <ThemedButton onPress={handleStartScan} disabled={disabled}>
          <Text style={{ color: "white" }}>Start Scanning</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "scanning") {
    return (
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
        <LoadingView message={`Scanning for nearby BLE devices… (${scanner.devices.length} found)`} />
        <ThemedButton onPress={handleStopAndContinue} otherStyles={{ backgroundColor: Colors.secondary, marginTop: 12 }}>
          <Text style={{ color: "white" }}>Stop & View Results</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "bluetooth-off") {
    return (
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
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
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
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
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
        <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
          Bluetooth permission was denied. Enable it from your device settings to scan.
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
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
        <ThemedText styles={{ textAlign: "center", color: Colors.warning }}>
          {lastError || "The Bluetooth scan failed."}
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
        <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
          <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
            No BLE Devices Found
          </ThemedText>
          <Spacer />
          <ThemedText styles={{ textAlign: "center" }}>
            Make sure the device is powered on and nearby, then try again.
          </ThemedText>
          <Spacer />
          <ThemedButton onPress={handleRescan}>
            <Text style={{ color: "white" }}>Rescan</Text>
          </ThemedButton>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={[{ paddingHorizontal: 16, flex: 1 }, style]}>
        {showTitle && (
          <>
            <Spacer />
            <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
              {title}
            </ThemedText>
            <Spacer />
            <ThemedText styles={{ textAlign: "center", color: Colors.iconColor }}>
              {subtitle}
            </ThemedText>
            <Spacer />
          </>
        )}
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

  if (phase === "confirm") {
    return (
      <ThemedView style={[{ paddingHorizontal: 24, justifyContent: "center" }, style]}>
        {showTitle && (
          <>
            <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
              Selected Device
            </ThemedText>
            <Spacer />
          </>
        )}
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
        <ThemedButton onPress={handleConfirm} disabled={!selectedDevice}>
          <Text style={{ color: "white" }}>Confirm Selection</Text>
        </ThemedButton>
        <Spacer />
        <ThemedButton
          onPress={handleChangeDevice}
          otherStyles={{ backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.secondary }}
        >
          <Text style={{ color: Colors.secondary }}>Change Device</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  return null;
}