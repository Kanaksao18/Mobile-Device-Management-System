function Pagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) {
  const safeTotal = Math.max(0, totalItems || 0)
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize))
  // Range text is clamped to avoid invalid "start > end" output.
  const start = safeTotal === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, safeTotal)

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700 md:flex-row md:items-center md:justify-between">
      <div className="text-slate-600 dark:text-slate-300">
        Showing {start}-{end} of {safeTotal}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-slate-600 dark:text-slate-300" htmlFor="page-size">
          Rows:
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
        >
          Prev
        </button>
        <span className="text-slate-600 dark:text-slate-300">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
