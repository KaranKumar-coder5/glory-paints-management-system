import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { JOB_PRIORITIES } from "../../utils/constants";

const CreateJobCardPage = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { addToast } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    vehicle: vehicleId || "",
    assignedEmployee: "",
    diagnosis: "",
    estimatedCost: "",
    labourCost: "",
    priority: "medium",
    expectedCompletionDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, empRes] = await Promise.all([
          axiosInstance.get(API_ENDPOINTS.VEHICLES.BASE, { params: { limit: 200 } }),
          axiosInstance.get(API_ENDPOINTS.EMPLOYEES.BASE),
        ]);
        setVehicles(vehRes.data.data?.items || []);
        setEmployees(empRes.data.data?.items || empRes.data.data || []);
      } catch {
        // silent
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle) {
      addToast("Please select a vehicle", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        vehicle: form.vehicle,
        diagnosis: form.diagnosis,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : 0,
        labourCost: form.labourCost ? Number(form.labourCost) : 0,
        priority: form.priority,
        expectedCompletionDate: form.expectedCompletionDate || undefined,
        assignedEmployee: form.assignedEmployee || undefined,
      };

      const { data } = await axiosInstance.post(API_ENDPOINTS.JOBS.BASE, payload);
      addToast("Job card created successfully", "success");
      navigate(`/jobs/${data.data._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create job card", "error");
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    value: v._id,
    label: `${v.jobId} — ${v.make} ${v.model} (${v.licensePlate})`,
  }));

  const employeeOptions = employees.map((e) => ({ value: e._id, label: e.name }));

  const priorityOptions = JOB_PRIORITIES.map((p) => ({
    value: p.value,
    label: p.label,
  }));

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">Create Job Card</h1>
          <p className="page-subtitle">Assign a new repair job to a vehicle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Job Details</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {!vehicleId && (
              <div className="md:col-span-2">
                <Select
                  label="Vehicle *"
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleChange}
                  options={vehicleOptions}
                  placeholder="Select vehicle"
                  required
                />
              </div>
            )}
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
              placeholder="Select employee"
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
            <Textarea
              label="Diagnosis"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="Describe the issue or initial diagnosis..."
              rows={3}
              className="md:col-span-2"
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Save}>
            Create Job Card
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobCardPage;
