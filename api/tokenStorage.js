import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// expo-secure-store wraps Keychain (iOS) / Keystore-backed EncryptedSharedPreferences
// (Android) — the JWT never sits in plain AsyncStorage.
export function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function saveToken(token) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function clearToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

// There is no "get current user" endpoint — the backend only returns
// AppUserResponse as part of the login response — so the user object has to
// be persisted alongside the token to restore a session on cold start.
export async function getUser() {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUser(user) {
  return SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  return SecureStore.deleteItemAsync(USER_KEY);
}
