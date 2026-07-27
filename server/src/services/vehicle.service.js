const Vehicle = require("../models/Vehicle");
const StatusLog = require("../models/StatusLog");
const ApiError = require("../utils/ApiError");
const { generateJobId } = require("../utils/jobNumberGenerator");

const getNextJobId = async () => {
  const year = new Date().getFullYear();
  const prefix = `GP-${year}-`;
  const lastVehicle = await Vehicle.findOne({ jobId: { $regex: `^${prefix}` } })
    .sort({ jobId: -1 })
    .lean();
  if (!lastVehicle) {
    return `${prefix}000001`;
  }
  const lastNum = parseInt(lastVehicle.jobId.split("-")[2], 10);
  return generateJobId(lastNum);
};

const createVehicle = async (data, userId) => {
  const jobId = await getNextJobId();
  const vehicle = await Vehicle.create({
    ...data,
    jobId,
    createdBy: userId,
    statusHistory: [
      {
        status: "received",
        changedAt: new Date(),
        changedBy: userId,
        notes: "Vehicle registered",
      },
    ],
  });

  await StatusLog.create({
    vehicle: vehicle._id,
    jobId,
    toStatus: "received",
    changedBy: userId,
    notes: "Vehicle registered",
  });

  return vehicle;
};

const getVehicles = async (filters) => {
  const {
    search,
    status,
    assignedTo,
    vehicleType,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = filters;

  const query = { isDeleted: false };

  if (search) {
    const regex = { $regex: search, $options: "i" };
    query.$or = [
      { jobId: regex },
      { licensePlate: regex },
      { "customer.name": regex },
      { "customer.phone": regex },
      { make: regex },
      { model: regex },
    ];
  }

  if (status) query.currentStatus = status;
  if (assignedTo) query.assignedEmployee = assignedTo;
  if (vehicleType) query.vehicleType = vehicleType;

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Vehicle.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("assignedEmployee", "name email")
      .populate("createdBy", "name")
      .lean(),
    Vehicle.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false })
    .populate("assignedEmployee", "name email phone")
    .populate("createdBy", "name email")
    .populate("statusHistory.changedBy", "name")
    .populate("images.uploadedBy", "name")
    .lean();

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  return vehicle;
};

const updateVehicle = async (id, data) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  return vehicle;
};

const advanceStatus = async (id, newStatus, userId, notes = "") => {
  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const statusOrder = [
    "received", "inspection", "repair", "painting",
    "quality_check", "fc_inspection", "ready_for_delivery", "delivered",
  ];
  const currentIdx = statusOrder.indexOf(vehicle.currentStatus);
  const newIdx = statusOrder.indexOf(newStatus);

  if (newIdx === -1) {
    throw new ApiError(400, "Invalid status");
  }
  if (newIdx <= currentIdx) {
    throw new ApiError(400, "Status can only move forward");
  }

  const fromStatus = vehicle.currentStatus;
  vehicle.currentStatus = newStatus;
  vehicle.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId,
    notes,
  });

  if (newStatus === "delivered") {
    vehicle.actualDeliveryDate = new Date();
  }

  await vehicle.save();

  await StatusLog.create({
    vehicle: vehicle._id,
    jobId: vehicle.jobId,
    fromStatus,
    toStatus: newStatus,
    changedBy: userId,
    notes,
  });

  return vehicle;
};

const addImage = async (id, imageData, userId) => {
  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  vehicle.images.push({
    ...imageData,
    uploadedBy: userId,
    uploadedAt: new Date(),
  });
  await vehicle.save();
  return vehicle;
};

const removeImage = async (id, imageIndex) => {
  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: false });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  if (imageIndex < 0 || imageIndex >= vehicle.images.length) {
    throw new ApiError(400, "Invalid image index");
  }
  vehicle.images.splice(imageIndex, 1);
  await vehicle.save();
  return vehicle;
};

const softDeleteVehicle = async (id) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  return vehicle;
};

const getVehicleStats = async () => {
  const stats = await Vehicle.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
  ]);
  const total = await Vehicle.countDocuments({ isDeleted: false });
  return { total, byStatus: stats };
};

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
