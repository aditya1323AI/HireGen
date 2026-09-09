function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1>Dashboard</h1>
        <p>Overview of your hiring activity</p>
      </div>

      <div className="topbar-actions">
        <button className="icon-button" aria-label="Search">
          ⌕
        </button>

        <button className="icon-button" aria-label="Notifications">
          ♧
        </button>

        <div className="profile">
          <div className="avatar">A</div>

          <div>
            <strong>Admin</strong>
            <small>HR Team</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;