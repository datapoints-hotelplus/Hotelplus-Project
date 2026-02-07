import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import CalculatorSidebar from "../layouts/Sidebar/CalculatorSidebar";

const CalculatorLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="layout">
        <CalculatorSidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default CalculatorLayout;
