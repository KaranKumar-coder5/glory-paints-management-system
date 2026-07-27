const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true,
      unique: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    partsCost: { type: Number, required: true, min: 0 },
    labourCost: { type: Number, required: true, min: 0 },
    additionalCharges: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 18, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "cheque", "none"],
      default: "none",
    },
    amountPaid: { type: Number, default: 0, min: 0 },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

invoiceSchema.pre("save", function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const now = new Date();
    const num = String(Math.floor(Math.random() * 900000) + 100000);
    this.invoiceNumber = `INV-${now.getFullYear()}-${num}`;
  }
  this.subtotal =
    (this.partsCost || 0) +
    (this.labourCost || 0) +
    (this.additionalCharges || 0) -
    (this.discount || 0);
  if (this.subtotal < 0) this.subtotal = 0;
  this.taxAmount = this.subtotal * ((this.taxRate || 18) / 100);
  this.grandTotal = this.subtotal + this.taxAmount;
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
