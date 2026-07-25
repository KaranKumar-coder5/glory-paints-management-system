import { Link } from "react-router-dom";
import { Plus, UserCog } from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

const EmployeeListPage = () => {
  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage workshop staff</p>
        </div>
        <Link to="/employees/new">
          <Button icon={Plus}>Add Employee</Button>
        </Link>
      </div>

      <EmptyState
        icon={UserCog}
        title="No employees"
        description="Add employees to assign jobs and track work."
        action={
          <Link to="/employees/new">
            <Button icon={Plus}>Add Employee</Button>
          </Link>
        }
      />
    </div>
  );
};

export default EmployeeListPage;
