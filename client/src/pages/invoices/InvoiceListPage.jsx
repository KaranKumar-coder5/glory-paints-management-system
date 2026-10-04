import { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { FullPageSpinner } from "../../components/ui/Spinner";
import {
  formatDate,
  formatCurrency,
  formatStatus,
} from "../../utils/formatters";

const InvoiceListPage = () => {
  const { addToast } = useContext(AppContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [triggerFetch, setTriggerFetch] = useState(0);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (searchInput) params.search = searchInput;
      if (statusFilter) params.paymentStatus = statusFilter;
      if (methodFilter) params.paymentMethod = methodFilter;
      const res = await axiosInstance.get(API_ENDPOINTS.INVOICES.BASE, { params });
      setInvoices(res.data.data?.invoices || res.data.invoices || []);
      setPagination(res.data.data?.pagination || res.data.pagination || null);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  }, [page, sort, searchInput, statusFilter, methodFilter, addToast]);

  useEffect(() => {
    fetchInvoices();
  }, [triggerFetch, fetchInvoices]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setTriggerFetch((t) => t + 1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
    setTriggerFetch((t) => t + 1);
  };

  const paymentStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentMethodOptions = [
    { value: "", label: "All Methods" },
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Manage billing and payments</p>
        </div>
        <Link to="/invoices/new">
          <Button icon={Plus}>Create Invoice</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              icon={Search}
              placeholder="Search invoices..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          <div className="flex gap-3">
            <Select
              options={paymentStatusOptions}
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
            />
            <Select
              options={paymentMethodOptions}
              value={methodFilter}
              onChange={handleFilterChange(setMethodFilter)}
            />
            <Button
              variant="outline"
              onClick={handleSearch}
              icon={Search}
            >
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <FullPageSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description="No invoices match your current filters."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/invoices/${inv._id}`}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-primary-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {inv.vehicle?.make} {inv.vehicle?.model}
                      <span className="text-xs text-gray-500 ml-1">
                        {inv.vehicle?.licensePlate}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {inv.customerName}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatDate(inv.invoiceDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default InvoiceListPage;
