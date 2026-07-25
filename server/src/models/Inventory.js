const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["paint", "primer", "thinner", "sandpaper", "tool", "spare_part", "consumable", "other"],
      required: [true, "Category is required"],
    },
    sku: {
      type: String,
      unique: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["liters", "kg", "pieces", "rolls", "boxes", "other"],
      default: "pieces",
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    supplier: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    lastRestockedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ name: 1 });
inventorySchema.index({ category: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
