import { UserCog } from "lucide-react";

const EmployeeFormPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Employee</h1>
        <p className="page-subtitle">Add or edit employee</p>
      </div>
      <div className="card p-8 text-center">
        <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Employee form coming soon</p>
      </div>
    </div>
  );
};

export default EmployeeFormPage;
