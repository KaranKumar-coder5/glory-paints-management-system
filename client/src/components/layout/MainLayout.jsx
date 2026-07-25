import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "../ui/Toast";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Topbar />
        <main>
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};

export default MainLayout;
