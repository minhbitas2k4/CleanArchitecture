function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Sales Management">
            <span className="brand-mark">SM</span>
            <span className="brand-copy">
              <span className="brand-name">Sales Management</span>
              <span className="brand-caption">Quản lý bán hàng</span>
            </span>
          </a>

          <span className="header-status">
            <span className="status-dot" />
            Product API integration
          </span>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}

export default AppShell
