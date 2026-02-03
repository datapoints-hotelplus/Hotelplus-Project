import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./login.css";
import logo from "../../assets/logo/Hotelplus-logo.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/"); // 🔥 บรรทัดสำคัญ
    }
  };

  return (
    <form
      className="login-page"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
>
  <div className="login-card">
    <img src={logo} alt="Hotel Plus" className="login-logo" />
    <h2 className="login-title">เข้าสู่ระบบ</h2>

    <label>อีเมล</label>
    <input
      type="email"
      placeholder="กรุณากรอกชื่อผู้ใช้"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <label>รหัสผ่าน</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button className="login-button" type="submit" disabled={!email || !password}>
      เข้าสู่ระบบ
    </button>
  </div>
</form>

  );
}
