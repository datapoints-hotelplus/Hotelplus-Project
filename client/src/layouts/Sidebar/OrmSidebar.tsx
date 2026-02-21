import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Calculator
      </div>

      <nav className="sidebar-menu">
        {/* <NavLink
          to="/orm-calculator"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          ORM Package Calculator
        </NavLink> */}

        <NavLink
          to="/orm-presentation"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          ORM Presentation
        </NavLink>

        <NavLink
          to="/marcom-calculator"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          Marcom Package Calculator
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
