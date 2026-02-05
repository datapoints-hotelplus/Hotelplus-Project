import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./usermenu.css";

export default function UserMenu() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="user-name" onClick={() => setOpen(!open)}>
        {session.user.email}
      </div>

      {open && (
        <div className="dropdown">
          <button onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      )}
    </div>
  );
}
