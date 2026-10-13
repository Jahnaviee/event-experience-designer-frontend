import { Link } from "react-router-dom";

function Sidebar() {

  return (
    <aside className="sidebar">

      <div className="logo">

        <div className="logo-icon">
          E
        </div>

        <div>
          <h2>Evently</h2>
          <span>Experience Designer</span>
        </div>

      </div>


      <nav>

        <p className="menu-title">
          WORKSPACE
        </p>

        <Link to="/" className="nav-item">
          <span>⌂</span>
          Dashboard
        </Link>

        <Link to="/events" className="nav-item">
          <span>◫</span>
          My Events
        </Link>

        <Link to="/create-event" className="nav-item">
          <span>＋</span>
          Create Event
        </Link>


        <p className="menu-title">
          MANAGE
        </p>

        <Link to="/settings" className="nav-item">
          <span>⚙</span>
          Settings
        </Link>

      </nav>


      <div className="sidebar-bottom">

        <div className="help-box">

          <strong>Need help?</strong>

          <p>
            Learn how to design your first campus event.
          </p>

          <button>
            View Guide
          </button>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;