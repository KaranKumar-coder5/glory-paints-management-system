import { ShieldCheck } from "lucide-react";

const FCDetailPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">FC Certificate Details</h1>
        <p className="page-subtitle">View FC certificate information</p>
      </div>
      <div className="card p-8 text-center">
        <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">FC certificate details coming soon</p>
      </div>
    </div>
  );
};

export default FCDetailPage;
