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
import { JOB_CARD_STATUSES, JOB_PRIORITIES } from "../../utils/constants";

const EditJobCardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    diagnosis: "",
    estimatedCost: "",
    labourCost: "",
    priority: "medium",
    status: "pending",
    assignedEmployee: "",
    expectedCompletionDate: "",
    completedDate: "",
  });

  const fetchJobCard = useCallback(async () => {
    try {
      setLoading(true);
      const [jobRes, empRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.JOBS.BY_ID(id)),
        axiosInstance.get(API_ENDPOINTS.EMPLOYEES.BASE),
      ]);
      const job = jobRes.data.data || jobRes.data;
      setEmployees(empRes.data.data?.items || empRes.data.data || []);
      setForm({
        diagnosis: job.diagnosis || "",
        estimatedCost: job.estimatedCost || "",
        labourCost: job.labourCost || "",
        priority: job.priority || "medium",
        status: job.status || "pending",
        assignedEmployee: job.assignedEmployee?._id || "",
        expectedCompletionDate: job.expectedCompletionDate
          ? new Date(job.expectedCompletionDate).toISOString().split("T")[0]
          : "",
        completedDate: job.completedDate
          ? new Date(job.completedDate).toISOString().split("T")[0]
          : "",
      });
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load job card", "error");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchJobCard();
  }, [fetchJobCard]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        diagnosis: form.diagnosis,
        estimatedCost: form.estimatedCost !== "" ? Number(form.estimatedCost) : 0,
        labourCost: form.labourCost !== "" ? Number(form.labourCost) : 0,
        priority: form.priority,
        assignedEmployee: form.assignedEmployee || null,
        expectedCompletionDate: form.expectedCompletionDate || undefined,
        completedDate: form.completedDate || undefined,
      };

      await axiosInstance.put(API_ENDPOINTS.JOBS.BY_ID(id), payload);

      if (form.status !== undefined) {
        const currentJob = await axiosInstance.get(API_ENDPOINTS.JOBS.BY_ID(id));
        const currentStatus = (currentJob.data.data || currentJob.data).status;
        if (form.status !== currentStatus) {
          await axiosInstance.patch(API_ENDPOINTS.JOBS.STATUS(id), {
            status: form.status,
            notes: "Status updated from edit page",
          });
        }
      }

      addToast("Job card updated successfully", "success");
      navigate(`/jobs/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update job card", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  const employeeOptions = [
    { value: "", label: "Unassigned" },
    ...employees.map((e) => ({ value: e._id, label: e.name })),
  ];

  const priorityOptions = JOB_PRIORITIES.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const statusOptions = JOB_CARD_STATUSES.map((s) => ({
    value: s.key,
    label: s.label,
  }));

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">Edit Job Card</h1>
          <p className="page-subtitle">Update job card details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Job Details</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={statusOptions}
            />
            <Select
              label="Priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              options={priorityOptions}
            />
            <Select
              label="Assign Employee"
              name="assignedEmployee"
              value={form.assignedEmployee}
              onChange={handleChange}
              options={employeeOptions}
            />
            <Input
              label="Estimated Cost (₹)"
              name="estimatedCost"
              type="number"
              value={form.estimatedCost}
              onChange={handleChange}
              placeholder="e.g. 15000"
              min="0"
            />
            <Input
              label="Labour Cost (₹)"
              name="labourCost"
              type="number"
              value={form.labourCost}
              onChange={handleChange}
              placeholder="e.g. 5000"
              min="0"
            />
            <Input
              label="Expected Completion Date"
              name="expectedCompletionDate"
              type="date"
              value={form.expectedCompletionDate}
              onChange={handleChange}
            />
            <Input
              label="Completed Date"
              name="completedDate"
              type="date"
              value={form.completedDate}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Diagnosis"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Describe the diagnosis..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditJobCardPage;
