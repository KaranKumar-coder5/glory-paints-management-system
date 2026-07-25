import { Car } from "lucide-react";

const VehicleDetailPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Vehicle Details</h1>
        <p className="page-subtitle">View vehicle information and status</p>
      </div>
      <div className="card p-8 text-center">
        <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Vehicle details coming soon</p>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
