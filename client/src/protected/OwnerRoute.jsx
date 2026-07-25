import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FullPageSpinner } from "../components/ui/Spinner";

const OwnerRoute = () => {
  const { isAuthenticated, isOwner, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default OwnerRoute;
