import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Login from "./pages/Login/Login";
import "../src/styles/global.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* หน้า Login ใช้ AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* หน้าเว็บหลักใช้ MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
