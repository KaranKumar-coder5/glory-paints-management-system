import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/endpoints";
import { AppContext } from "../../context/AppContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import DateInput from "../../components/ui/DateInput";
import { VEHICLE_TYPES, FUEL_TYPES, SERVICE_TYPES } from "../../utils/constants";

const VehicleRegisterPage = () => {
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    licensePlate: "",
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    color: "",
    fuelType: "petrol",
    odometer: "",
    serviceType: "repair",
    complaintDescription: "",
    estimatedDeliveryDate: "",
    assignedEmployee: "",
    estimatedCost: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axiosInstance.get(API_ENDPOINTS.EMPLOYEES.BASE);
        setEmployees(data.data?.items || data.data || []);
      } catch {
        // silent - employees list is optional for registration
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        customer: {
          name: form.customerName,
          phone: form.customerPhone,
          email: form.customerEmail,
        },
        licensePlate: form.licensePlate,
        vehicleType: form.vehicleType,
        make: form.make,
        model: form.model,
        year: form.year ? Number(form.year) : undefined,
        color: form.color,
        fuelType: form.fuelType,
        odometer: form.odometer ? Number(form.odometer) : 0,
        serviceType: form.serviceType,
        complaintDescription: form.complaintDescription,
        estimatedDeliveryDate: form.estimatedDeliveryDate || undefined,
        assignedEmployee: form.assignedEmployee || undefined,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : 0,
      };

      const { data } = await axiosInstance.post(API_ENDPOINTS.VEHICLES.BASE, payload);
      addToast("Vehicle registered successfully", "success");
      navigate(`/vehicles/${data.data._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to register vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = employees.map((e) => ({ value: e._id, label: e.name }));

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">Register Vehicle</h1>
          <p className="page-subtitle">Add a new vehicle to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Customer Information</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name *"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
            <Input
              label="Phone Number *"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
            <Input
              label="Email"
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="Enter email (optional)"
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Vehicle Information</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vehicle Number *"
              name="licensePlate"
              value={form.licensePlate}
              onChange={handleChange}
              placeholder="e.g. MH-12-AB-1234"
              required
            />
            <Select
              label="Vehicle Type *"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              options={VEHICLE_TYPES}
              placeholder="Select type"
              required
            />
            <Input
              label="Brand *"
              name="make"
              value={form.make}
              onChange={handleChange}
              placeholder="e.g. Maruti Suzuki"
              required
            />
            <Input
              label="Model *"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Swift Dzire"
              required
            />
            <Input
              label="Year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              placeholder="e.g. 2022"
              min="1900"
              max="2099"
            />
            <Input
              label="Color"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g. White"
            />
            <Select
              label="Fuel Type"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              options={FUEL_TYPES}
            />
            <Input
              label="Odometer (km)"
              name="odometer"
              type="number"
              value={form.odometer}
              onChange={handleChange}
              placeholder="e.g. 25000"
              min="0"
            />
          </div>
        </Card>

        {/* Service Details */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Service Details</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Service Type"
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              options={SERVICE_TYPES}
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
              label="Estimated Delivery Date"
              name="estimatedDeliveryDate"
              type="date"
              value={form.estimatedDeliveryDate}
              onChange={handleChange}
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
            <Textarea
              label="Complaint Description"
              name="complaintDescription"
              value={form.complaintDescription}
              onChange={handleChange}
              placeholder="Describe the issue or work required..."
              rows={3}
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Save}>
            Register Vehicle
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleRegisterPage;
