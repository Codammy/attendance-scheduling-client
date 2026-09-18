import { PermissionsAndroid, Platform } from "react-native";

export const PermissionResult = {
  GRANTED: "granted",
  DENIED: "denied",
  // Android "don't ask again" — the user must be sent to app settings.
  BLOCKED: "blocked",
};

// Android 12+ (API 31+) uses BLUETOOTH_SCAN/BLUETOOTH_CONNECT and can opt out
// of location entirely (we declare neverForLocation in the config plugin,
// since we only use BLE for device identification, never positioning).
// Android <12 has no such opt-out — the OS requires ACCESS_FINE_LOCATION for
// BLE scanning regardless of whether the app actually uses location.
// iOS has no equivalent JS permission-request API: the system prompt is
// triggered automatically by CoreBluetooth the first time a scan starts,
// gated by NSBluetoothAlwaysUsageDescription (set via the config plugin).
export async function ensureBlePermissions() {
  if (Platform.OS !== "android") {
    return PermissionResult.GRANTED;
  }

  const permissions =
    Platform.Version >= 31
      ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const results = await PermissionsAndroid.requestMultiple(permissions);
  const values = Object.values(results);

  if (values.every((result) => result === PermissionsAndroid.RESULTS.GRANTED)) {
    return PermissionResult.GRANTED;
  }
  if (values.some((result) => result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
    return PermissionResult.BLOCKED;
  }
  return PermissionResult.DENIED;
}
