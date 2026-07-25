const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboard.service");

const getSummary = asyncHandler(async (req, res) => {
  if (req.user.role === "employee") {
    const data = await dashboardService.getEmployeeDashboard(req.user._id);
    return ApiResponse.success(res, data, "Employee dashboard loaded");
  }
  const data = await dashboardService.getOwnerSummary();
  ApiResponse.success(res, data, "Dashboard loaded");
});

const getStatusDistribution = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStatusDistribution();
  ApiResponse.success(res, data, "Status distribution loaded");
});

const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyRevenue();
  ApiResponse.success(res, data, "Monthly revenue loaded");
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentActivity();
  ApiResponse.success(res, data, "Recent activity loaded");
});

const getMyJobs = asyncHandler(async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.user._id);
  ApiResponse.success(res, data, "My jobs loaded");
});

module.exports = {
  getSummary,
  getStatusDistribution,
  getMonthlyRevenue,
  getRecentActivity,
  getMyJobs,
};
