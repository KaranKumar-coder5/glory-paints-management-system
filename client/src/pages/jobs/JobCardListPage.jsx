import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ClipboardList, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import useAuth from "../../hooks/useAuth";
import useDebounce from "../../hooks/useDebounce";
import { JOB_CARD_STATUSES, JOB_PRIORITIES } from "../../utils/constants";
import { formatDate, formatCurrency } from "../../utils/formatters";

const JobCardListPage = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);
  const { isOwner } = useAuth();

  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchJobCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const { data } = await axiosInstance.get(API_ENDPOINTS.JOBS.BASE, { params });
      setJobCards(data.data?.items || []);
      setPagination(data.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      addToast("Failed to load job cards", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters, addToast]);

  useEffect(() => {
    fetchJobCards();
  }, [fetchJobCards]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(API_ENDPOINTS.JOBS.BY_ID(deleteTarget._id));
      addToast("Job card deleted successfully", "success");
      setDeleteTarget(null);
      fetchJobCards();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  const priorityColors = {
    low: "text-gray-600",
    medium: "text-blue-600",
    high: "text-orange-600",
    urgent: "text-red-600",
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...JOB_CARD_STATUSES.map((s) => ({ value: s.key, label: s.label })),
  ];
  const priorityOptions = [
    { value: "", label: "All Priorities" },
    ...JOB_PRIORITIES,
  ];

  const hasActiveFilters = filters.status || filters.priority;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Job Cards</h1>
          <p className="page-subtitle">Manage repair and service jobs</p>
        </div>
        <Link to="/jobs/new">
          <Button icon={Plus}>Create Job Card</Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by Job ID, diagnosis, or vehicle plate..."
          className="flex-1"
        />
        <Button
          variant={showFilters ? "primary" : "outline"}
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 rounded-full bg-red-500 inline-block" />
          )}
        </Button>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full sm:w-auto">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              options={statusOptions}
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <Select
              label="Priority"
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              options={priorityOptions}
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => setFilters({ status: "", priority: "" })}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Spinner />
          </div>
        ) : jobCards.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No job cards found"
            description={
              search || hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Create your first job card to get started."
            }
            action={
              !search && !hasActiveFilters ? (
                <Link to="/jobs/new">
                  <Button icon={Plus}>Create Job Card</Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Diagnosis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobCards.map((j) => (
                    <tr
                      key={j._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/jobs/${j._id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-primary-600">{j.jobId}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{j.vehicle?.make} {j.vehicle?.model}</p>
                        <p className="text-xs text-gray-500">{j.vehicle?.licensePlate}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell max-w-[200px] truncate">
                        {j.diagnosis || "—"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-sm font-medium capitalize ${priorityColors[j.priority] || "text-gray-600"}`}>
                          {j.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {j.assignedEmployee?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden xl:table-cell">
                        {j.totalCost > 0 ? formatCurrency(j.totalCost) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/jobs/${j._id}`)}
                            className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded"
                          >
                            View
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => setDeleteTarget(j)}
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} job cards)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ChevronLeft}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ChevronRight}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Job Card"
        message={`Are you sure you want to delete job card ${deleteTarget?.jobId}? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default JobCardListPage;
