function Pagination({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalCount === 0) {
    return null
  }

  const firstItem = (pageNumber - 1) * pageSize + 1
  const lastItem = Math.min(pageNumber * pageSize, totalCount)

  return (
    <div className="pagination">
      <span className="pagination-info">
        Hiển thị {firstItem}-{lastItem} trong tổng số {totalCount} sản phẩm
      </span>

      <div className="pagination-actions">
        <label className="page-size-control">
          Số dòng
          <select
            className="page-size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>

        <button
          className="button button-secondary button-small"
          type="button"
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
        >
          Trước
        </button>
        <span className="page-number">
          Trang {pageNumber}/{totalPages}
        </span>
        <button
          className="button button-secondary button-small"
          type="button"
          disabled={pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  )
}

export default Pagination
