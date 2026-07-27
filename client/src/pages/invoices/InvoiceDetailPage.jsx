import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Car,
  User,
  Phone,
  CreditCard,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  DollarSign,
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
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { formatDate, formatCurrency, formatStatus } from "../../utils/formatters";

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);
  const { isOwner } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.INVOICES.BY_ID(id));
      setInvoice(res.data.invoice);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load invoice", "error");
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleMarkPaid = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.patch(API_ENDPOINTS.INVOICES.MARK_PAID(id), {
        paymentMethod: invoice.paymentMethod !== "none" ? invoice.paymentMethod : "cash",
      });
      addToast("Invoice marked as paid", "success");
      fetchInvoice();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to mark as paid", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartialPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      addToast("Enter a valid amount", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.patch(API_ENDPOINTS.INVOICES.PARTIAL_PAYMENT(id), {
        amount: Number(payAmount),
        paymentMethod: payMethod,
      });
      addToast("Payment recorded successfully", "success");
      setPayModalOpen(false);
      setPayAmount("");
      fetchInvoice();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to record payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.patch(API_ENDPOINTS.INVOICES.CANCEL(id));
      addToast("Invoice cancelled", "success");
      fetchInvoice();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel invoice", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.delete(API_ENDPOINTS.INVOICES.BY_ID(id));
      addToast("Invoice deleted successfully", "success");
      navigate("/invoices");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete invoice", "error");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) return <FullPageSpinner />;
  if (!invoice) return null;

  const remaining = invoice.grandTotal - (invoice.amountPaid || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Job Card: {invoice.jobCard?.jobId || "—"}
            </p>
          </div>
        </div>
        <StatusBadge status={invoice.paymentStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Invoice Number" value={invoice.invoiceNumber} />
              <InfoItem label="Invoice Date" value={formatDate(invoice.invoiceDate)} />
              <InfoItem label="Due Date" value={formatDate(invoice.dueDate)} />
              <InfoItem label="Job Card" value={invoice.jobCard?.jobId || "—"} />
              <InfoItem
                label="Job Status"
                value={invoice.jobCard?.status ? formatStatus(invoice.jobCard.status) : "—"}
              />
              <InfoItem
                label="Created By"
                value={invoice.createdBy?.name || "—"}
              />
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Job ID" value={invoice.vehicle?.jobId || "—"} />
              <InfoItem label="Make" value={invoice.vehicle?.make || "—"} />
              <InfoItem label="Model" value={invoice.vehicle?.model || "—"} />
              <InfoItem label="Color" value={invoice.vehicle?.color || "—"} />
              <InfoItem label="License Plate" value={invoice.vehicle?.licensePlate || "—"} />
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Name" value={invoice.customerName} />
              <InfoItem label="Phone" value={invoice.customerPhone} />
            </div>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-md p-3">
                {invoice.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Breakdown */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Parts Cost</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.partsCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Labour Cost</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.labourCost)}
                </span>
              </div>
              {invoice.additionalCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Additional Charges</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.additionalCharges)}
                  </span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className="text-sm font-medium text-green-600">
                    -{formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Subtotal
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  GST ({invoice.taxRate || 18}%)
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm font-bold text-gray-900">Grand Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(invoice.grandTotal)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(invoice.amountPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(remaining > 0 ? remaining : 0)}
                </span>
              </div>
              {invoice.paymentMethod !== "none" && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {formatStatus(invoice.paymentMethod)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={invoice.paymentStatus} />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {isOwner && invoice.paymentStatus !== "paid" && invoice.paymentStatus !== "cancelled" && (
                <Button
                  className="w-full justify-start gap-2"
                  onClick={handleMarkPaid}
                  disabled={actionLoading}
                  icon={CheckCircle}
                >
                  Mark as Paid
                </Button>
              )}

              {isOwner && invoice.paymentStatus !== "paid" && invoice.paymentStatus !== "cancelled" && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setPayModalOpen(true)}
                  icon={DollarSign}
                >
                  Record Payment
                </Button>
              )}

              {isOwner && invoice.paymentStatus !== "cancelled" && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/invoices/${id}/edit`)}
                  icon={Edit}
                >
                  Edit Invoice
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handlePrint}
                icon={Printer}
              >
                Print Invoice
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleDownload}
                icon={Download}
              >
                Download PDF
              </Button>

              {isOwner && (
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => setDeleteDialogOpen(true)}
                  icon={Trash2}
                >
                  Delete Invoice
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Partial Payment Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Payment"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Remaining balance: <span className="font-semibold">{formatCurrency(remaining)}</span>
          </p>
          <Input
            label="Payment Amount"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
            min="0"
            max={remaining}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPayModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handlePartialPayment} disabled={actionLoading || !payAmount}>
              {actionLoading ? "Processing..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`}
        confirmText={actionLoading ? "Deleting..." : "Delete"}
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

export default InvoiceDetailPage;
