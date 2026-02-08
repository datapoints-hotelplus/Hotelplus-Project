import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Key Opinion Leaders
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/kols"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
           Search Keyword
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          History
        </NavLink>

        <NavLink
          to="/personal"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          Personal
        </NavLink>

        <NavLink
          to="/ai-agent"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          AI agent
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
