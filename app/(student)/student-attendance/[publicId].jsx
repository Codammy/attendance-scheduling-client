import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import StatusBadge from "../../../components/StatusBadge";
import FieldRow from "../../../components/FieldRow";
import Spacer from "../../../components/Spacer";
import { LoadingView, ErrorView } from "../../../components/StatusViews";
import { getAttendanceById } from "../../../api/attendance";
import { formatDateTime } from "../../../utils/date";
import { isCurrentlyAvailable } from "../../../utils/attendanceStatus";

export default function AttendanceDetail() {
  const { publicId } = useLocalSearchParams();
  const [status, setStatus] = useState("loading");
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getAttendanceById(publicId);
      setRecord(data);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load this attendance record.");
      setStatus("error");
    }
  }, [publicId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") {
    return (
      <ThemedView>
        <LoadingView message="Loading details…" />
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
      <Spacer />

      <FieldRow label="Department" value={record.dept} />
      <FieldRow label="Valid Till" value={formatDateTime(record.validTill)} />
      <FieldRow label="Description" value={record.description} />
      <FieldRow label="BLE Device" value={record.scheduledWith?.alias} />

      {isCurrentlyAvailable(record) ? (
        <>
          <Spacer />
          <Link href="/student-sign-in" asChild>
            <ThemedButton otherStyles={{ width: "100%" }}>
              <Text style={{ color: "white" }}>Sign In to Attendance</Text>
            </ThemedButton>
          </Link>
        </>
      ) : null}
    </ThemedView>
  );
}
