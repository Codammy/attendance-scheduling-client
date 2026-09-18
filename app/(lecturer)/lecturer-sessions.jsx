import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedInput from "../../components/ThemedInput";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import AttendanceListItem from "../../components/AttendanceListItem";
import { LoadingView, ErrorView, EmptyView } from "../../components/StatusViews";
import { getAttendance } from "../../api/attendance";
import usePaginatedList from "../../hooks/usePaginatedList";
import Colors from "../../constants/Color";

export default function LecturerSessions() {
  const router = useRouter();
  const {
    search,
    setSearch,
    items,
    status,
    error,
    isFetchingMore,
    refreshing,
    retry,
    handleSearchSubmit,
    handleRefresh,
    handleEndReached,
  } = usePaginatedList(getAttendance, { pageSize: 10, sort: "validTill,desc" });

  return (
    <ThemedView style={{ paddingHorizontal: 16 }}>
      <Spacer />
      <Link href="/lecturer-session-create" asChild>
        <ThemedButton otherStyles={{ width: "100%" }}>
          <Text style={{ color: "white" }}>Create Attendance Session</Text>
        </ThemedButton>
      </Link>
      <Spacer />
      <ThemedInput
        full
        placeholder="Search by course, dept…"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <Spacer />

      {status === "loading" ? <LoadingView message="Loading sessions…" /> : null}
      {status === "error" ? <ErrorView message={error} onRetry={retry} /> : null}

      {status === "success" ? (
        <FlatList
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          data={items}
          keyExtractor={(item) => item.publicId}
          renderItem={({ item }) => (
            <AttendanceListItem
              record={item}
              onPress={() => router.push(`/lecturer-session/${item.publicId}`)}
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          ListEmptyComponent={<EmptyView message="No attendance sessions found." />}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator color={Colors.secondary} />
              </View>
            ) : null
          }
        />
      ) : null}
    </ThemedView>
  );
}
