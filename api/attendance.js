import apiClient from "./client";

// Only these are accepted by GET /api/attendance — anything else is dropped
// rather than sent blind.
const LIST_PARAMS = [
  "page",
  "size",
  "sort",
  "courseCode",
  "scheduledWith",
  "dept",
  "student",
  "lecturer",
  "status",
  "search",
  "publicId",
];

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const key of LIST_PARAMS) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// The authenticated caller's role/identity scopes the results server-side —
// we don't pass `student`/`lecturer` filters ourselves unless a screen
// explicitly needs to narrow further, to avoid sending guessed identifiers.
export function getAttendance(params) {
  return apiClient.get(`/attendance${buildQuery(params)}`);
}

export function getAttendanceById(publicId) {
  return apiClient.get(`/attendance/${publicId}`);
}

// bleDeviceID must be the identifier read directly off a real, currently
// discovered BLE device (see hooks/useBleScanner.js) — never fabricated.
export function signInAttendance({ bleDeviceID, dept }) {
  return apiClient.post("/attendance/sign-in", { bleDeviceID, dept });
}

// Per the OpenAPI spec's AttendanceRequest, only courseCode/validTill/
// bleDevice are required — dept and description are optional.
// `bleDevice` is the registered BLE device's `publicId` — the backend-
// generated, publicly addressable identifier (as opposed to `deviceID`,
// which is the beacon hardware's own id, not backend-controlled).
// Confirmed — no longer an assumption.
export function createAttendance({ courseCode, validTill, description, dept, bleDevice }) {
  return apiClient.post("/attendance", { courseCode, validTill, description, dept, bleDevice });
}

export function activateAttendance(publicId) {
  return apiClient.patch(`/attendance/activate/${publicId}`);
}

export function deactivateAttendance(publicId) {
  return apiClient.patch(`/attendance/deactivate/${publicId}`);
}

export function updateAttendance(publicId, { courseCode, validTill, description, dept, bleDevice }) {
  return apiClient.put(`/attendance/${publicId}`, { courseCode, validTill, description, dept, bleDevice });
}

export function deleteAttendance(publicId) {
  return apiClient.delete(`/attendance/${publicId}`);
}
