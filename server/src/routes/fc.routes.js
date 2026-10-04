const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const FCCertificate = require("../models/FCCertificate");

router.get("/", asyncHandler(async (req, res) => {
  const certificates = await FCCertificate.find()
    .populate("vehicle", "jobId make model licensePlate customer")
    .sort({ expiryDate: 1 })
    .lean();
  ApiResponse.success(res, certificates, "FC certificates retrieved successfully");
}));

module.exports = router;
