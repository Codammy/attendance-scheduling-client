// Lazily instantiated singleton — react-native-ble-plx's BleManager attaches
// native event listeners on construction, so it must only ever be created
// once for the app's lifetime, and only when actually needed (constructing
// it will throw if the native module isn't linked, e.g. if this somehow runs
// under Expo Go instead of a custom dev client).
let instance = null;

export function getBleManager() {
  if (!instance) {
    const { BleManager } = require("react-native-ble-plx");
    instance = new BleManager();
  }
  return instance;
}
