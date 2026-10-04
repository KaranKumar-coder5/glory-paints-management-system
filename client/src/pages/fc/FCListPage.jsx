import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/formatters";

const FCListPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useContext(AppContext);

  useEffect(() => {
    const fetchFC = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(API_ENDPOINTS.FC.BASE);
        setCertificates(res.data.data || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load FC certificates");
        addToast("Failed to load FC certificates", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFC();
  }, [addToast]);

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" /> Expired
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> Expiring Soon ({diffDays}d)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="w-3 h-3" /> Valid
      </span>
    );
  };

  const getResultBadge = (result) => {
    switch (result) {
      case "passed":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 uppercase">Passed</span>;
      case "failed":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 uppercase">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-50 text-yellow-700 uppercase">Pending</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">FC Certificates</h1>
        <p className="page-subtitle">Manage Vehicle Fitness Certificate records and renewals</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No FC records"
          description="FC certificates will appear here once created."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">FC Number</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Expiry Status</th>
                  <th className="px-6 py-3">Center</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {certificates.map((fc) => (
                  <tr key={fc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium text-primary-600">{fc.fcNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {fc.vehicle?.make} {fc.vehicle?.model}
                      <span className="text-xs text-gray-400 block font-normal">
                        {fc.jobId} · {fc.vehicle?.licensePlate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {fc.vehicle?.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">{getResultBadge(fc.result)}</td>
                    <td className="px-6 py-4">{formatDate(fc.issueDate)}</td>
                    <td className="px-6 py-4 font-medium">{formatDate(fc.expiryDate)}</td>
                    <td className="px-6 py-4">{getExpiryBadge(fc.expiryDate)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{fc.inspectionCenter || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FCListPage;
