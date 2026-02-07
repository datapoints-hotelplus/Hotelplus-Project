import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import KolsSidebar from "../layouts/Sidebar/KolsSidebar";

const KolsLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <KolsSidebar />
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default KolsLayout;
