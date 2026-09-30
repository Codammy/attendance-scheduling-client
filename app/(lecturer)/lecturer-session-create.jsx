import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
import FormLabel from "../../components/FormLabel";
import Spacer from "../../components/Spacer";
import BleDeviceListItem from "../../components/BleDeviceListItem";
import { LoadingView } from "../../components/StatusViews";
import { createAttendance } from "../../api/attendance";
import { getBleDevices } from "../../api/ble";
import { normalizePage } from "../../utils/pagination";
import { parseDateTimeInputs } from "../../utils/date";
import Colors from "../../constants/Color";

const DEVICE_LIST_SIZE = 200;

export default function LecturerSessionCreate() {
  const router = useRouter();

  const [courseCode, setCourseCode] = useState("");
  const [dept, setDept] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [devices, setDevices] = useState([]);
  // Registering/editing/deleting BLE devices is admin-only, but lecturers
  // can still read GET /ble-device to pick one here. Falls back to manual
  // entry only on an actual fetch failure (network/server error), rather
  // than blocking session creation entirely.
  const [devicesStatus, setDevicesStatus] = useState("loading");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [manualDeviceId, setManualDeviceId] = useState("");

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBleDevices({ size: DEVICE_LIST_SIZE });
        setDevices(normalizePage(data).items);
        setDevicesStatus("success");
      } catch (err) {
        setDevicesStatus("error");
      }
    })();
  }, []);

  function handleSelectDevice(device) {
    setSelectedDevice(device);
    setShowDevicePicker(false);
  }

  async function handleSubmit() {
    const bleDevice = selectedDevice?.publicId || manualDeviceId.trim();
    if (!courseCode.trim() || !date.trim() || !time.trim() || !bleDevice) {
      setError("Please fill in course code, date, time, and a BLE device.");
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

        {devicesStatus === "loading" ? <LoadingView message="Loading devices…" /> : null}

        {devicesStatus === "success" ? (
          <>
            <ThemedButton
              otherStyles={{ width: "100%" }}
              onPress={() => setShowDevicePicker((prev) => !prev)}
            >
              <Text style={{ color: "white" }}>
                {selectedDevice
                  ? `✓ ${selectedDevice.alias || selectedDevice.deviceID}`
                  : showDevicePicker
                    ? "Hide device list"
                    : "Select a device"}
              </Text>
            </ThemedButton>
            {showDevicePicker ? (
              <>
                <Spacer />
                {devices.length === 0 ? (
                  <ThemedText>No BLE devices registered yet. Ask an admin to register one.</ThemedText>
                ) : (
                  devices.map((device) => (
                    <BleDeviceListItem
                      key={device.publicId}
                      device={device}
                      selected={selectedDevice?.publicId === device.publicId}
                      onPress={handleSelectDevice}
                    />
                  ))
                )}
              </>
            ) : null}
          </>
        ) : null}

        {devicesStatus === "error" ? (
          <>
            <ThemedText>
              Couldn't load the registered device list. Ask an admin for the
              device's identifier and enter it below.
            </ThemedText>
            <Spacer />
            <FormLabel>BLE Device Identifier</FormLabel>
            <ThemedInput
              full
              placeholder="Device publicId or BLE address"
              value={manualDeviceId}
              onChangeText={setManualDeviceId}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        ) : null}

        <Spacer />
        {error ? (
          <>
            <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{error}</ThemedText>
            <Spacer />
          </>
        ) : null}

        <ThemedButton onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={{ color: "white" }}>{isSubmitting ? "Creating…" : "Create Session"}</Text>
        </ThemedButton>
      </ScrollView>
    </DismissKeyboardView>
  );
}
