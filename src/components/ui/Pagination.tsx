"use client";

/**
 * Pagination component.
 * Handles "Previous" and "Next" logic, rendering page numbers,
 * and page size (limit) changing.
 */

interface PaginationProps {
  currentPage: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function Pagination({
  currentPage,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  // Generate page numbers to display.
  // We'll show a simple window of up to 5 pages.
  const pageNumbers: number[] = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
      {/* Limit selector & count */}
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
          }}
          className="bg-white border border-slate-200 text-slate-700 text-xs
                     rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/40
                     cursor-pointer transition-colors"
          aria-label="Items per page"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <span className="text-xs text-slate-500">
          Showing {total === 0 ? 0 : startItem}–{endItem} of {total}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1 || total === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 text-xs
                     hover:bg-slate-800/70 hover:text-slate-200
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          ← Prev
        </button>

        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
              p === currentPage
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-500/50"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            }`}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        <button
          disabled={currentPage >= totalPages || total === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 text-xs
                     hover:bg-slate-800/70 hover:text-slate-200
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
