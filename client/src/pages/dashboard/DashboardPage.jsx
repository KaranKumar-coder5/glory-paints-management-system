import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  ClipboardList,
  Users,
  Package,
  ShieldCheck,
  Wrench,
  Paintbrush,
  CheckCircle,
  Truck,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import useAuth from "../../hooks/useAuth";
import { AppContext } from "../../context/AppContext";
import StatsCard from "../../components/ui/StatsCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner, { FullPageSpinner } from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import { formatDate, formatCurrency, formatStatus } from "../../utils/formatters";

const STATUS_COLORS_PIE = [
  "#3b82f6", "#eab308", "#f97316", "#a855f7",
  "#06b6d4", "#14b8a6", "#22c55e", "#6b7280",
];

const OwnerDashboard = ({ summary, statusDist, revenue, activity }) => {
  return (
    <>
      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Vehicles" value={summary.totalVehicles} icon={Car} color="primary" />
        <StatsCard title="Received" value={summary.received} icon={Truck} color="blue" />
        <StatsCard title="Under Repair" value={summary.repair} icon={Wrench} color="red" />
        <StatsCard title="Painting" value={summary.painting} icon={Paintbrush} color="purple" />
        <StatsCard title="Ready for Delivery" value={summary.readyForDelivery} icon={CheckCircle} color="green" />
        <StatsCard title="Delivered" value={summary.delivered} icon={CheckCircle} color="primary" />
        <StatsCard title="Pending FC" value={summary.pendingFCs?.length || 0} icon={ShieldCheck} color="yellow" />
        <StatsCard title="Employees" value={summary.totalEmployees} icon={Users} color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution Pie */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Vehicles by Status</h3>
          </div>
          <div className="px-6 py-4">
            {statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No vehicles yet</p>
            )}
          </div>
        </Card>

        {/* Monthly Revenue Bar */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Monthly Revenue</h3>
          </div>
          <div className="px-6 py-4">
            {revenue.some((r) => r.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">No revenue data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Vehicles */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Recent Vehicles</h3>
              <Link
                to="/vehicles"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.recentVehicles?.length > 0 ? (
                    summary.recentVehicles.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/vehicles/${v._id}`}>
                        <td className="px-6 py-3 text-sm font-medium text-primary-600">{v.jobId}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{v.make} {v.model}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{v.customer?.name}</td>
                        <td className="px-6 py-3"><StatusBadge status={v.currentStatus} /></td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(v.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No vehicles registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-6 py-2 max-h-[420px] overflow-y-auto">
            {activity.length > 0 ? (
              <div className="space-y-1">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{a.changedBy}</span>{" "}
                        updated <span className="font-medium text-primary-600">{a.jobId}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatStatus(a.fromStatus || "new")} → {formatStatus(a.toStatus)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Low Stock Alerts */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Low Stock Alerts
            </h3>
            <Link
              to="/inventory"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-6 py-2">
            {summary.lowStockItems?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {summary.lowStockItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-gray-400">min: {item.minStockLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">All stock levels healthy</p>
            )}
          </div>
        </Card>

        {/* Pending FC Certificates */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-500" />
              Pending FC Certificates
            </h3>
            <Link
              to="/fc"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-6 py-2">
            {summary.pendingFCs?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {summary.pendingFCs.map((fc) => (
                  <div key={fc._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {fc.vehicle?.make} {fc.vehicle?.model}
                      </p>
                      <p className="text-xs text-gray-500">{fc.jobId} · {fc.vehicle?.licensePlate}</p>
                    </div>
                    <Badge color="yellow">Pending</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No pending FC certificates</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

const EmployeeDashboard = ({ data }) => {
  const getStatusIcon = (status) => {
    const icons = {
      received: Truck,
      inspection: ClipboardList,
      repair: Wrench,
      painting: Paintbrush,
      quality_check: CheckCircle,
      fc_inspection: ShieldCheck,
      ready_for_delivery: CheckCircle,
      delivered: CheckCircle,
    };
    return icons[status] || ClipboardList;
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Assigned Vehicles"
          value={data.totalAssigned}
          icon={Car}
          color="primary"
        />
        <StatsCard
          title="In Progress"
          value={data.assignedVehicles?.filter((v) => !["received", "delivered"].includes(v.currentStatus)).length || 0}
          icon={Wrench}
          color="yellow"
        />
        <StatsCard
          title="Recent Updates"
          value={data.recentUpdates?.length || 0}
          icon={Clock}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Vehicles */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">My Assigned Vehicles</h3>
          </div>
          <div className="px-6 py-2">
            {data.assignedVehicles?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {data.assignedVehicles.map((v) => {
                  const StatusIcon = getStatusIcon(v.currentStatus);
                  return (
                    <div key={v._id} className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <StatusIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{v.jobId}</p>
                          <StatusBadge status={v.currentStatus} />
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {v.make} {v.model} · {v.licensePlate}
                        </p>
                        <p className="text-xs text-gray-400">
                          {v.customer?.name} · {formatStatus(v.serviceType)}
                        </p>
                      </div>
                      <Link
                        to={`/vehicles/${v._id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 flex-shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No vehicles assigned</p>
            )}
          </div>
        </Card>

        {/* Recent Updates */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Recent Updates</h3>
          </div>
          <div className="px-6 py-2 max-h-[400px] overflow-y-auto">
            {data.recentUpdates?.length > 0 ? (
              <div className="space-y-1">
                {data.recentUpdates.map((u) => (
                  <div key={u.id} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-primary-600">{u.jobId}</span>{" "}
                        {u.vehicle}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Status: {formatStatus(u.toStatus)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(u.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent updates</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

const DashboardPage = () => {
  const { isOwner } = useAuth();
  const { addToast } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [statusDist, setStatusDist] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const requests = [
          axiosInstance.get(API_ENDPOINTS.DASHBOARD.SUMMARY),
          axiosInstance.get(API_ENDPOINTS.DASHBOARD.ACTIVITY),
        ];

        if (isOwner) {
          requests.push(
            axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATUS_DIST),
            axiosInstance.get(API_ENDPOINTS.DASHBOARD.MONTHLY_REVENUE)
          );
        }

        const results = await Promise.all(requests);

        setSummary(results[0].data.data);
        setActivity(results[1].data.data);

        if (isOwner) {
          setStatusDist(results[2].data.data);
          setRevenue(results[3].data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
        addToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isOwner, addToast]);

  if (loading) return <FullPageSpinner />;
  if (error) return (
    <div className="page-container">
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          {isOwner ? "Overview of your workshop" : "Your assigned work"}
        </p>
      </div>

      {isOwner ? (
        <OwnerDashboard
          summary={summary}
          statusDist={statusDist}
          revenue={revenue}
          activity={activity}
        />
      ) : (
        <EmployeeDashboard data={summary || {}} />
      )}
    </div>
  );
};

export default DashboardPage;
