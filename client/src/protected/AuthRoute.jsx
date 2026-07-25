import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FullPageSpinner } from "../components/ui/Spinner";

const AuthRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default AuthRoute;
