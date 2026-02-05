import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/login";
import Kols from "./pages/Kols/Kols";
import ShopRate from "./pages/Shoprate/ShopRate";
import Forbidden from "./pages/Forbidden/Forbidden";
import ProtectedRoute from "./components/ProtectedRoute";
import Calculator from "./pages/Calculator/Calculator";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* หน้า login ไม่ต้องกัน */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ทุกหน้าข้างล่างต้อง login ก่อน */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />

          {/* MarCom เท่านั้น */}
          <Route
            path="/kols"
            element={
              <ProtectedRoute allowedRoles={["MarCom"]}>
                <Kols />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculator"
            element={
              <ProtectedRoute allowedRoles={["MarCom"]}>
                <Calculator />
              </ProtectedRoute>
            }
          />

          {/* ORM เท่านั้น */}
          <Route
            path="/shop-rate"
            element={
              <ProtectedRoute allowedRoles={["ORM"]}>
                <ShopRate />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/403" element={<Forbidden />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
