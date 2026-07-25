import { Link } from "react-router-dom";
import { Plus, ClipboardList } from "lucide-react";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";

const JobCardListPage = () => {
  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Job Cards</h1>
          <p className="page-subtitle">Manage repair and service jobs</p>
        </div>
      </div>

      <div className="mb-4">
        <SearchInput placeholder="Search job cards..." />
      </div>

      <EmptyState
        icon={ClipboardList}
        title="No job cards"
        description="Job cards are created when vehicles are registered."
      />
    </div>
  );
};

export default JobCardListPage;
