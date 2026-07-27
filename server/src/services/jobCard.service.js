const JobCard = require("../models/JobCard");
const Vehicle = require("../models/Vehicle");
const ApiError = require("../utils/ApiError");
const { generateJobId } = require("../utils/jobNumberGenerator");

const JOB_CARD_STATUS_ORDER = [
  "pending",
  "inspection",
  "repair_in_progress",
  "waiting_for_parts",
  "painting",
  "quality_check",
  "completed",
  "cancelled",
];

const getNextJobCardId = async () => {
  const year = new Date().getFullYear();
  const prefix = `JC-${year}-`;
  const last = await JobCard.findOne({ jobId: { $regex: `^${prefix}` } })
    .sort({ jobId: -1 })
    .lean();
  if (!last) {
    return `${prefix}000001`;
  }
  const lastNum = parseInt(last.jobId.split("-")[2], 10);
  return generateJobId(lastNum);
};

const createJobCard = async (data, userId) => {
  const vehicle = await Vehicle.findOne({ _id: data.vehicle, isDeleted: false });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const existing = await JobCard.findOne({
    vehicle: data.vehicle,
    isDeleted: false,
    status: { $nin: ["completed", "cancelled"] },
  });
  if (existing) {
    throw new ApiError(
      400,
      "An active job card already exists for this vehicle"
    );
  }

  const jobId = await getNextJobCardId();
  const jobCard = await JobCard.create({
    ...data,
    jobId,
    createdBy: userId,
    startDate: data.startDate || new Date(),
    statusHistory: [
      {
        status: "pending",
        changedAt: new Date(),
        changedBy: userId,
        notes: "Job card created",
      },
    ],
  });

  return jobCard.populate([
    { path: "vehicle", select: "jobId make model licensePlate customer" },
    { path: "assignedEmployee", select: "name email" },
    { path: "createdBy", select: "name" },
  ]);
};

const getJobCards = async (filters, userId, userRole) => {
  const {
    search,
    status,
    priority,
    assignedEmployee,
    vehicleId,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = filters;

  const query = { isDeleted: false };

  if (userRole === "employee") {
    query.assignedEmployee = userId;
  }

  if (search) {
    const regex = { $regex: search, $options: "i" };
    query.$or = [
      { jobId: regex },
      { diagnosis: regex },
      { "vehicle.licensePlate": regex },
    ];
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedEmployee) query.assignedEmployee = assignedEmployee;
  if (vehicleId) query.vehicle = vehicleId;

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
    JobCard.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("vehicle", "jobId make model licensePlate customer currentStatus")
      .populate("assignedEmployee", "name email")
      .populate("createdBy", "name")
      .lean(),
    JobCard.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getJobCardById = async (id) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false })
    .populate("vehicle", "jobId make model licensePlate year color fuelType odometer customer currentStatus assignedEmployee statusHistory")
    .populate("assignedEmployee", "name email phone")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name")
    .populate("repairNotes.addedBy", "name")
    .populate("statusHistory.changedBy", "name")
    .populate("partsUsed.inventoryItem", "name sku")
    .lean();

  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }
  return jobCard;
};

const updateJobCard = async (id, data, userId) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  if (jobCard.status === "completed" || jobCard.status === "cancelled") {
    throw new ApiError(400, "Cannot edit a completed or cancelled job card");
  }

  const allowedFields = [
    "diagnosis",
    "estimatedCost",
    "labourCost",
    "priority",
    "expectedCompletionDate",
    "completedDate",
    "startDate",
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  if (data.assignedEmployee !== undefined) {
    updates.assignedEmployee = data.assignedEmployee || null;
  }

  updates.updatedBy = userId;

  const updated = await JobCard.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate([
    { path: "vehicle", select: "jobId make model licensePlate customer" },
    { path: "assignedEmployee", select: "name email" },
    { path: "createdBy", select: "name" },
  ]);

  return updated;
};

const changeStatus = async (id, newStatus, userId, notes = "") => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  if (!JOB_CARD_STATUS_ORDER.includes(newStatus)) {
    throw new ApiError(400, "Invalid status");
  }

  if (jobCard.status === "completed" || jobCard.status === "cancelled") {
    throw new ApiError(400, "Cannot change status of a completed or cancelled job card");
  }

  const fromStatus = jobCard.status;
  jobCard.status = newStatus;
  jobCard.updatedBy = userId;

  jobCard.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId,
    notes,
  });

  if (newStatus === "completed") {
    jobCard.completedDate = new Date();
  }

  if (newStatus === "pending" && !jobCard.startDate) {
    jobCard.startDate = new Date();
  }

  await jobCard.save();

  return jobCard.populate([
    { path: "vehicle", select: "jobId make model licensePlate customer" },
    { path: "assignedEmployee", select: "name email" },
    { path: "createdBy", select: "name" },
  ]);
};

const assignEmployee = async (id, employeeId, userId) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  jobCard.assignedEmployee = employeeId || null;
  jobCard.updatedBy = userId;
  await jobCard.save();

  return jobCard.populate([
    { path: "vehicle", select: "jobId make model licensePlate customer" },
    { path: "assignedEmployee", select: "name email" },
    { path: "createdBy", select: "name" },
  ]);
};

const addRepairNote = async (id, note, userId) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  jobCard.repairNotes.push({ note, addedBy: userId });
  jobCard.updatedBy = userId;
  await jobCard.save();

  return jobCard.populate("repairNotes.addedBy", "name");
};

const removeRepairNote = async (id, noteIndex) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  if (noteIndex < 0 || noteIndex >= jobCard.repairNotes.length) {
    throw new ApiError(400, "Invalid note index");
  }

  jobCard.repairNotes.splice(noteIndex, 1);
  await jobCard.save();

  return jobCard;
};

const addPart = async (id, partData, userId) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  const total = partData.quantity * partData.unitPrice;
  jobCard.partsUsed.push({ ...partData, total });
  jobCard.updatedBy = userId;
  await jobCard.save();

  return jobCard;
};

const removePart = async (id, partIndex) => {
  const jobCard = await JobCard.findOne({ _id: id, isDeleted: false });
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }

  if (partIndex < 0 || partIndex >= jobCard.partsUsed.length) {
    throw new ApiError(400, "Invalid part index");
  }

  jobCard.partsUsed.splice(partIndex, 1);
  await jobCard.save();

  return jobCard;
};

const deleteJobCard = async (id) => {
  const jobCard = await JobCard.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!jobCard) {
    throw new ApiError(404, "Job card not found");
  }
  return jobCard;
};

const getJobCardStats = async () => {
  const byStatus = await JobCard.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const byPriority = await JobCard.aggregate([
    { $match: { isDeleted: false, status: { $nin: ["completed", "cancelled"] } } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  const totalActive = await JobCard.countDocuments({
    isDeleted: false,
    status: { $nin: ["completed", "cancelled"] },
  });

  const totalCompleted = await JobCard.countDocuments({
    isDeleted: false,
    status: "completed",
  });

  const total = await JobCard.countDocuments({ isDeleted: false });

  return { total, totalActive, totalCompleted, byStatus, byPriority };
};

module.exports = {
  createJobCard,
  getJobCards,
  getJobCardById,
  updateJobCard,
  changeStatus,
  assignEmployee,
  addRepairNote,
  removeRepairNote,
  addPart,
  removePart,
  deleteJobCard,
  getJobCardStats,
};
