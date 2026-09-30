function Alert({ children, type = 'error', onClose }) {
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" type="button" onClick={onClose} aria-label="Đóng">
          ×
        </button>
      )}
    </div>
  )
}

export default Alert
