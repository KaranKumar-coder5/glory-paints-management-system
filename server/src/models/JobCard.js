const mongoose = require("mongoose");

const repairNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true, trim: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const partsUsedSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true },
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const jobCardSchema = new mongoose.Schema(
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
      unique: true,
      index: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },
    repairNotes: [repairNoteSchema],
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    labourCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    partsUsed: [partsUsedSchema],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "inspection",
        "repair_in_progress",
        "waiting_for_parts",
        "painting",
        "quality_check",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    startDate: {
      type: Date,
    },
    expectedCompletionDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statusHistory: [statusHistorySchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

jobCardSchema.index({ createdAt: -1 });
jobCardSchema.index({ vehicle: 1, status: 1 });
jobCardSchema.index({ assignedEmployee: 1, status: 1 });

jobCardSchema.pre("save", function (next) {
  const partsTotal = this.partsUsed.reduce((sum, p) => sum + (p.total || 0), 0);
  this.totalCost = partsTotal + (this.labourCost || 0);
  next();
});

module.exports = mongoose.model("JobCard", jobCardSchema);
