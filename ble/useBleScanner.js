import { useCallback, useEffect, useRef, useState } from "react";
import { getBleManager } from "./bleManager";
import { ensureBlePermissions, PermissionResult } from "./permissions";

const SCAN_TIMEOUT_MS = 15000;

// Encapsulates all direct react-native-ble-plx usage (state monitoring,
// permission checks, scanning, cleanup) behind a small hook API, so screens
// only deal with plain state + start/stop — no native BLE calls in the UI
// layer.
export default function useBleScanner() {
  const [bluetoothState, setBluetoothState] = useState("Unknown");
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [scanError, setScanError] = useState(null);
  // Set once the scan runs its full duration and auto-stops — distinct from
  // `devices.length === 0`, which the screen checks separately to decide
  // between "no devices at all" vs "found some, none registered".
  const [scanComplete, setScanComplete] = useState(false);

  const discoveredRef = useRef(new Map());
  const timeoutRef = useRef(null);

  const stopScan = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    try {
      getBleManager().stopDeviceScan();
    } catch {
      // No-op if the manager was never started/instantiated.
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    let subscription;
    try {
      subscription = getBleManager().onStateChange((state) => setBluetoothState(state), true);
    } catch (err) {
      setScanError(err.message || "Bluetooth is unavailable on this device.");
    }
    return () => {
      subscription?.remove();
      stopScan();
    };
  }, [stopScan]);

  // Returns an outcome synchronously (rather than the caller re-reading
  // hook state right after awaiting) since React state updates made inside
  // this function aren't visible to the caller until the next render.
  const startScan = useCallback(async () => {
    setScanError(null);
    setScanComplete(false);
    discoveredRef.current = new Map();
    setDevices([]);

    let manager;
    try {
      manager = getBleManager();
    } catch (err) {
      const message = err.message || "Bluetooth is unavailable on this device.";
      setScanError(message);
      return { outcome: "error", message };
    }

    const currentState = await manager.state();
    setBluetoothState(currentState);
    if (currentState !== "PoweredOn") {
      return { outcome: "bluetooth-off", state: currentState };
    }

    const permission = await ensureBlePermissions();
    setPermissionStatus(permission);
    if (permission !== PermissionResult.GRANTED) {
      return { outcome: "permission", permission };
    }

    setIsScanning(true);
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        setScanError(error.message || "BLE scan failed.");
        setIsScanning(false);
        clearTimeout(timeoutRef.current);
        return;
      }
      if (!device?.id) return;

      discoveredRef.current.set(device.id, {
        id: device.id,
        name: device.name || device.localName || null,
        rssi: device.rssi,
      });
      setDevices(
        Array.from(discoveredRef.current.values()).sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999))
      );
    });

    timeoutRef.current = setTimeout(() => {
      stopScan();
      setScanComplete(true);
    }, SCAN_TIMEOUT_MS);

    return { outcome: "started" };
  }, [stopScan]);

  return {
    bluetoothState,
    permissionStatus,
    isScanning,
    devices,
    scanError,
    scanComplete,
    startScan,
    stopScan,
  };
}
