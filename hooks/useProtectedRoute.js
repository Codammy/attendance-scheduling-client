import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import useAuth from "./useAuth";

// Centralized route guard, mounted once in the root layout. Reacts to any
// auth-state change from anywhere in the app — initial restore, a fresh
// login/logout, or a background 401 clearing the session mid-use — not just
// the initial launch redirect handled in app/index.jsx.
export default function useProtectedRoute() {
  const { isAuthenticated, isRestoring, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isRestoring) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Straight to the role dashboard when we have one, instead of "/" —
      // avoids a redundant extra redirect hop through the index screen.
      const role = user?.role?.toLowerCase();
      router.replace(role ? `/${role}` : "/");
    }
  }, [isAuthenticated, isRestoring, user, segments, router]);
}
