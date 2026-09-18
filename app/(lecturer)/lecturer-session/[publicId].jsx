import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import StatusBadge from "../../../components/StatusBadge";
import FieldRow from "../../../components/FieldRow";
import Spacer from "../../../components/Spacer";
import { LoadingView, ErrorView } from "../../../components/StatusViews";
import { getAttendanceById, activateAttendance, deactivateAttendance } from "../../../api/attendance";
import { formatDateTime } from "../../../utils/date";
import { isCurrentlyAvailable, isActivateRedundant, isDeactivateRedundant } from "../../../utils/attendanceStatus";
import Colors from "../../../constants/Color";

export default function LecturerSessionDetail() {
  const { publicId } = useLocalSearchParams();
  const [status, setStatus] = useState("loading");
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState("idle"); // idle | activating | deactivating
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getAttendanceById(publicId);
      setRecord(data);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load this attendance session.");
      setStatus("error");
    }
  }, [publicId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleActivate() {
    setActionState("activating");
    setActionError(null);
    try {
      await activateAttendance(publicId);
      await load();
    } catch (err) {
      setActionError(err.message || "Unable to activate this session.");
    } finally {
      setActionState("idle");
    }
  }

  async function handleDeactivate() {
    setActionState("deactivating");
    setActionError(null);
    try {
      await deactivateAttendance(publicId);
      await load();
    } catch (err) {
      setActionError(err.message || "Unable to deactivate this session.");
    } finally {
      setActionState("idle");
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

  return (
    <ThemedView style={{ justifyContent: "flex-start", paddingHorizontal: 16, paddingTop: 8 }}>
      <ThemedText isHeader styles={{ fontSize: 22 }}>
        {record.courseCode}
      </ThemedText>
      <Spacer />
      <StatusBadge status={record.status} />
      {!isCurrentlyAvailable(record) ? (
        <ThemedText styles={{ color: Colors.warning, marginTop: 6 }}>
          This session is not currently available to students.
        </ThemedText>
      ) : null}
      <Spacer />

      <FieldRow label="Department" value={record.dept} />
      <FieldRow label="Valid Till" value={formatDateTime(record.validTill)} />
      <FieldRow label="Description" value={record.description} />
      <FieldRow label="BLE Device" value={record.scheduledWith?.alias} />

      {actionError ? (
        <>
          <ThemedText styles={{ color: Colors.warning, textAlign: "center" }}>{actionError}</ThemedText>
          <Spacer />
        </>
      ) : null}

      <ThemedButton
        otherStyles={{ width: "100%", backgroundColor: Colors.secondary, marginBottom: 10 }}
        onPress={handleActivate}
        disabled={actionState !== "idle" || isActivateRedundant(record.status)}
      >
        <Text style={{ color: "white" }}>
          {actionState === "activating" ? "Activating…" : "Activate Session"}
        </Text>
      </ThemedButton>
      <ThemedButton
        otherStyles={{ width: "100%", backgroundColor: Colors.warning }}
        onPress={handleDeactivate}
        disabled={actionState !== "idle" || isDeactivateRedundant(record.status)}
      >
        <Text style={{ color: "white" }}>
          {actionState === "deactivating" ? "Deactivating…" : "Deactivate Session"}
        </Text>
      </ThemedButton>
    </ThemedView>
  );
}
