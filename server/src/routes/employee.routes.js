const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

router.get("/", asyncHandler(async (req, res) => {
  const employees = await User.find({ role: "employee" })
    .select("-password")
    .sort({ name: 1 })
    .lean();
  ApiResponse.success(res, employees, "Employees retrieved successfully");
}));

module.exports = router;
