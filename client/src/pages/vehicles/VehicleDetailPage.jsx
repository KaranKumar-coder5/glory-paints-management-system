import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ChevronRight,
  User,
  Phone,
  Mail,
  Car,
  Wrench,
  FileText,
  Clock,
  Camera,
  ClipboardList,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { FullPageSpinner } from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { VEHICLE_STATUSES } from "../../utils/constants";
import { formatDate, formatCurrency, formatStatus } from "../../utils/formatters";
import { cn } from "../../utils/helpers";

const STATUS_ORDER = [
  "received",
  "inspection",
  "repair",
  "painting",
  "quality_check",
  "fc_inspection",
  "ready_for_delivery",
  "delivered",
];

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);
  const { isOwner } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [invoice, setInvoice] = useState(null);

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.VEHICLES.BY_ID(id));
      setVehicle(response.data.data || response.data.vehicle || response.data);
      try {
        const invoiceRes = await axiosInstance.get(API_ENDPOINTS.INVOICES.BASE, {
          params: { search: id, limit: 1 },
        });
        const invoices = invoiceRes.data.invoices || [];
        setInvoice(invoices.length > 0 ? invoices[0] : null);
      } catch {
        setInvoice(null);
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to fetch vehicle details", "error");
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const currentStatusIndex = vehicle
    ? STATUS_ORDER.indexOf(vehicle.currentStatus)
    : -1;

  const canAdvance =
    vehicle &&
    vehicle.currentStatus !== "delivered";

  const nextStatus =
    canAdvance && currentStatusIndex < STATUS_ORDER.length - 1
      ? STATUS_ORDER[currentStatusIndex + 1]
      : null;

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await axiosInstance.patch(
        API_ENDPOINTS.VEHICLES.UPDATE_STATUS(id),
        { status: nextStatus, notes: statusNotes }
      );
      addToast("Vehicle status updated successfully", "success");
      setStatusModalOpen(false);
      setStatusNotes("");
      fetchVehicle();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(API_ENDPOINTS.VEHICLES.BY_ID(id));
      addToast("Vehicle deleted successfully", "success");
      navigate("/vehicles");
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to delete vehicle", "error");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/vehicles")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h1>
            <p className="text-sm text-gray-500">
              Job ID: {vehicle.jobId}
            </p>
          </div>
        </div>
        <StatusBadge status={vehicle.currentStatus} />
      </div>

      {/* Status Progress */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Status Progress
        </h2>
        <div className="flex items-center justify-between">
          {STATUS_ORDER.map((status, index) => (
            <div key={status} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2",
                    index < currentStatusIndex
                      ? "bg-primary-600 border-primary-600 text-white"
                      : index === currentStatusIndex
                        ? "bg-primary-100 border-primary-600 text-primary-600"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                  )}
                >
                  {index < currentStatusIndex ? "✓" : index + 1}
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs text-center",
                    index <= currentStatusIndex
                      ? "text-primary-600 font-medium"
                      : "text-gray-500"
                  )}
                >
                  {formatStatus(status)}
                </p>
              </div>
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mt-[-20px]",
                    index < currentStatusIndex
                      ? "bg-primary-600"
                      : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Job ID" value={vehicle.jobId} />
              <InfoItem label="Vehicle Type" value={vehicle.vehicleType} />
              <InfoItem label="Make" value={vehicle.make} />
              <InfoItem label="Model" value={vehicle.model} />
              <InfoItem label="Year" value={vehicle.year} />
              <InfoItem label="Color" value={vehicle.color} />
              <InfoItem label="Fuel Type" value={vehicle.fuelType} />
              <InfoItem label="Odometer" value={`${vehicle.odometer || 0} km`} />
              <InfoItem label="License Plate" value={vehicle.licensePlate || "-"} />
              <InfoItem label="Engine Number" value={vehicle.engineNumber || "-"} />
              <InfoItem label="Chassis Number" value={vehicle.chassisNumber || "-"} />
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h2>
            {vehicle.customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {vehicle.customer.name}
                    </p>
                  </div>
                </div>
                {vehicle.customer.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-700">{vehicle.customer.phone}</p>
                  </div>
                )}
                {vehicle.customer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700">{vehicle.customer.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No customer information available</p>
            )}
          </Card>

          {/* Notes & Complaints */}
          {(vehicle.complaintDescription || vehicle.inspectionNotes || vehicle.repairNotes) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes & Complaints
              </h2>
              <div className="space-y-4">
                {vehicle.complaintDescription && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Complaint
                    </p>
                    <p className="text-sm text-gray-700 bg-red-50 border border-red-100 rounded-md p-3">
                      {vehicle.complaintDescription}
                    </p>
                  </div>
                )}
                {vehicle.inspectionNotes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Inspection Notes
                    </p>
                    <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-md p-3">
                      {vehicle.inspectionNotes}
                    </p>
                  </div>
                )}
                {vehicle.repairNotes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Repair Notes
                    </p>
                    <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-md p-3">
                      {vehicle.repairNotes}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Vehicle Images */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Vehicle Images
            </h2>
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vehicle.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={image.url || image}
                      alt={`Vehicle image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No images uploaded</p>
              </div>
            )}
          </Card>

          {/* Status History */}
          {vehicle.statusHistory && vehicle.statusHistory.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status History
              </h2>
              <div className="space-y-4">
                {[...vehicle.statusHistory].reverse().map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.date || entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Changed by {entry.changedBy?.name || entry.changedBy || "System"}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Service Details
            </h2>
            <div className="space-y-4">
              <InfoItem label="Service Type" value={vehicle.serviceType || "-"} />
              <InfoItem
                label="Estimated Cost"
                value={vehicle.estimatedCost ? formatCurrency(vehicle.estimatedCost) : "-"}
              />
              <InfoItem
                label="Actual Cost"
                value={vehicle.actualCost ? formatCurrency(vehicle.actualCost) : "-"}
              />
              <InfoItem
                label="Assigned Employee"
                value={vehicle.assignedEmployee?.name || vehicle.assignedEmployee || "-"}
              />
              <InfoItem
                label="Estimated Delivery"
                value={vehicle.estimatedDeliveryDate ? formatDate(vehicle.estimatedDeliveryDate) : "-"}
              />
              <InfoItem
                label="Actual Delivery"
                value={vehicle.actualDeliveryDate ? formatDate(vehicle.actualDeliveryDate) : "-"}
              />
              <div className="border-t border-gray-100 pt-4 mt-4">
                <InfoItem label="Created At" value={formatDate(vehicle.createdAt)} />
              </div>
              <InfoItem
                label="Created By"
                value={vehicle.createdBy?.name || vehicle.createdBy || "-"}
              />
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to={`/vehicles/${id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Vehicle
                </Button>
              </Link>

              {canAdvance && (
                <Button
                  variant="default"
                  className="w-full justify-start gap-2"
                  onClick={() => setStatusModalOpen(true)}
                >
                  <ChevronRight className="h-4 w-4" />
                  Update Status to {formatStatus(nextStatus)}
                </Button>
              )}

              <Link to={`/jobs/new/${id}`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Create Job Card
                </Button>
              </Link>

              {vehicle.customer && (
                <Link
                  to={`/customers/${vehicle.customer._id || vehicle.customer}`}
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    View Customer History
                  </Button>
                </Link>
              )}

              {invoice && (
                <Link to={`/invoices/${invoice._id}`} className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    View Invoice
                    <Badge
                      color={invoice.paymentStatus === "paid" ? "green" : invoice.paymentStatus === "pending" ? "red" : "yellow"}
                      className="ml-auto"
                    >
                      {invoice.paymentStatus === "paid" ? "Paid" : invoice.paymentStatus === "pending" ? "Unpaid" : "Partial"}
                    </Badge>
                  </Button>
                </Link>
              )}

              {isOwner && (
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Vehicle
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status to ${formatStatus(nextStatus)}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to change the vehicle status to{" "}
            <span className="font-semibold">{formatStatus(nextStatus)}</span>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Add any notes about this status change..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStatusModalOpen(false);
                setStatusNotes("");
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "Updating..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default VehicleDetailPage;
