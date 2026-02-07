import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import KolsLayout from "./layouts/KolsLayout";
import CalculatorLayout from "./layouts/CalculatorLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/login";
import Kols from "./pages/Kols/Kols";
import Personal from "./pages/Personal/Personal";
import Ai from "./pages/Ai/Ai";
import ShopRate from "./pages/Shoprate/ShopRate";
import Forbidden from "./pages/Forbidden/Forbidden";
import ProtectedRoute from "./components/ProtectedRoute";
import Calculator from "./pages/Calculator/Calculator";
import MainLayout from "./layouts/MainLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Home */} 
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
        </Route>

        {/* KOLS / PERSONAL / AI */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["MarCom"]}>
              <KolsLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/kols" element={<Kols />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/ai-agent" element={<Ai />} />
        </Route>

        {/* CALCULATOR */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["MarCom"]}>
              <CalculatorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/calculator" element={<Calculator />} />
        </Route>

        {/* ORM */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ORM"]}>
              <KolsLayout /> {/* หรือ ORMLayout ถ้ามี */}
            </ProtectedRoute>
          }
        >
          <Route path="/shop-rate" element={<ShopRate />} />
        </Route>

        <Route path="/403" element={<Forbidden />} />
      </Routes>
    </BrowserRouter>




  );
}

export default App;
