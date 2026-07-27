import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Car, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
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
import { VEHICLE_STATUSES, VEHICLE_TYPES } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";

const VehicleListPage = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);
  const { isOwner } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", vehicleType: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.status) params.status = filters.status;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;

      const { data } = await axiosInstance.get(API_ENDPOINTS.VEHICLES.BASE, { params });
      setVehicles(data.data?.items || []);
      setPagination(data.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      addToast("Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters, addToast]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(API_ENDPOINTS.VEHICLES.BY_ID(deleteTarget._id));
      addToast("Vehicle deleted successfully", "success");
      setDeleteTarget(null);
      fetchVehicles();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...VEHICLE_STATUSES.map((s) => ({ value: s.key, label: s.label })),
  ];
  const typeOptions = [{ value: "", label: "All Types" }, ...VEHICLE_TYPES];

  const hasActiveFilters = filters.status || filters.vehicleType;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Manage all registered vehicles</p>
        </div>
        <Link to="/vehicles/new">
          <Button icon={Plus}>Register Vehicle</Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by Job ID, plate, customer name, or phone..."
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
              label="Vehicle Type"
              value={filters.vehicleType}
              onChange={(e) => setFilters((f) => ({ ...f, vehicleType: e.target.value }))}
              options={typeOptions}
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => setFilters({ status: "", vehicleType: "" })}
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
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles found"
            description={
              search || hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Register your first vehicle to get started."
            }
            action={
              !search && !hasActiveFilters ? (
                <Link to="/vehicles/new">
                  <Button icon={Plus}>Register Vehicle</Button>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Registered</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((v) => (
                    <tr
                      key={v._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/vehicles/${v._id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-primary-600">{v.jobId}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{v.make} {v.model}</p>
                        <p className="text-xs text-gray-500">{v.licensePlate}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{v.customer?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{v.customer?.phone}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.currentStatus} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {v.assignedEmployee?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden xl:table-cell">{formatDate(v.createdAt)}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/vehicles/${v._id}`)}
                            className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded"
                          >
                            View
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => setDeleteTarget(v)}
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
                  Page {pagination.page} of {pagination.pages} ({pagination.total} vehicles)
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
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteTarget?.jobId} (${deleteTarget?.make} ${deleteTarget?.model})? This action can be undone later.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default VehicleListPage;
