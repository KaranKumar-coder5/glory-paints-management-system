import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Users, Phone, Mail, Car } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import useDebounce from "../../hooks/useDebounce";

const CustomerHistoryPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { addToast } = useContext(AppContext);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.BASE);
        setCustomers(res.data.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customer records");
        addToast("Failed to load customer records", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [addToast]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.phone?.includes(debouncedSearch) ||
      c.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">View customer history and registered vehicle records</p>
      </div>

      <div className="mb-6">
        <SearchInput
          placeholder="Search by customer name, phone number, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="No customer records match your current search."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCustomers.map((cust) => (
            <Card key={cust._id || cust.phone} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {cust.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{cust.name}</h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {cust.vehiclesCount} {cust.vehiclesCount === 1 ? "Vehicle" : "Vehicles"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{cust.phone}</span>
                </div>
                {cust.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cust.email}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Registered Vehicles</p>
                <div className="space-y-2">
                  {cust.vehicles?.map((v) => (
                    <Link
                      key={v._id}
                      to={`/vehicles/${v._id}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-primary-600" />
                        <span className="font-medium text-gray-900">{v.make} {v.model}</span>
                        <span className="text-gray-400">· {v.licensePlate}</span>
                      </div>
                      <StatusBadge status={v.currentStatus} />
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerHistoryPage;
