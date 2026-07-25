import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Button from "../components/ui/Button";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button icon={Home}>Go to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
