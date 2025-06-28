import type { Pagination as Pag } from '../hooks'

type PaginationProps = {
  pagination: Pag
  onPageChange?: (page: number, limit: number) => void
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages } = pagination

  // Generate page numbers array
  const getPageNumbers = () => {
    const delta = 1 // Number of pages to show before and after current page
    const pages: (number | string)[] = []

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always show first page
        i === totalPages || // Always show last page
        (i >= page - delta && i <= page + delta) // Show pages around current page
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }

    return pages
  }

  const handlePageClick = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPageChange?.(newPage, pagination.limit)
    }
  }

  return (
    <div className="flex items-center justify-center space-x-1 transform scale-75">
      {/* Previous button */}
      <button
        onClick={() => handlePageClick(page - 1)}
        disabled={page === 1}
        className={`px-3 py-1 rounded-lg ${
          page === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Previous page"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((pageNum, idx) => (
        <button
          key={idx}
          onClick={() =>
            typeof pageNum === 'number' ? handlePageClick(pageNum) : undefined
          }
          disabled={pageNum === '...'}
          className={`px-3 py-1 rounded-lg ${
            pageNum === page
              ? 'bg-primary text-white'
              : pageNum === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => handlePageClick(page + 1)}
        disabled={page === totalPages}
        className={`px-3 py-1 rounded-lg ${
          page === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Next page"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Select limit per page */}
      <select
        className="px-3 py-1 rounded-lg text-gray-600 bg-gray-100"
        value={String(pagination.limit || '20')}
        onChange={(e) => {
          const limit = Number(e.target.value)
          if (limit !== pagination.limit) {
            onPageChange?.(1, limit)
          }
        }}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  )
}

export default Pagination
