// Backend is Spring Boot with page/size/sort request params, so `data` is
// assumed to be a standard Spring Data Page: { content, number, totalPages,
// totalElements, last }. Normalized here so screens don't each guess at it.
// Shared by every paginated list (attendance, BLE devices, ...).
export function normalizePage(data) {
  if (Array.isArray(data)) {
    return { items: data, page: 0, totalPages: 1, totalElements: data.length, isLast: true };
  }
  return {
    items: data?.content ?? [],
    page: data?.number ?? 0,
    totalPages: data?.totalPages ?? 1,
    totalElements: data?.totalElements ?? data?.content?.length ?? 0,
    isLast: data?.last ?? true,
  };
}
