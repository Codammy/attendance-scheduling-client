import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { useRouter } from "expo-router";
import DismissKeyboardView from "../../components/DismissKeyboardView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedInput from "../../components/ThemedInput";
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
        <ThemedInput full placeholder="Course Code" value={courseCode} onChangeText={setCourseCode} />
        <Spacer />
        <ThemedInput full placeholder="Department (optional)" value={dept} onChangeText={setDept} />
        <Spacer />
        <ThemedInput
          full
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Spacer />
        <ThemedInput full placeholder="Valid Till Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <Spacer />
        <ThemedInput full placeholder="Valid Till Time (HH:MM, 24h)" value={time} onChangeText={setTime} />
        <Spacer />

        <ThemedText>BLE Device</ThemedText>
        <Spacer />

        {devicesStatus === "loading" ? <LoadingView message="Loading devices…" /> : null}

        {devicesStatus === "success" ? (
          <>
            <ThemedButton
              otherStyles={{ width: "100%", backgroundColor: Colors.secondary }}
              onPress={() => setShowDevicePicker((prev) => !prev)}
            >
              <Text style={{ color: "white" }}>
                {selectedDevice ? selectedDevice.alias || selectedDevice.deviceID : "Select a device"}
              </Text>
            </ThemedButton>
            {showDevicePicker ? (
              <>
                <Spacer />
                {devices.length === 0 ? (
                  <ThemedText>No BLE devices registered yet. Ask an admin to register one.</ThemedText>
                ) : (
                  devices.map((device) => (
                    <BleDeviceListItem key={device.publicId} device={device} onPress={handleSelectDevice} />
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
            <ThemedInput
              full
              placeholder="BLE Device Identifier"
              value={manualDeviceId}
              onChangeText={setManualDeviceId}
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
