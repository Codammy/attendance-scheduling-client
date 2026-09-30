import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import FormLabel from "../../components/FormLabel";
import Spacer from "../../components/Spacer";
import BleDeviceScanner from "../../components/BleDeviceScanner";
import { LoadingView } from "../../components/StatusViews";
import { createAttendance } from "../../api/attendance";
import { parseDateTimeInputs } from "../../utils/date";
import Colors from "../../constants/Color";

export default function LecturerSessionCreate() {
  const router = useRouter();

  const [courseCode, setCourseCode] = useState("");
  const [dept, setDept] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [scannerPhase, setScannerPhase] = useState("idle"); // idle, scanning, confirm
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleDeviceSelected(device) {
    setSelectedDevice(device);
    if (device) {
      setScannerPhase("confirm");
    } else {
      setScannerPhase("idle");
    }
  }

  function handleRescan() {
    setSelectedDevice(null);
    setScannerPhase("scanning");
  }

  function handleScanComplete() {
    // BleDeviceScanner handles the phase internally, but we track our own state
    // for the "Scan for BLE Device" button visibility
    setScannerPhase("confirm");
  }

  async function handleSubmit() {
    const bleDevice = selectedDevice?.id;
    if (!courseCode.trim() || !date.trim() || !time.trim() || !bleDevice) {
      setError("Please fill in course code, date, time, and scan/select a BLE device.");
      return;
    }

    const validTillDate = parseDateTimeInputs(date, time);
    if (!validTillDate) {
      setError("Enter a valid date (YYYY-MM-DD) and time (HH:MM).");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const data = await createAttendance({
        courseCode: courseCode.trim(),
        dept: dept.trim() || undefined,
        description: description.trim() || undefined,
        validTill: validTillDate.toISOString(),
        bleDevice,
      });
      router.replace(`/lecturer-session/${data.publicId}`);
    } catch (err) {
      setError(err.message || "Unable to create attendance session.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DismissKeyboardView style={{ alignItems: "stretch" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
        <FormLabel>Course Code</FormLabel>
        <ThemedInput full placeholder="e.g. INFO 101" value={courseCode} onChangeText={setCourseCode} />
        <Spacer />
        <FormLabel>Department (optional)</FormLabel>
        <ThemedInput full placeholder="e.g. Computer Science" value={dept} onChangeText={setDept} />
        <Spacer />
        <FormLabel>Description (optional)</FormLabel>
        <ThemedInput
          full
          placeholder="Anything students should know"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Spacer />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "48%" }}>
            <FormLabel>Date (YYYY-MM-DD)</FormLabel>
            <ThemedInput
              full
              placeholder="2026-09-29"
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              autoCorrect={false}
              styles={{ width: "100%" }}
            />
          </View>
          <View style={{ width: "48%" }}>
            <FormLabel>Time (HH:MM)</FormLabel>
            <ThemedInput
              full
              placeholder="14:30"
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              autoCorrect={false}
              styles={{ width: "100%" }}
            />
          </View>
        </View>
        <Spacer />

        <FormLabel>BLE Device</FormLabel>

        {selectedDevice ? (
          <>
            <ThemedText isHeader styles={{ fontSize: 16 }}>
              ✓ {selectedDevice.name || selectedDevice.localName || "Unknown BLE Device"}
            </ThemedText>
            <ThemedText styles={{ fontSize: 12, color: Colors.iconColor }}>ID: {selectedDevice.id}</ThemedText>
            <ThemedText styles={{ fontSize: 12, color: Colors.iconColor }}>Signal: {selectedDevice.rssi ?? "N/A"} dBm</ThemedText>
            <Spacer />
            <ThemedButton
              onPress={handleRescan}
              otherStyles={{ backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.secondary }}
            >
              <Text style={{ color: Colors.secondary }}>Change Device / Rescan</Text>
            </ThemedButton>
          </>
        ) : (
          <BleDeviceScanner
            onDeviceSelected={handleDeviceSelected}
            title="Select BLE Device for Attendance"
            subtitle="Scan for the classroom BLE device and select it for this session."
            showTitle={false}
            initialPhase="intro"
          />
        )}

        <Spacer />
        {error ? (
          <>
            <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{error}</ThemedText>
            <Spacer />
          </>
        ) : null}

        <ThemedButton onPress={handleSubmit} disabled={isSubmitting || !selectedDevice}>
          <Text style={{ color: "white" }}>{isSubmitting ? "Creating…" : "Create Session"}</Text>
        </ThemedButton>
      </ScrollView>
    </DismissKeyboardView>
  );
}