import { useState } from 'react'

function ProductFilters({ initialSearch, onSearch, onCreate }) {
  const [search, setSearch] = useState(initialSearch)

  function handleSubmit(event) {
    event.preventDefault()
    onSearch(search)
  }

  function handleClear() {
    setSearch('')
    onSearch('')
  }

  return (
    <div className="toolbar">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="search"
          value={search}
          placeholder="Tìm theo tên sản phẩm hoặc SKU..."
          aria-label="Tìm kiếm sản phẩm"
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="button button-primary" type="submit">
          Tìm kiếm
        </button>
        {search && (
          <button className="button button-secondary" type="button" onClick={handleClear}>
            Xóa lọc
          </button>
        )}
      </form>

      <button className="button button-primary" type="button" onClick={onCreate}>
        + Thêm sản phẩm
      </button>
    </div>
  )
}

export default ProductFilters
