// Page-based pagination. Every list endpoint must use this (CRITICAL RULE: never
// return all rows). limit is capped to keep the <1s budget.
export function parsePagination(req: Request): { page: number; limit: number; skip: number; take: number } {
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(sp.get("limit") ?? "20", 10) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasMore: page * limit < total,
  };
}
