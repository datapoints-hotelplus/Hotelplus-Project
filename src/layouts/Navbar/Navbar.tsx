import { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo/Hotelplus-logo.jpg";
import UserMenu from "../../components/Usermenu/UserMenu";


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Hotel Plus" />
          </div>

          {/* เมนูปกติ (จอใหญ่) */}
          <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <li>หน้าหลัก</li>
            <li>KOLs</li>
            <li>Menu 3</li>
            <li>Menu 4</li>
            <li>Menu 5</li>
            <li>Menu 6</li>
            <li>Menu 7</li>
          </ul>
        </div>

        <div className="nav-right">
          <UserMenu />
        </div>

        {/* ปุ่ม Hamburger (มือถือ) */}
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
