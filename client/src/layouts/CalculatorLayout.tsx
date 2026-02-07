import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import CalculatorSidebar from "../layouts/Sidebar/CalculatorSidebar";

const CalculatorLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <CalculatorSidebar />
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default CalculatorLayout;
