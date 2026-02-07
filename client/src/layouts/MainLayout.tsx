import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

const MainLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default MainLayout;
