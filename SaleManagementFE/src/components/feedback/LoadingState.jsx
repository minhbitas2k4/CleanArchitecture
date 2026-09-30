function LoadingState({ message = 'Đang tải dữ liệu...' }) {
  return (
    <div className="table-state" role="status">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  )
}

export default LoadingState
