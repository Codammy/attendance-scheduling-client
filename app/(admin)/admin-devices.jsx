import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import ThemedView from "../../components/ThemedView";
import ThemedInput from "../../components/ThemedInput";
import ThemedButton from "../../components/ThemedButton";
import Spacer from "../../components/Spacer";
import BleDeviceListItem from "../../components/BleDeviceListItem";
import { LoadingView, ErrorView, EmptyView } from "../../components/StatusViews";
import { getBleDevices } from "../../api/ble";
import usePaginatedList from "../../hooks/usePaginatedList";
import Colors from "../../constants/Color";

export default function AdminDevices() {
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
  } = usePaginatedList(getBleDevices, { pageSize: 10 });

  return (
    <ThemedView style={{ paddingHorizontal: 16 }}>
      <Spacer />
      <Link href="/admin-device-create" asChild>
        <ThemedButton otherStyles={{ width: "100%" }}>
          <Text style={{ color: "white" }}>Register BLE Device</Text>
        </ThemedButton>
      </Link>
      <Spacer />
      <ThemedInput
        full
        placeholder="Search devices…"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <Spacer />

      {status === "loading" ? <LoadingView message="Loading devices…" /> : null}
      {status === "error" ? <ErrorView message={error} onRetry={retry} /> : null}

      {status === "success" ? (
        <FlatList
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          data={items}
          keyExtractor={(item) => item.publicId}
          renderItem={({ item }) => (
            <BleDeviceListItem
              device={item}
              onPress={(device) => router.push(`/admin-device/${device.publicId}`)}
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={handleEndReached}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />
          }
          ListEmptyComponent={<EmptyView message="No BLE devices registered yet." />}
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
