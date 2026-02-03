import { useState } from "react";
import { useUserRole } from "../../hooks/useUserRole";
import "./Navbar.css";
import logo from "../../assets/logo/Hotelplus-logo.jpg";
import UserMenu from "../../components/Usermenu/UserMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = useUserRole();
  console.log("ROLE =", role);


  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Hotel Plus" />
          </div>

          <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <li>หน้าหลัก</li>
            {role === "MarCom" && <li>Kols</li>}
            {role === "MarCom" && <li>Calculator</li>}
            {role === "ORM" && <li>Shop Competitor Rate</li>}
          </ul>
        </div>

        <div className="nav-right">
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
