const mongoose = require("mongoose");

const fcCertificateSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    fcNumber: {
      type: String,
      default: "",
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    result: {
      type: String,
      enum: ["passed", "failed", "pending"],
      default: "pending",
    },
    inspectedBy: {
      type: String,
      default: "",
    },
    inspectionCenter: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    documentUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

fcCertificateSchema.index({ createdAt: -1 });

module.exports = mongoose.model("FCCertificate", fcCertificateSchema);
