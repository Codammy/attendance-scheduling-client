import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "../constants/Api";

// Wraps the backend's generic AppResponse<D, E> envelope:
// { data, error, message, success, timestamp }
export class ApiError extends Error {
  constructor(message, { status, error, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.data = data;
  }
}

let authToken = null;
let unauthorizedHandler = null;

// Set by AuthContext once a session exists, so every request can attach
// `Authorization: Bearer <token>` without screens passing it around manually.
export function setAuthToken(token) {
  authToken = token;
}

// Set by AuthContext so the client can react to a 401 (expired/invalid
// token) by clearing the session, without importing AuthContext here.
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort());

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out. Please check your connection and try again.");
    }
    throw new ApiError("Unable to reach the server. Please check your connection.");
  } finally {
    clearTimeout(timeout);
  }

  let payload = null;
  try {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON response body; fall through with payload = null.
  }

  const success = payload?.success ?? response.ok;

  if (!success) {
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(payload?.message || `Request failed (${response.status})`, {
      status: response.status,
      error: payload?.error,
      data: payload?.data,
    });
  }

  return payload?.data;
}

const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export default apiClient;
