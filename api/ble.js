import apiClient from "./client";

const LIST_PARAMS = [
  "page",
  "size",
  "sort",
  "search",
  "publicId",
  "createdBy",
  "lastModifiedBy",
  "lastModifiedFrom",
  "lastModifiedTo",
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

export function getBleDevices(params) {
  return apiClient.get(`/ble-device${buildQuery(params)}`);
}

export function getBleDeviceById(publicId) {
  return apiClient.get(`/ble-device/${publicId}`);
}

export function createBleDevice({ deviceID, alias }) {
  return apiClient.post("/ble-device", { deviceID, alias });
}

export function updateBleDevice(publicId, { deviceID, alias }) {
  return apiClient.put(`/ble-device/${publicId}`, { deviceID, alias });
}

export function deleteBleDevice(publicId) {
  return apiClient.delete(`/ble-device/${publicId}`);
}
