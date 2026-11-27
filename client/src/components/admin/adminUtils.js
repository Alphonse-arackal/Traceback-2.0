export const getList = (data, key) => {
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.data?.[key])) return data.data[key]
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

export const getPagination = (data, count) => {
  const source = data?.pagination || data?.data?.pagination || data || {}
  const total = Number(source.total ?? source.totalUsers ?? source.totalReports ?? count)
  const page = Number(source.page ?? source.currentPage ?? 1)
  const pages = Number(source.totalPages ?? source.pages ?? Math.max(1, Math.ceil(total / 10)))
  return { total, page, pages: Math.max(1, pages) }
}

export const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export const getId = (record) => record?._id || record?.id
