import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { Link } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import AttendanceListItem from "../../components/AttendanceListItem";
import { LoadingView, ErrorView, EmptyView } from "../../components/StatusViews";
import useAuth from "../../hooks/useAuth";
import { getAttendance } from "../../api/attendance";
import { normalizePage } from "../../utils/pagination";
import { isCurrentlyAvailable } from "../../utils/attendanceStatus";
import Colors from "../../constants/Color";

// The API has no "validTill >= now" filter, so a bounded fetch sorted
// descending is used instead: every future record sorts ahead of every past
// one (their validTill is always greater), so the soonest-upcoming records
// are guaranteed to land within this page as long as there are no more than
// UPCOMING_FETCH_SIZE of them — a safe assumption for a small dashboard
// widget. Reversed afterwards for soonest-first display.
const UPCOMING_FETCH_SIZE = 20;
const UPCOMING_DISPLAY_COUNT = 5;

const NAV_CARDS = [
  { href: "/student-sign-in", label: "Sign In to Attendance" },
  { href: "/student-history", label: "Attendance History" },
  { href: "/student-profile", label: "Profile" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAttendance({ size: UPCOMING_FETCH_SIZE });
      const upcoming = normalizePage(data)
        .items.filter(isCurrentlyAvailable)
        .reverse()
        .slice(0, UPCOMING_DISPLAY_COUNT);
      setRecords(upcoming);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load attendance.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ThemedView style={{ alignItems: "stretch", paddingHorizontal: 16 }}>
      <FlatList
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        data={status === "success" ? records : []}
        keyExtractor={(item) => item.publicId}
        renderItem={({ item }) => <AttendanceListItem record={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />
        }
        ListHeaderComponent={
          <View>
            <Spacer />
            <ThemedText isHeader styles={{ fontSize: 22 }}>
              Welcome{user?.username ? `, ${user.username}` : ""}
            </ThemedText>
            <Spacer />
            {NAV_CARDS.map((card) => (
              <Link key={card.href} href={card.href} asChild>
                <ThemedButton otherStyles={{ width: "100%", marginBottom: 10 }}>
                  <Text style={{ color: "white" }}>{card.label}</Text>
                </ThemedButton>
              </Link>
            ))}
            <Spacer />
            <ThemedText isHeader styles={{ fontSize: 16 }}>
              Current &amp; Upcoming
            </ThemedText>
            <Spacer />
            {status === "loading" ? <LoadingView message="Loading attendance…" /> : null}
            {status === "error" ? <ErrorView message={error} onRetry={load} /> : null}
          </View>
        }
        ListEmptyComponent={
          status === "success" ? (
            <EmptyView message="No current or upcoming attendance sessions." />
          ) : null
        }
      />
    </ThemedView>
  );
}
