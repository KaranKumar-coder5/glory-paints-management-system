const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ["car", "truck", "bus", "two-wheeler", "commercial", "other"],
      required: [true, "Vehicle type is required"],
    },
    make: {
      type: String,
      required: [true, "Vehicle make is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },
    year: {
      type: Number,
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    licensePlate: {
      type: String,
      required: [true, "License plate is required"],
      trim: true,
      uppercase: true,
    },
    engineNumber: {
      type: String,
      trim: true,
      default: "",
    },
    chassisNumber: {
      type: String,
      trim: true,
      default: "",
    },
    customer: {
      name: { type: String, required: [true, "Customer name is required"], trim: true },
      phone: { type: String, required: [true, "Customer phone is required"], trim: true },
      email: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
    },
    currentStatus: {
      type: String,
      enum: [
        "received",
        "inspection",
        "repair",
        "painting",
        "quality_check",
        "fc_inspection",
        "ready_for_delivery",
        "delivered",
      ],
      default: "received",
      index: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["painting", "repair", "fc_inspection", "full_service", "other"],
      default: "repair",
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    images: [
      {
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    inspectionNotes: {
      type: String,
      default: "",
    },
    repairNotes: {
      type: String,
      default: "",
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: String,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ createdAt: -1 });
vehicleSchema.index({ "customer.phone": 1 });
vehicleSchema.index({ assignedEmployee: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
