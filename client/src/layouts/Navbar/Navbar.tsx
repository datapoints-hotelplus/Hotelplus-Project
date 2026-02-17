import { useState } from "react";
import { useAuth } from "../../AuthProvider";
import "./Navbar.css";
import UserMenu from "../../components/Usermenu/UserMenu";
import UserRoleBadge from "../../components/UserRoleBadge/UserRoleBadge";
import { Link } from "react-router-dom";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { role, loading } = useAuth();
  const isAdmin = role === "Admin";
  const isMarCom = role === "MarCom" || isAdmin;
  const isOrm = role === "ORM" || isAdmin;


  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src="/logo/logo.png" alt="Hotelplus" /> 
          </div>

          <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <li><Link to="/">หน้าหลัก</Link></li>

            {!loading && isMarCom && (
              <>
                <li><Link to="/kols">Kols</Link></li>
              </>
            )}

            {!loading && isOrm && (
              <li><Link to="/orm-calculator">ORM Calculator</Link></li>
            )}
          </ul>
        </div>

        <div className="nav-right">
          {!loading && <UserRoleBadge />}
          {!loading && <UserMenu />}
        </div>

        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </div>
      </nav>
    </header>
  );
}
