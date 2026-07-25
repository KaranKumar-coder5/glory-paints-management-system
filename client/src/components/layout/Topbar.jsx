import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut, User } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import useAuth from "../../hooks/useAuth";
import { cn } from "../../utils/helpers";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/vehicles": "Vehicles",
  "/vehicles/new": "Register Vehicle",
  "/jobs": "Job Cards",
  "/fc": "FC Certificates",
  "/customers": "Customers",
  "/invoices": "Invoices",
  "/invoices/new": "Create Invoice",
  "/inventory": "Inventory",
  "/employees": "Employees",
};

const Topbar = () => {
  const { toggleSidebar } = useContext(AppContext);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith("/vehicles/") && path.includes("/edit")) return "Edit Vehicle";
    if (path.startsWith("/vehicles/")) return "Vehicle Details";
    if (path.startsWith("/jobs/")) return "Job Card Details";
    if (path.startsWith("/fc/")) return "FC Certificate";
    if (path.startsWith("/invoices/")) return "Invoice";
    if (path.startsWith("/inventory/") && path.includes("/edit")) return "Edit Item";
    if (path.startsWith("/employees/") && path.includes("/edit")) return "Edit Employee";
    if (path.startsWith("/customers/")) return "Customer History";
    return "Glory Paints";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
