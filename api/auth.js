import apiClient from "./client";

// POST /api/auth/token — returns LoginResponse on success:
// { accessToken: string, user: AppUserResponse }
export function login(username, password) {
  return apiClient.post("/auth/token", { username, password });
}

export function invite({ username, email, role }) {
  return apiClient.post("/auth/invite", { username, email, role });
}

export function reInvite({ username, email, role }) {
  return apiClient.post("/auth/re-invite", { username, email, role });
}
