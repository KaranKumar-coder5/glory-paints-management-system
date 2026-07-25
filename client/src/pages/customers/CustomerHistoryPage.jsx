import { Users } from "lucide-react";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";

const CustomerHistoryPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">View customer history and vehicle records</p>
      </div>

      <div className="mb-4">
        <SearchInput placeholder="Search by customer name or phone number..." />
      </div>

      <EmptyState
        icon={Users}
        title="No customers found"
        description="Customer records are created when vehicles are registered."
      />
    </div>
  );
};

export default CustomerHistoryPage;
