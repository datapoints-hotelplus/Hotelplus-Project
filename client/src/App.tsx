import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import KolsLayout from "./layouts/KolsLayout";
import CalculatorLayout from "./layouts/CalculatorLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/login";
import Kols from "./pages/Marketing-communication/Kols/Kols";
import Personal from "./pages/Personal/Personal";
import Ai from "./pages/Marketing-communication/Ai/Ai";
import History from "./pages/History/History";
import OrmCalculator from "./pages/Online-revenue-mangemanet/OrmCalculator/OrmCalculator";
import Forbidden from "./pages/Forbidden/Forbidden";
import ProtectedRoute from "./components/ProtectedRoute";
import Calculator from "./pages/Marketing-communication/Calculator/Calculator";
import MainLayout from "./layouts/MainLayout";
import OrmCalLayout from "./layouts/OrmCalLayout";
import OrmResults from "./pages/Online-revenue-mangemanet/OrmResults/OrmResults";
import OrmAnalyse from "./pages/Online-revenue-mangemanet/OrmAnalyse/OrmAnalyse";
import OrmManual from "./pages/Online-revenue-mangemanet/OrmManual/OrmManual";
import OrmPresentation from "./pages/Online-revenue-mangemanet/OrmPresentation/OrmPresentation";
import OrmAdr from "./pages/Online-revenue-mangemanet/OrmAdr/OrmAdr";

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
          <Route path="/history" element={<History />} />
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
              <OrmCalLayout /> 
            </ProtectedRoute>
          }
        >
          <Route path="/orm-calculator" element={<OrmCalculator />} />
          <Route path="/orm-results" element={<OrmResults />} />
          <Route path="/orm-analyse" element={<OrmAnalyse />} />
          <Route path="/orm-manual" element={<OrmManual />} />
          <Route path="/orm-presentation" element={<OrmPresentation />} />
          <Route path="/orm-adr" element={<OrmAdr/>} />
        </Route>

        <Route path="/403" element={<Forbidden />} />
      </Routes>
    </BrowserRouter>




  );
}

export default App;
