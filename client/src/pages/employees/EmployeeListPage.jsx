import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Plus, UserCog, Mail, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useContext(AppContext);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(API_ENDPOINTS.EMPLOYEES.BASE);
        setEmployees(res.data.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load employees");
        addToast("Failed to load employees", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [addToast]);

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage workshop technicians and staff</p>
        </div>
        <Link to="/employees/new">
          <Button icon={Plus}>Add Employee</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : employees.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {employees.map((emp) => (
            <Card key={emp._id} className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                {emp.name?.charAt(0) || "E"}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{emp.name}</h3>
              <Badge color="blue" className="capitalize mb-4">
                {emp.role}
              </Badge>

              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4 text-left">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{emp.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-700 font-medium">Active Staff</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeListPage;
