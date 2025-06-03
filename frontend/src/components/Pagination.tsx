import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  loading = false,
}) => {
  const {
    currentPage,
    totalPages,
    totalCount,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
  } = pagination;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always include last page if it's different from first
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add dots where there are gaps
    let prev = 0;
    for (const page of uniqueRange) {
      if (page - prev > 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Results Info */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-semibold">{startIndex}</span> to{" "}
          <span className="font-semibold">{endIndex}</span> of{" "}
          <span className="font-semibold">{totalCount}</span> results
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          {/* First Page Button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage || loading}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="First page"
          >
            <ChevronsLeft size={18} />
          </button>

          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage || loading}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="px-3 py-2 text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>

          {/* Last Page Button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage || loading}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Last page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        {/* Page Info */}
        <div className="text-sm text-gray-700">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
        </div>
      )}
    </div>
  );
};
