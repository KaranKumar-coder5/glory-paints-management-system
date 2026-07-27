import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wrench,
  DollarSign,
  Clock,
  User,
  Package,
  MessageSquare,
  Plus,
  X,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import StatusBadge from "../../components/ui/StatusBadge";
import { FullPageSpinner } from "../../components/ui/Spinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Modal from "../../components/ui/Modal";
import { JOB_CARD_STATUSES, JOB_PRIORITIES } from "../../utils/constants";
import { formatDate, formatCurrency, formatStatus } from "../../utils/formatters";
import { cn } from "../../utils/helpers";

const JOB_STATUS_ORDER = [
  "pending",
  "inspection",
  "repair_in_progress",
  "waiting_for_parts",
  "painting",
  "quality_check",
  "completed",
];

const JobCardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);
  const { isOwner } = useAuth();

  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newPart, setNewPart] = useState({ name: "", quantity: "", unitPrice: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchJobCard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(API_ENDPOINTS.JOBS.BY_ID(id));
      setJobCard(data.data || data);
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to fetch job card", "error");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchJobCard();
  }, [fetchJobCard]);

  const handleStatusChange = async () => {
    if (!jobCard) return;
    const currentIdx = JOB_STATUS_ORDER.indexOf(jobCard.status);
    const nextStatus =
      jobCard.status === "cancelled"
        ? null
        : currentIdx < JOB_STATUS_ORDER.length - 1
          ? JOB_STATUS_ORDER[currentIdx + 1]
          : null;

    if (!nextStatus) return;
    setActionLoading(true);
    try {
      await axiosInstance.patch(API_ENDPOINTS.JOBS.STATUS(id), {
        status: nextStatus,
        notes: statusNotes,
      });
      addToast("Status updated successfully", "success");
      setStatusModalOpen(false);
      setStatusNotes("");
      fetchJobCard();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelJob = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.patch(API_ENDPOINTS.JOBS.STATUS(id), {
        status: "cancelled",
        notes: "Job cancelled",
      });
      addToast("Job card cancelled", "success");
      fetchJobCard();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.JOBS.NOTES(id), { note: newNote });
      addToast("Note added successfully", "success");
      setNoteModalOpen(false);
      setNewNote("");
      fetchJobCard();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add note", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveNote = async (noteIndex) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.JOBS.NOTE_AT(id, noteIndex));
      addToast("Note removed", "success");
      fetchJobCard();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove note", "error");
    }
  };

  const handleAddPart = async () => {
    if (!newPart.name || !newPart.quantity || !newPart.unitPrice) {
      addToast("Fill in all part fields", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.JOBS.PARTS(id), {
        name: newPart.name,
        quantity: Number(newPart.quantity),
        unitPrice: Number(newPart.unitPrice),
      });
      addToast("Part added successfully", "success");
      setPartModalOpen(false);
      setNewPart({ name: "", quantity: "", unitPrice: "" });
      fetchJobCard();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add part", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePart = async (partIndex) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.JOBS.PART_AT(id, partIndex));
      addToast("Part removed", "success");
      fetchJobCard();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove part", "error");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(API_ENDPOINTS.JOBS.BY_ID(id));
      addToast("Job card deleted successfully", "success");
      navigate("/jobs");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!jobCard) return null;

  const currentStatusIndex = JOB_STATUS_ORDER.indexOf(jobCard.status);
  const canAdvance =
    jobCard.status !== "completed" && jobCard.status !== "cancelled";
  const nextStatus =
    canAdvance && currentStatusIndex < JOB_STATUS_ORDER.length - 1
      ? JOB_STATUS_ORDER[currentStatusIndex + 1]
      : null;

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Card {jobCard.jobId}</h1>
            <p className="text-sm text-gray-500">
              {jobCard.vehicle?.make} {jobCard.vehicle?.model} — {jobCard.vehicle?.licensePlate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={jobCard.status} />
          <span className={cn("px-2 py-1 text-xs font-medium rounded-full capitalize", priorityColors[jobCard.priority])}>
            {jobCard.priority}
          </span>
        </div>
      </div>

      {/* Status Progress */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Progress</h2>
        <div className="flex items-center justify-between">
          {JOB_STATUS_ORDER.map((status, index) => (
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
                <p className={cn("mt-1 text-xs text-center", index <= currentStatusIndex ? "text-primary-600 font-medium" : "text-gray-500")}>
                  {formatStatus(status)}
                </p>
              </div>
              {index < JOB_STATUS_ORDER.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2 mt-[-20px]", index < currentStatusIndex ? "bg-primary-600" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Customer Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Vehicle Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Job ID" value={jobCard.vehicle?.jobId || "—"} />
              <InfoItem label="Make" value={jobCard.vehicle?.make || "—"} />
              <InfoItem label="Model" value={jobCard.vehicle?.model || "—"} />
              <InfoItem label="License Plate" value={jobCard.vehicle?.licensePlate || "—"} />
              <InfoItem label="Color" value={jobCard.vehicle?.color || "—"} />
              <InfoItem label="Odometer" value={jobCard.vehicle?.odometer ? `${jobCard.vehicle.odometer} km` : "—"} />
            </div>
            {jobCard.vehicle?.customer && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Customer" value={jobCard.vehicle.customer.name} />
                <InfoItem label="Phone" value={jobCard.vehicle.customer.phone} />
                {jobCard.vehicle.customer.email && (
                  <InfoItem label="Email" value={jobCard.vehicle.customer.email} />
                )}
              </div>
            )}
          </Card>

          {/* Diagnosis */}
          {jobCard.diagnosis && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis</h2>
              <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-md p-3">
                {jobCard.diagnosis}
              </p>
            </Card>
          )}

          {/* Repair Notes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Repair Notes ({jobCard.repairNotes?.length || 0})
              </h2>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setNoteModalOpen(true)}>
                Add Note
              </Button>
            </div>
            {jobCard.repairNotes && jobCard.repairNotes.length > 0 ? (
              <div className="space-y-3">
                {[...jobCard.repairNotes].reverse().map((entry, index) => {
                  const originalIndex = jobCard.repairNotes.length - 1 - index;
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{entry.note}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.addedBy?.name || "Unknown"} — {formatDate(entry.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveNote(originalIndex)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No repair notes yet.</p>
            )}
          </Card>

          {/* Parts Used */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Used ({jobCard.partsUsed?.length || 0})
              </h2>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setPartModalOpen(true)}>
                Add Part
              </Button>
            </div>
            {jobCard.partsUsed && jobCard.partsUsed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobCard.partsUsed.map((part, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">{part.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 text-right">{part.quantity}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 text-right">{formatCurrency(part.unitPrice)}</td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(part.total)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleRemovePart(index)} className="p-1 text-gray-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No parts added yet.</p>
            )}
          </Card>

          {/* Status History */}
          {jobCard.statusHistory && jobCard.statusHistory.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status History
              </h2>
              <div className="space-y-4">
                {[...jobCard.statusHistory].reverse().map((entry, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-gray-500">{formatDate(entry.changedAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Changed by {entry.changedBy?.name || "System"}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">{entry.notes}</p>
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
          {/* Cost Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Estimated Cost</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(jobCard.estimatedCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Labour Cost</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(jobCard.labourCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Parts Cost</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(jobCard.partsUsed?.reduce((sum, p) => sum + (p.total || 0), 0) || 0)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Cost</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(jobCard.totalCost)}</span>
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Job Details
            </h2>
            <div className="space-y-4">
              <InfoItem label="Assigned Employee" value={jobCard.assignedEmployee?.name || "—"} />
              <InfoItem label="Start Date" value={formatDate(jobCard.startDate)} />
              <InfoItem label="Expected Completion" value={formatDate(jobCard.expectedCompletionDate)} />
              <InfoItem label="Completed Date" value={formatDate(jobCard.completedDate)} />
              <InfoItem label="Created By" value={jobCard.createdBy?.name || "—"} />
              <InfoItem label="Created At" value={formatDate(jobCard.createdAt)} />
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to={`/jobs/${id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Job Card
                </Button>
              </Link>

              {canAdvance && nextStatus && (
                <Button
                  variant="default"
                  className="w-full justify-start gap-2"
                  onClick={() => setStatusModalOpen(true)}
                >
                  <ChevronRight className="h-4 w-4" />
                  Advance to {formatStatus(nextStatus)}
                </Button>
              )}

              {canAdvance && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-orange-600 hover:bg-orange-50"
                  onClick={handleCancelJob}
                  disabled={actionLoading}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Cancel Job
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Job Card
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
        title={`Advance to ${formatStatus(nextStatus)}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Change status to <span className="font-semibold">{formatStatus(nextStatus)}</span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Add notes about this status change..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setStatusModalOpen(false); setStatusNotes(""); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={actionLoading}>
              {actionLoading ? "Updating..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Add Repair Note">
        <div className="space-y-4">
          <Textarea
            label="Note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Describe the repair progress or findings..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setNoteModalOpen(false); setNewNote(""); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={actionLoading || !newNote.trim()}>
              {actionLoading ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Part Modal */}
      <Modal isOpen={partModalOpen} onClose={() => setPartModalOpen(false)} title="Add Spare Part">
        <div className="space-y-4">
          <Input
            label="Part Name *"
            value={newPart.name}
            onChange={(e) => setNewPart((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Brake Pad Set"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              value={newPart.quantity}
              onChange={(e) => setNewPart((p) => ({ ...p, quantity: e.target.value }))}
              placeholder="1"
              min="1"
            />
            <Input
              label="Unit Price (₹) *"
              type="number"
              value={newPart.unitPrice}
              onChange={(e) => setNewPart((p) => ({ ...p, unitPrice: e.target.value }))}
              placeholder="0"
              min="0"
            />
          </div>
          {newPart.quantity && newPart.unitPrice && (
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold">{formatCurrency(Number(newPart.quantity) * Number(newPart.unitPrice))}</span>
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setPartModalOpen(false); setNewPart({ name: "", quantity: "", unitPrice: "" }); }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddPart} disabled={actionLoading}>
              {actionLoading ? "Adding..." : "Add Part"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Job Card"
        message={`Are you sure you want to delete job card ${jobCard.jobId}? This action cannot be undone.`}
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

export default JobCardDetailPage;
