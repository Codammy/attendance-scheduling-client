import { isFuture } from "./date";

// Backend Status enum (exact values — do not invent others):
// ACTIVE, EXPIRED, OPEN, DEACTIVATED, INACTIVE.
export const INACTIVE_STATUSES = ["EXPIRED", "DEACTIVATED", "INACTIVE"];

// True when a session is still within its validTill window AND its status
// isn't one of the terminal/inactive ones — "current/upcoming" needs both,
// not just a still-future validTill (e.g. a lecturer could deactivate a
// session early, well before its validTill passes).
export function isCurrentlyAvailable(record) {
  return isFuture(record.validTill) && !INACTIVE_STATUSES.includes(record.status);
}

// Name-literal, conservative inferences only — used to avoid offering an
// obviously-redundant action, never to hard-block a transition the backend
// might still consider valid. The backend's own rejection message (if any)
// is always what gets shown, not a locally-invented one.
export function isActivateRedundant(status) {
  return status === "ACTIVE";
}

export function isDeactivateRedundant(status) {
  return status === "DEACTIVATED" || status === "INACTIVE";
}
