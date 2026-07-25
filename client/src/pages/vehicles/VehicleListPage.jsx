import { Link } from "react-router-dom";
import { Plus, Car } from "lucide-react";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";

const VehicleListPage = () => {
  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Manage all registered vehicles</p>
        </div>
        <Link to="/vehicles/new">
          <Button icon={Plus}>Register Vehicle</Button>
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput placeholder="Search by Job ID, plate number, or customer..." />
      </div>

      <EmptyState
        icon={Car}
        title="No vehicles registered"
        description="Register your first vehicle to get started."
        action={
          <Link to="/vehicles/new">
            <Button icon={Plus}>Register Vehicle</Button>
          </Link>
        }
      />
    </div>
  );
};

export default VehicleListPage;
