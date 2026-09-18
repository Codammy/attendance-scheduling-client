// Overridable at build time via `EXPO_PUBLIC_API_URL` (see .env.example).
// Expo inlines EXPO_PUBLIC_* env vars automatically, no extra config needed.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";

export const REQUEST_TIMEOUT_MS = 15000;
