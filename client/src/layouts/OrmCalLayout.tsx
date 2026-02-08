import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import '../styles/layout.css'
import OrmSidebar from "./Sidebar/OrmSidebar";

const OrmCalLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="layout">
        <OrmSidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
};
export default OrmCalLayout
