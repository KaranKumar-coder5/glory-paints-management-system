const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const Vehicle = require("../models/Vehicle");

router.get("/", asyncHandler(async (req, res) => {
  const customers = await Vehicle.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$customer.phone",
        name: { $first: "$customer.name" },
        phone: { $first: "$customer.phone" },
        email: { $first: "$customer.email" },
        vehiclesCount: { $sum: 1 },
        vehicles: {
          $push: {
            _id: "$_id",
            jobId: "$jobId",
            make: "$make",
            model: "$model",
            licensePlate: "$licensePlate",
            currentStatus: "$currentStatus",
          },
        },
      },
    },
    { $sort: { name: 1 } },
  ]);

  ApiResponse.success(res, customers, "Customers retrieved successfully");
}));

module.exports = router;
