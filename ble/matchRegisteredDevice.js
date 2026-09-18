import { getAttendance } from "../api/attendance";
import { normalizePage } from "../utils/pagination";
import { isCurrentlyAvailable } from "../utils/attendanceStatus";

const RELEVANT_SESSIONS_FETCH_SIZE = 50;

// Cross-references raw scan results against the caller's own attendance
// sessions, since an unfiltered BLE scan also picks up unrelated nearby
// devices (phones, earbuds, etc). BLE device management (GET /api/ble-device)
// is admin-only, so a student token can't read the device registry directly
// — but AttendanceResponse.scheduledWith already embeds the BLEResponse
// {alias, deviceID} for each session, and GET /api/attendance is readable by
// students. So matching goes through the student's own sessions instead of
// the device registry.
export async function matchRegisteredDevices(discoveredDevices) {
  if (discoveredDevices.length === 0) return [];

  const data = await getAttendance({ size: RELEVANT_SESSIONS_FETCH_SIZE, sort: "validTill,desc" });
  const sessions = normalizePage(data).items.filter(isCurrentlyAvailable);

  const byDeviceId = new Map();
  for (const session of sessions) {
    const device = session.scheduledWith;
    if (device?.deviceID && !byDeviceId.has(device.deviceID)) {
      byDeviceId.set(device.deviceID, { alias: device.alias, session });
    }
  }

  return discoveredDevices
    .filter((device) => byDeviceId.has(device.id))
    .map((device) => ({
      ...device,
      alias: byDeviceId.get(device.id).alias,
      session: byDeviceId.get(device.id).session,
    }));
}
