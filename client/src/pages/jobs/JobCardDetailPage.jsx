import { ClipboardList } from "lucide-react";

const JobCardDetailPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Job Card Details</h1>
        <p className="page-subtitle">View job card information</p>
      </div>
      <div className="card p-8 text-center">
        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Job card details coming soon</p>
      </div>
    </div>
  );
};

export default JobCardDetailPage;
