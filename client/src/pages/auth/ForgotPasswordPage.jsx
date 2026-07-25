import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ForgotPasswordPage = () => {
  return (
    <div className="text-center space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Forgot Password</h3>
      <p className="text-sm text-gray-500">
        Contact the system administrator to reset your password.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
