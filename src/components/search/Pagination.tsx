"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      updatePage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      updatePage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => updatePage(pageNum)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-burgundy-600 text-white font-semibold"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
