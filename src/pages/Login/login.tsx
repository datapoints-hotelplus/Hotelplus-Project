import "./login.css"; 
import logo from "../../assets/logo/Hotelplus-logo.jpg"

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Hotel Plus" className="login-logo" />

        <h2 className="login-title">เข้าสู่ระบบ</h2>

        <label>ชื่อผู้ใช้</label>
        <input
          type="email"
          placeholder="กรุณากรอกชื่อผู้ใช้"
        />

        <label>รหัสผ่าน</label>
        <input
          type="password"
          placeholder=""
        />

        <button className="login-button">Log in</button>
      </div>
    </div>
  );
}
