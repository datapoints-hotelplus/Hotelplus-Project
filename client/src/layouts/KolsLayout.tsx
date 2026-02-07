import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import KolsSidebar from "../layouts/Sidebar/KolsSidebar";
import '../styles/layout.css'

const KolsLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="layout">
        <KolsSidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default KolsLayout;
