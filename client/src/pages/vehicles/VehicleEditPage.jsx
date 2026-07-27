import { useState, useEffect, useContext } from "react";
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
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  SERVICE_TYPES,
} from "../../utils/constants";

const VehicleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    licensePlate: "",
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    color: "",
    fuelType: "",
    odometer: "",
    serviceType: "",
    complaintDescription: "",
    estimatedDeliveryDate: "",
    estimatedCost: "",
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const response = await axiosInstance.get(API_ENDPOINTS.VEHICLES.BY_ID(id));
        const vehicle = response.data;

        setFormData({
          customerName: vehicle.customer?.name || "",
          customerPhone: vehicle.customer?.phone || "",
          customerEmail: vehicle.customer?.email || "",
          licensePlate: vehicle.licensePlate || "",
          vehicleType: vehicle.vehicleType || "",
          make: vehicle.make || "",
          model: vehicle.model || "",
          year: vehicle.year || "",
          color: vehicle.color || "",
          fuelType: vehicle.fuelType || "",
          odometer: vehicle.odometer || "",
          serviceType: vehicle.serviceType || "",
          complaintDescription: vehicle.complaintDescription || "",
          estimatedDeliveryDate: vehicle.estimatedDeliveryDate
            ? vehicle.estimatedDeliveryDate.split("T")[0]
            : "",
          estimatedCost: vehicle.estimatedCost || "",
        });
      } catch (error) {
        setFetchError(error.response?.data?.message || "Failed to load vehicle data.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        customer: {
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail,
        },
        licensePlate: formData.licensePlate,
        vehicleType: formData.vehicleType,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        fuelType: formData.fuelType,
        odometer: formData.odometer,
        serviceType: formData.serviceType,
        complaintDescription: formData.complaintDescription,
        estimatedDeliveryDate: formData.estimatedDeliveryDate,
        estimatedCost: formData.estimatedCost,
      };

      await axiosInstance.put(API_ENDPOINTS.VEHICLES.BY_ID(id), payload);

      addToast("Vehicle updated successfully!", "success");

      navigate(`/vehicles/${id}`);
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to update vehicle.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullPageSpinner />;
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Vehicle</h1>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-red-500 text-center">{fetchError}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Customer Info</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Customer name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customerPhone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customerEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="Email address"
              />
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Vehicle Info</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="licensePlate" className="text-sm font-medium">
                License Plate
              </label>
              <Input
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="License plate"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="vehicleType" className="text-sm font-medium">
                Vehicle Type
              </label>
              <Select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="make" className="text-sm font-medium">
                Make
              </label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="Make"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium">
                Model
              </label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium">
                Year
              </label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                placeholder="Year"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">
                Color
              </label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Color"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fuelType" className="text-sm font-medium">
                Fuel Type
              </label>
              <Select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
              >
                <option value="">Select fuel type</option>
                {FUEL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="odometer" className="text-sm font-medium">
                Odometer
              </label>
              <Input
                id="odometer"
                name="odometer"
                type="number"
                value={formData.odometer}
                onChange={handleChange}
                placeholder="Current odometer reading"
              />
            </div>
          </div>
        </Card>

        {/* Service Details */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Service Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="serviceType" className="text-sm font-medium">
                Service Type
              </label>
              <Select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Select service type</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="estimatedDeliveryDate" className="text-sm font-medium">
                Estimated Delivery Date
              </label>
              <Input
                id="estimatedDeliveryDate"
                name="estimatedDeliveryDate"
                type="date"
                value={formData.estimatedDeliveryDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="estimatedCost" className="text-sm font-medium">
                Estimated Cost
              </label>
              <Input
                id="estimatedCost"
                name="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="Estimated cost"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="complaintDescription" className="text-sm font-medium">
                Complaint Description
              </label>
              <Textarea
                id="complaintDescription"
                name="complaintDescription"
                value={formData.complaintDescription}
                onChange={handleChange}
                placeholder="Describe the issue..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4 mr-2" />
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleEditPage;
