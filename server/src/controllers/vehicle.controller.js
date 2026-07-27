const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const vehicleService = require("../services/vehicle.service");

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body, req.user._id);
  ApiResponse.created(res, vehicle, "Vehicle registered successfully");
});

const getVehicles = asyncHandler(async (req, res) => {
  const result = await vehicleService.getVehicles(req.query);
  ApiResponse.paginated(res, result.items, result.pagination);
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  ApiResponse.success(res, vehicle);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  ApiResponse.success(res, vehicle, "Vehicle updated successfully");
});

const advanceStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  if (!status) {
    throw new ApiError(400, "Status is required");
  }
  const vehicle = await vehicleService.advanceStatus(
    req.params.id,
    status,
    req.user._id,
    notes
  );
  ApiResponse.success(res, vehicle, "Status updated successfully");
});

const addImage = asyncHandler(async (req, res) => {
  const { url, caption } = req.body;
  if (!url) {
    throw new ApiError(400, "Image URL is required");
  }
  const vehicle = await vehicleService.addImage(
    req.params.id,
    { url, caption },
    req.user._id
  );
  ApiResponse.success(res, vehicle, "Image added successfully");
});

const removeImage = asyncHandler(async (req, res) => {
  const { imageIndex } = req.params;
  const vehicle = await vehicleService.removeImage(
    req.params.id,
    parseInt(imageIndex, 10)
  );
  ApiResponse.success(res, vehicle, "Image removed successfully");
});

const softDeleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.softDeleteVehicle(req.params.id);
  ApiResponse.success(res, null, "Vehicle deleted successfully");
});

const getVehicleStats = asyncHandler(async (req, res) => {
  const stats = await vehicleService.getVehicleStats();
  ApiResponse.success(res, stats);
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  advanceStatus,
  addImage,
  removeImage,
  softDeleteVehicle,
  getVehicleStats,
};
