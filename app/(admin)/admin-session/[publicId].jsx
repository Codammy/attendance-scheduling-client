import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import DismissKeyboardView from "../../../components/DismissKeyboardView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import ThemedInput from "../../../components/ThemedInput";
import StatusBadge from "../../../components/StatusBadge";
import Spacer from "../../../components/Spacer";
import { LoadingView, ErrorView } from "../../../components/StatusViews";
import {
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  activateAttendance,
  deactivateAttendance,
} from "../../../api/attendance";
import { parseDateTimeInputs, toDateTimeInputParts } from "../../../utils/date";
import { isCurrentlyAvailable, isActivateRedundant, isDeactivateRedundant } from "../../../utils/attendanceStatus";
import Colors from "../../../constants/Color";

export default function AdminSessionDetail() {
  const { publicId } = useLocalSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [record, setRecord] = useState(null);

  const [courseCode, setCourseCode] = useState("");
  const [dept, setDept] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bleDevice, setBleDevice] = useState("");

  const [saveError, setSaveError] = useState(null);
  const [busy, setBusy] = useState(null); // null | "saving" | "activating" | "deactivating" | "deleting"

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getAttendanceById(publicId);
      setRecord(data);
      setCourseCode(data.courseCode || "");
      setDept(data.dept || "");
      setDescription(data.description || "");
      // AttendanceResponse embeds the device as `scheduledWith` (a full
      // BLEResponse), not a raw `bleDevice` string — but the write side
      // (AttendanceRequest) still expects `bleDevice` as a plain identifier.
      // `publicId` is BaseResponse-derived and not shown in every example,
      // so this falls back to `deviceID` if it's ever absent.
      setBleDevice(data.scheduledWith?.publicId || data.scheduledWith?.deviceID || "");
      const parts = toDateTimeInputParts(data.validTill);
      setDate(parts.date);
      setTime(parts.time);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load this attendance session.");
      setStatus("error");
    }
  }, [publicId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!courseCode.trim() || !date.trim() || !time.trim() || !bleDevice.trim()) {
      setSaveError("Course code, date, time, and BLE device are required.");
      return;
    }
    const validTillDate = parseDateTimeInputs(date, time);
    if (!validTillDate) {
      setSaveError("Enter a valid date (YYYY-MM-DD) and time (HH:MM).");
      return;
    }

    setSaveError(null);
    setBusy("saving");
    try {
      await updateAttendance(publicId, {
        courseCode: courseCode.trim(),
        dept: dept.trim() || undefined,
        description: description.trim() || undefined,
        validTill: validTillDate.toISOString(),
        bleDevice: bleDevice.trim(),
      });
      await load();
    } catch (err) {
      setSaveError(err.message || "Unable to save changes.");
    } finally {
      setBusy(null);
    }
  }

  async function handleActivate() {
    setSaveError(null);
    setBusy("activating");
    try {
      await activateAttendance(publicId);
      await load();
    } catch (err) {
      setSaveError(err.message || "Unable to activate this session.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDeactivate() {
    setSaveError(null);
    setBusy("deactivating");
    try {
      await deactivateAttendance(publicId);
      await load();
    } catch (err) {
      setSaveError(err.message || "Unable to deactivate this session.");
    } finally {
      setBusy(null);
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete Session",
      `Delete the "${courseCode}" attendance session? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ]
    );
  }

  async function handleDelete() {
    setBusy("deleting");
    try {
      await deleteAttendance(publicId);
      router.back();
    } catch (err) {
      setSaveError(err.message || "Unable to delete this session.");
      setBusy(null);
    }
  }

  if (status === "loading") {
    return (
      <ThemedView>
        <LoadingView message="Loading session…" />
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

  const isBusy = busy !== null;

  return (
    <DismissKeyboardView style={{ alignItems: "stretch" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
        <StatusBadge status={record.status} />
        {!isCurrentlyAvailable(record) ? (
          <ThemedText styles={{ color: Colors.warning, marginTop: 6 }}>
            This session is not currently available to students.
          </ThemedText>
        ) : null}
        <Spacer />

        {record.scheduledWith ? (
          <>
            <ThemedText styles={{ color: Colors.secondary, fontSize: 12 }}>
              Currently scheduled with
            </ThemedText>
            <ThemedText>
              {record.scheduledWith.alias} ({record.scheduledWith.deviceID})
            </ThemedText>
            <Spacer />
          </>
        ) : null}

        <ThemedInput full placeholder="Course Code" value={courseCode} onChangeText={setCourseCode} editable={!isBusy} />
        <Spacer />
        <ThemedInput full placeholder="Department" value={dept} onChangeText={setDept} editable={!isBusy} />
        <Spacer />
        <ThemedInput full placeholder="Description" value={description} onChangeText={setDescription} multiline editable={!isBusy} />
        <Spacer />
        <ThemedInput full placeholder="Valid Till Date (YYYY-MM-DD)" value={date} onChangeText={setDate} editable={!isBusy} />
        <Spacer />
        <ThemedInput full placeholder="Valid Till Time (HH:MM, 24h)" value={time} onChangeText={setTime} editable={!isBusy} />
        <Spacer />
        <ThemedInput full placeholder="BLE Device Identifier" value={bleDevice} onChangeText={setBleDevice} editable={!isBusy} />
        <Spacer />

        {saveError ? (
          <>
            <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{saveError}</ThemedText>
            <Spacer />
          </>
        ) : null}

        <ThemedButton onPress={handleSave} disabled={isBusy} otherStyles={{ marginBottom: 10 }}>
          <Text style={{ color: "white" }}>{busy === "saving" ? "Saving…" : "Save Changes"}</Text>
        </ThemedButton>
        <ThemedButton
          onPress={handleActivate}
          disabled={isBusy || isActivateRedundant(record.status)}
          otherStyles={{ backgroundColor: Colors.secondary, marginBottom: 10 }}
        >
          <Text style={{ color: "white" }}>{busy === "activating" ? "Activating…" : "Activate Session"}</Text>
        </ThemedButton>
        <ThemedButton
          onPress={handleDeactivate}
          disabled={isBusy || isDeactivateRedundant(record.status)}
          otherStyles={{ backgroundColor: Colors.primary, marginBottom: 10 }}
        >
          <Text style={{ color: "white" }}>{busy === "deactivating" ? "Deactivating…" : "Deactivate Session"}</Text>
        </ThemedButton>
        <ThemedButton onPress={confirmDelete} disabled={isBusy} otherStyles={{ backgroundColor: Colors.warning }}>
          <Text style={{ color: "white" }}>{busy === "deleting" ? "Deleting…" : "Delete Session"}</Text>
        </ThemedButton>
      </ScrollView>
    </DismissKeyboardView>
  );
}
