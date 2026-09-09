import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-mark">H</div>
        <span>HireGen</span>
      </div>

      <nav className="navigation">

        <p className="nav-label">MAIN</p>

        <NavLink to="/" className="nav-item">
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/candidates" className="nav-item">
          <span>♙</span>
          Candidates
        </NavLink>

        <NavLink to="/jobs" className="nav-item">
          <span>▤</span>
          Jobs
        </NavLink>

        <NavLink to="/ai-screening" className="nav-item">
          <span>✓</span>
          AI Screening
        </NavLink>

        <p className="nav-label section-label">
          MANAGE
        </p>

        <NavLink to="/assessments" className="nav-item">
          <span>◫</span>
          Assessments
        </NavLink>

        <NavLink to="/analytics" className="nav-item">
          <span>◔</span>
          Analytics
        </NavLink>

      </nav>

      <div className="sidebar-bottom">

        <NavLink to="/settings" className="nav-item">
          <span>⚙</span>
          Settings
        </NavLink>

        <div className="user-mini">

          <div className="avatar">
            A
          </div>

          <div>
            <strong>Admin</strong>
            <small>Recruiter</small>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;