import { useState } from "react";
import { useUserRole } from "../../hooks/useUserRole";
import "./Navbar.css";
import logo from "../../assets/logo/Hotelplus-logo.jpg";
import UserMenu from "../../components/Usermenu/UserMenu";
import UserRoleBadge from "../../components/UserRoleBadge/UserRoleBadge";
import { Link } from "react-router-dom";



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { role, loading } = useUserRole();
  if (loading) return null;
  console.log("ROLE =", role);


  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Hotel Plus" />
          </div>

          <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <li><Link to ="/">หน้าหลัก</Link></li>

            {role === "MarCom" && (
              <>
                <li><Link to ="/kols">Kols</Link></li>
                <li><Link to="/calculator">Calculator</Link></li>
              </>
            )}

            {role === "ORM" && <li>Shop Competitor Rate</li>}
          </ul>
        </div>

        <div className="nav-right">
          <UserRoleBadge />
          <UserMenu />
          
        </div>

        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </header>
  );
}
