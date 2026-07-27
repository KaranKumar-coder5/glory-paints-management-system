const Invoice = require("../models/Invoice");
const JobCard = require("../models/JobCard");
const ApiError = require("../utils/ApiError");

const generateInvoiceNumber = require("../utils/jobNumberGenerator").generateInvoiceNumber;

const generateFromJobCard = async (jobCardId, userId) => {
  const jobCard = await JobCard.findOne({
    _id: jobCardId,
    isDeleted: false,
  }).populate("vehicle");
  if (!jobCard) throw new ApiError(404, "Job card not found");
  if (jobCard.status !== "completed")
    throw new ApiError(400, "Can only generate invoice for completed job cards");

  const existingInvoice = await Invoice.findOne({
    jobCard: jobCard._id,
    isDeleted: false,
  });
  if (existingInvoice)
    throw new ApiError(400, "Invoice already exists for this job card");

  const partsCost = jobCard.partsUsed.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );
  const labourCost = jobCard.labourCost || 0;
  const subtotal = partsCost + labourCost;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const lastInvoice = await Invoice.findOne(
    { isDeleted: false },
    { invoiceNumber: 1 },
    { sort: { createdAt: -1 } }
  );
  const lastNum = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split("-").pop(), 10)
    : 0;

  const invoice = new Invoice({
    invoiceNumber: generateInvoiceNumber(lastNum),
    jobCard: jobCard._id,
    vehicle: jobCard.vehicle._id,
    customerName: jobCard.vehicle.customer.name,
    customerPhone: jobCard.vehicle.customer.phone,
    partsCost,
    labourCost,
    subtotal,
    grandTotal: subtotal * 1.18,
    dueDate,
    createdBy: userId,
  });

  await invoice.save();
  return invoice;
};

const getInvoiceById = async (id) => {
  const invoice = await Invoice.findOne({ _id: id, isDeleted: false })
    .populate("jobCard", "jobId diagnosis status labourCost totalCost partsUsed")
    .populate("vehicle", "jobId make model year color licensePlate customer")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!invoice) throw new ApiError(404, "Invoice not found");
  return invoice;
};

const updateInvoice = async (id, data, userId) => {
  const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (invoice.paymentStatus === "cancelled")
    throw new ApiError(400, "Cannot update cancelled invoice");

  const allowedFields = [
    "additionalCharges",
    "discount",
    "taxRate",
    "paymentStatus",
    "paymentMethod",
    "amountPaid",
    "notes",
    "dueDate",
  ];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) invoice[field] = data[field];
  });

  if (data.paymentStatus === "paid") {
    invoice.amountPaid = invoice.grandTotal;
  }

  invoice.updatedBy = userId;
  await invoice.save();
  return invoice;
};

const deleteInvoice = async (id) => {
  const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  invoice.isDeleted = true;
  invoice.updatedBy = invoice.createdBy;
  await invoice.save();
  return invoice;
};

const markPaid = async (id, paymentMethod, userId) => {
  const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (invoice.paymentStatus === "cancelled")
    throw new ApiError(400, "Cannot update cancelled invoice");

  invoice.paymentStatus = "paid";
  invoice.paymentMethod = paymentMethod;
  invoice.amountPaid = invoice.grandTotal;
  invoice.updatedBy = userId;
  await invoice.save();
  return invoice;
};

const partialPayment = async (id, amount, paymentMethod, userId) => {
  const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (invoice.paymentStatus === "cancelled")
    throw new ApiError(400, "Cannot update cancelled invoice");
  if (amount <= 0)
    throw new ApiError(400, "Payment amount must be greater than 0");

  invoice.amountPaid = (invoice.amountPaid || 0) + amount;
  invoice.paymentMethod = paymentMethod || invoice.paymentMethod;

  if (invoice.amountPaid >= invoice.grandTotal) {
    invoice.paymentStatus = "paid";
    invoice.amountPaid = invoice.grandTotal;
  } else {
    invoice.paymentStatus = "partially_paid";
  }

  invoice.updatedBy = userId;
  await invoice.save();
  return invoice;
};

const cancelInvoice = async (id, userId) => {
  const invoice = await Invoice.findOne({ _id: id, isDeleted: false });
  if (!invoice) throw new ApiError(404, "Invoice not found");

  invoice.paymentStatus = "cancelled";
  invoice.updatedBy = userId;
  await invoice.save();
  return invoice;
};

const getInvoices = async ({
  page = 1,
  limit = 10,
  search = "",
  paymentStatus = "",
  paymentMethod = "",
  sort = "-createdAt",
}) => {
  const filter = { isDeleted: false };

  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { customerPhone: { $regex: search, $options: "i" } },
    ];
  }

  const totalDocs = await Invoice.countDocuments(filter);
  const invoices = await Invoice.find(filter)
    .populate("jobCard", "jobId status")
    .populate("vehicle", "jobId make model licensePlate")
    .populate("createdBy", "name")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    invoices,
    pagination: {
      total: totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
    },
  };
};

const getRevenueSummary = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dailyRevenue, monthlyRevenue, pendingCount, pendingTotal, paidCount] =
    await Promise.all([
      Invoice.aggregate([
        { $match: { isDeleted: false, paymentStatus: "paid", invoiceDate: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Invoice.aggregate([
        { $match: { isDeleted: false, paymentStatus: "paid", invoiceDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Invoice.countDocuments({ isDeleted: false, paymentStatus: "pending" }),
      Invoice.aggregate([
        { $match: { isDeleted: false, paymentStatus: "pending" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Invoice.countDocuments({ isDeleted: false, paymentStatus: "paid" }),
    ]);

  return {
    todayRevenue: dailyRevenue[0]?.total || 0,
    monthRevenue: monthlyRevenue[0]?.total || 0,
    pendingCount,
    outstandingAmount: pendingTotal[0]?.total || 0,
    paidCount,
  };
};

module.exports = {
  generateFromJobCard,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  markPaid,
  partialPayment,
  cancelInvoice,
  getInvoices,
  getRevenueSummary,
};
