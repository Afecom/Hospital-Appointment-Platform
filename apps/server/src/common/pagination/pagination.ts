interface PageQuery {
    page?: number
    limit?: number
}

export function normalizePagination({page, limit}: PageQuery){
    const p = page && page > 0 ? page : 1
    const l = limit && limit > 0 && limit <= 100 ? limit : limit = 10

    return {
        normalizedPage: p,
        normalizedLimit: l,
        skip: (p - 1) * l,
        take: l
    }
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  const lastPage = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    lastPage,
    hasNextPage: page < lastPage,
    hasPrevPage: page > 1,
  }
}