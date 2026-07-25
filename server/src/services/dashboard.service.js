const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
const FCCertificate = require("../models/FCCertificate");
const StatusLog = require("../models/StatusLog");

const getOwnerSummary = async () => {
  const [
    totalVehicles,
    statusCounts,
    totalEmployees,
    lowStockItems,
    recentVehicles,
    pendingFCs,
  ] = await Promise.all([
    Vehicle.countDocuments({ isDeleted: false }),

    Vehicle.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]),

    User.countDocuments({ role: "employee", isActive: true }),

    Inventory.find({ $expr: { $lte: ["$quantity", "$minStockLevel"] } })
      .select("name category quantity unit minStockLevel")
      .lean(),

    Vehicle.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("jobId vehicleType make model licensePlate currentStatus customer.name createdAt")
      .populate("assignedEmployee", "name")
      .lean(),

    FCCertificate.find({
      result: "pending",
      status: { $ne: "completed" },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("vehicle", "jobId make model licensePlate")
      .lean(),
  ]);

  const statusMap = {};
  statusCounts.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  return {
    totalVehicles,
    received: statusMap.received || 0,
    inspection: statusMap.inspection || 0,
    repair: statusMap.repair || 0,
    painting: statusMap.painting || 0,
    qualityCheck: statusMap.quality_check || 0,
    fcInspection: statusMap.fc_inspection || 0,
    readyForDelivery: statusMap.ready_for_delivery || 0,
    delivered: statusMap.delivered || 0,
    totalEmployees,
    lowStockItems,
    recentVehicles,
    pendingFCs,
  };
};

const getStatusDistribution = async () => {
  const distribution = await Vehicle.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$currentStatus",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const statusLabels = {
    received: "Received",
    inspection: "Inspection",
    repair: "Repair",
    painting: "Painting",
    quality_check: "Quality Check",
    fc_inspection: "FC Inspection",
    ready_for_delivery: "Ready for Delivery",
    delivered: "Delivered",
  };

  const statusColors = {
    received: "#3b82f6",
    inspection: "#eab308",
    repair: "#f97316",
    painting: "#a855f7",
    quality_check: "#06b6d4",
    fc_inspection: "#14b8a6",
    ready_for_delivery: "#22c55e",
    delivered: "#6b7280",
  };

  return distribution.map((d) => ({
    name: statusLabels[d._id] || d._id,
    value: d.count,
    color: statusColors[d._id] || "#6b7280",
  }));
};

const getMonthlyRevenue = async () => {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const result = await Vehicle.aggregate([
      {
        $match: {
          isDeleted: false,
          actualDeliveryDate: { $gte: startOfMonth, $lte: endOfMonth },
          actualCost: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$actualCost" },
        },
      },
    ]);

    months.push({
      month: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      revenue: result.length > 0 ? result[0].total : 0,
    });
  }

  return months;
};

const getRecentActivity = async (limit = 15) => {
  const logs = await StatusLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("changedBy", "name")
    .populate("vehicle", "jobId make model licensePlate")
    .lean();

  return logs.map((log) => ({
    id: log._id,
    jobId: log.jobId,
    vehicle: log.vehicle
      ? `${log.vehicle.make} ${log.vehicle.model}`
      : "Unknown",
    licensePlate: log.vehicle?.licensePlate || "",
    fromStatus: log.fromStatus,
    toStatus: log.toStatus,
    changedBy: log.changedBy?.name || "System",
    notes: log.notes,
    createdAt: log.createdAt,
  }));
};

const getEmployeeDashboard = async (employeeId) => {
  const [assignedVehicles, recentUpdates] = await Promise.all([
    Vehicle.find({
      assignedEmployee: employeeId,
      isDeleted: false,
      currentStatus: { $nin: ["delivered"] },
    })
      .sort({ createdAt: -1 })
      .select("jobId vehicleType make model licensePlate currentStatus customer.name estimatedDeliveryDate serviceType")
      .lean(),

    StatusLog.find({ changedBy: employeeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("vehicle", "jobId make model licensePlate")
      .lean(),
  ]);

  return {
    assignedVehicles,
    recentUpdates: recentUpdates.map((log) => ({
      id: log._id,
      jobId: log.jobId,
      vehicle: log.vehicle
        ? `${log.vehicle.make} ${log.vehicle.model}`
        : "Unknown",
      toStatus: log.toStatus,
      createdAt: log.createdAt,
    })),
    totalAssigned: assignedVehicles.length,
  };
};

module.exports = {
  getOwnerSummary,
  getStatusDistribution,
  getMonthlyRevenue,
  getRecentActivity,
  getEmployeeDashboard,
};
