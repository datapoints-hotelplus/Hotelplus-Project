import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Calculator
      </div>

      <nav className="sidebar-menu">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
           คำนวณ
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
