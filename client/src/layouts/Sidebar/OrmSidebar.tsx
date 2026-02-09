import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        ORM Calculator
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/orm-calculator"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          Calculator
        </NavLink>

        <NavLink
          to="/orm-manual"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          Manual
        </NavLink>
        
        <NavLink
          to="/orm-presentation"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          Presentation
        </NavLink>

        <NavLink
          to="/orm-adr"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          ADR Calculator
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
