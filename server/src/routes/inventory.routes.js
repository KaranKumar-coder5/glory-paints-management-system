const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const Inventory = require("../models/Inventory");

router.get("/", asyncHandler(async (req, res) => {
  const items = await Inventory.find().sort({ name: 1 }).lean();
  ApiResponse.success(res, items, "Inventory items retrieved successfully");
}));

module.exports = router;
