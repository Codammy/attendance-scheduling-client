import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import AttendanceListItem from "../../components/AttendanceListItem";
import { LoadingView, ErrorView, EmptyView } from "../../components/StatusViews";
import useAuth from "../../hooks/useAuth";
import { getAttendance } from "../../api/attendance";
import { normalizePage } from "../../utils/pagination";
import Colors from "../../constants/Color";

const NAV_CARDS = [
  { href: "/lecturer-session-create", label: "Create Attendance Session" },
  { href: "/lecturer-sessions", label: "Attendance Sessions" },
  { href: "/lecturer-profile", label: "Profile" },
];

export default function LecturerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAttendance({ size: 5, sort: "validTill,desc" });
      setRecords(normalizePage(data).items);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load attendance sessions.");
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
        renderItem={({ item }) => (
          <AttendanceListItem
            record={item}
            onPress={() => router.push(`/lecturer-session/${item.publicId}`)}
          />
        )}
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
              Recent Sessions
            </ThemedText>
            <Spacer />
            {status === "loading" ? <LoadingView message="Loading sessions…" /> : null}
            {status === "error" ? <ErrorView message={error} onRetry={load} /> : null}
          </View>
        }
        ListEmptyComponent={
          status === "success" ? <EmptyView message="No attendance sessions yet." /> : null
        }
      />
    </ThemedView>
  );
}
