import { useEffect, useState } from "react";
import { FlatList, Linking, Platform, Text, useColorScheme } from "react-native";
import ThemedView from "../../components/ThemedView";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import FormLabel from "../../components/FormLabel";
import Spacer from "../../components/Spacer";
import { LoadingView } from "../../components/StatusViews";
import useBleScanner from "../../ble/useBleScanner";
import { matchRegisteredDevices } from "../../ble/matchRegisteredDevice";
import { PermissionResult } from "../../ble/permissions";
import { signInAttendance } from "../../api/attendance";
import Colors from "../../constants/Color";

const BLUETOOTH_STATE_MESSAGES = {
  PoweredOff: "Bluetooth is turned off. Please enable Bluetooth and try again.",
  Unauthorized: "This app isn't authorized to use Bluetooth. Check your device's privacy settings.",
  Unsupported: "This device doesn't support Bluetooth Low Energy.",
  Resetting: "Bluetooth is resetting. Please try again in a moment.",
};

function DeviceRow({ device, onPress }) {
  const theme = Colors[useColorScheme() ?? "light"];
  return (
    <ThemedButton
      onPress={() => onPress(device)}
      otherStyles={{
        width: "100%",
        backgroundColor: theme.uiBackground,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "flex-start",
        marginBottom: 10,
      }}
    >
      <ThemedText isHeader styles={{ fontSize: 15 }}>
        {device.alias || device.name || "Unnamed device"}
      </ThemedText>
      <ThemedText styles={{ fontSize: 12 }}>{device.id}</ThemedText>
    </ThemedButton>
  );
}

export default function StudentSignIn() {
  const scanner = useBleScanner();

  const [phase, setPhase] = useState(Platform.OS === "android" ? "intro" : "unsupported-platform");
  const [candidates, setCandidates] = useState([]);
  const [matchWarning, setMatchWarning] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  // dept is optional on SignInRequest — prefilled from the matched session
  // when known (see resolveMatches), otherwise left for the student to enter.
  const [dept, setDept] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Cleanup on unmount is handled inside useBleScanner itself.

  async function resolveMatches() {
    const found = scanner.devices;
    if (found.length === 0) {
      setPhase("no-devices");
      return;
    }

    setPhase("resolving");
    try {
      const matches = await matchRegisteredDevices(found);
      setMatchWarning(null);
      if (matches.length === 0) {
        setPhase("no-match");
        return;
      }
      if (matches.length === 1) {
        setSelectedDevice(matches[0]);
        if (matches[0].session?.dept) setDept(matches[0].session.dept);
        setPhase("confirm");
        return;
      }
      setCandidates(matches);
      setPhase("select");
    } catch (err) {
      // Couldn't load attendance sessions to match against (e.g. a network
      // failure) — fall back to manual selection from the raw scan results
      // rather than blocking sign-in entirely.
      setMatchWarning(
        err.message ||
          "Couldn't verify which device is registered. Select the correct device below."
      );
      setCandidates(found);
      setPhase("select");
    }
  }

  // Natural scan completion (timeout elapsed) — asynchronous, so it can't be
  // captured by handleStartScan's return value; must be observed reactively.
  useEffect(() => {
    if (phase === "scanning" && scanner.scanComplete) {
      resolveMatches();
    }
  }, [scanner.scanComplete, phase]);

  useEffect(() => {
    if (phase === "scanning" && scanner.scanError) {
      setPhase("scan-error");
    }
  }, [scanner.scanError, phase]);

  function resetToIntro() {
    setPhase("intro");
    setCandidates([]);
    setMatchWarning(null);
    setSelectedDevice(null);
    setSubmitError(null);
    setSuccessMessage(null);
  }

  async function handleStartScan() {
    setCandidates([]);
    setMatchWarning(null);
    setSelectedDevice(null);
    setSubmitError(null);
    setSuccessMessage(null);
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
    resolveMatches();
  }

  function handleSelectDevice(device) {
    setSelectedDevice(device);
    if (device.session?.dept) setDept(device.session.dept);
    setPhase("confirm");
  }

  async function handleConfirmSignIn() {
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
          Your device will scan for nearby Bluetooth devices and match them
          against the registered classroom device for your session.
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
        <LoadingView message={`Scanning for devices… (${scanner.devices.length} found)`} />
        <ThemedButton onPress={handleStopAndContinue} otherStyles={{ backgroundColor: Colors.secondary }}>
          <Text style={{ color: "white" }}>Stop &amp; Continue</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "resolving") {
    return (
      <ThemedView>
        <LoadingView message="Checking registered devices…" />
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

  if (phase === "no-devices") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText styles={{ textAlign: "center" }}>
          No nearby Bluetooth devices were found. Move closer to the
          classroom device and try again.
        </ThemedText>
        <Spacer />
        <ThemedButton onPress={handleStartScan}>
          <Text style={{ color: "white" }}>Scan Again</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "no-match") {
    return (
      <ThemedView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText styles={{ textAlign: "center" }}>
          Found {scanner.devices.length} nearby device
          {scanner.devices.length === 1 ? "" : "s"}, but none is a registered
          attendance device.
        </ThemedText>
        <Spacer />
        <ThemedButton onPress={handleStartScan}>
          <Text style={{ color: "white" }}>Scan Again</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (phase === "select") {
    return (
      <ThemedView style={{ paddingHorizontal: 16 }}>
        <Spacer />
        <ThemedText isHeader styles={{ fontSize: 16 }}>
          Select the attendance device
        </ThemedText>
        {matchWarning ? (
          <>
            <Spacer />
            <ThemedText styles={{ color: Colors.warning }}>{matchWarning}</ThemedText>
          </>
        ) : null}
        <Spacer />
        <FlatList
          style={{ flex: 1, width: "100%" }}
          data={candidates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DeviceRow device={item} onPress={handleSelectDevice} />}
        />
      </ThemedView>
    );
  }

  if (phase === "confirm" || phase === "submitting" || phase === "submit-error") {
    return (
      <DismissKeyboardView style={{ justifyContent: "center", paddingHorizontal: 24 }}>
        <ThemedText isHeader styles={{ fontSize: 18, textAlign: "center" }}>
          {selectedDevice.alias || selectedDevice.name || "Selected Device"}
        </ThemedText>
        <ThemedText styles={{ textAlign: "center", fontSize: 12 }}>{selectedDevice.id}</ThemedText>
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
        <ThemedButton onPress={handleConfirmSignIn} disabled={phase === "submitting"}>
          <Text style={{ color: "white" }}>
            {phase === "submitting" ? "Signing In…" : "Confirm Sign In"}
          </Text>
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
