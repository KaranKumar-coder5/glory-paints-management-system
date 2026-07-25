import { Outlet } from "react-router-dom";
import { Car } from "lucide-react";
import Toast from "../ui/Toast";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-xl mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Glory Paints</h1>
          <p className="text-sm text-gray-500 mt-1">Workshop Management System</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Outlet />
        </div>
      </div>
      <Toast />
    </div>
  );
};

export default AuthLayout;
