import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/formatters";

const InvoiceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    paymentStatus: "",
    paymentMethod: "",
    additionalCharges: "",
    discount: "",
    notes: "",
  });

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.INVOICES.BY_ID(id));
      const inv = res.data.invoice;
      setInvoice(inv);
      setForm({
        paymentStatus: inv.paymentStatus || "pending",
        paymentMethod: inv.paymentMethod || "cash",
        additionalCharges: inv.additionalCharges || "",
        discount: inv.discount || "",
        notes: inv.notes || "",
      });
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        additionalCharges: Number(form.additionalCharges) || 0,
        discount: Number(form.discount) || 0,
        notes: form.notes,
      };
      await axiosInstance.put(API_ENDPOINTS.INVOICES.BY_ID(id), payload);
      addToast("Invoice updated successfully", "success");
      navigate(`/invoices/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update invoice", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!invoice) return null;

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const methodOptions = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "none", label: "None" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Current total: {formatCurrency(invoice.grandTotal)}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Payment Status"
              options={statusOptions}
              value={form.paymentStatus}
              onChange={(e) => handleChange("paymentStatus", e.target.value)}
            />
            <Select
              label="Payment Method"
              options={methodOptions}
              value={form.paymentMethod}
              onChange={(e) => handleChange("paymentMethod", e.target.value)}
            />
            <Input
              label="Additional Charges (₹)"
              type="number"
              value={form.additionalCharges}
              onChange={(e) => handleChange("additionalCharges", e.target.value)}
              min="0"
              placeholder="0"
            />
            <Input
              label="Discount (₹)"
              type="number"
              value={form.discount}
              onChange={(e) => handleChange("discount", e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>

          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add any notes about this invoice..."
            rows={4}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(`/invoices/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} icon={Save}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InvoiceEditPage;
