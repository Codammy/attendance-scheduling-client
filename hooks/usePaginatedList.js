import { useCallback, useEffect, useState } from "react";
import { normalizePage } from "../utils/pagination";

// Shared by every searchable/paginated list screen (attendance sessions,
// BLE devices, ...) — search + page/refresh/infinite-scroll state, backed
// by any list endpoint that accepts { page, size, sort, search }.
// `fetchFn` must be a stable reference (a module-level API function, not an
// inline arrow) since it's a dependency of the effect that triggers the
// initial load.
export default function usePaginatedList(fetchFn, { pageSize = 10, sort } = {}) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(true);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (targetPage, searchTerm, mode) => {
      try {
        const data = await fetchFn({
          page: targetPage,
          size: pageSize,
          sort,
          search: searchTerm || undefined,
        });
        const normalized = normalizePage(data);
        setItems((prev) => (targetPage === 0 ? normalized.items : [...prev, ...normalized.items]));
        setPage(normalized.page);
        setIsLast(normalized.isLast);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Unable to load data.");
        setStatus("error");
      } finally {
        if (mode === "refresh") setRefreshing(false);
        if (mode === "more") setIsFetchingMore(false);
      }
    },
    [fetchFn, pageSize, sort]
  );

  useEffect(() => {
    load(0, "", "initial");
  }, [load]);

  function retry() {
    setStatus("loading");
    load(0, search, "initial");
  }

  function handleSearchSubmit() {
    setStatus("loading");
    load(0, search, "initial");
  }

  function handleRefresh() {
    setRefreshing(true);
    load(0, search, "refresh");
  }

  function handleEndReached() {
    if (status !== "success" || isLast || isFetchingMore) return;
    setIsFetchingMore(true);
    load(page + 1, search, "more");
  }

  return {
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
  };
}
