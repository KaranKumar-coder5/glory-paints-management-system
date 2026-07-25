import { Car } from "lucide-react";

const VehicleRegisterPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Register Vehicle</h1>
        <p className="page-subtitle">Add a new vehicle to the system</p>
      </div>
      <div className="card p-8 text-center">
        <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Vehicle registration form coming soon</p>
      </div>
    </div>
  );
};

export default VehicleRegisterPage;
