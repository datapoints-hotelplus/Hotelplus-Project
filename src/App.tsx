import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/home";
import Login from "./pages/Login/login";
import ProtectedRoute from "./components/ProtectedRoute";
import "../src/styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Main Layout (ต้อง login ก่อน) */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
