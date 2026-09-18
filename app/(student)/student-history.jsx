import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import ThemedView from "../../components/ThemedView";
import ThemedInput from "../../components/ThemedInput";
import Spacer from "../../components/Spacer";
import AttendanceListItem from "../../components/AttendanceListItem";
import { LoadingView, ErrorView, EmptyView } from "../../components/StatusViews";
import { getAttendance } from "../../api/attendance";
import usePaginatedList from "../../hooks/usePaginatedList";
import Colors from "../../constants/Color";

export default function StudentHistory() {
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
      <ThemedInput
        full
        placeholder="Search by course, dept…"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <Spacer />

      {status === "loading" ? <LoadingView message="Loading history…" /> : null}
      {status === "error" ? <ErrorView message={error} onRetry={retry} /> : null}

      {status === "success" ? (
        <FlatList
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          data={items}
          keyExtractor={(item) => item.publicId}
          renderItem={({ item }) => <AttendanceListItem record={item} />}
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          ListEmptyComponent={<EmptyView message="No attendance records found." />}
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
