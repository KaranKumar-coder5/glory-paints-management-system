const asyncHandler = require("../utils/asyncHandler");
const invoiceService = require("../services/invoice.service");

const generateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.generateFromJobCard(
    req.body.jobCard,
    req.user._id
  );
  res.status(201).json({ success: true, invoice });
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  res.json({ success: true, invoice });
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(
    req.params.id,
    req.body,
    req.user._id
  );
  res.json({ success: true, invoice });
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await invoiceService.deleteInvoice(req.params.id);
  res.json({ success: true, message: "Invoice deleted successfully" });
});

const markPaid = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.markPaid(
    req.params.id,
    req.body.paymentMethod,
    req.user._id
  );
  res.json({ success: true, invoice });
});

const partialPayment = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.partialPayment(
    req.params.id,
    req.body.amount,
    req.body.paymentMethod,
    req.user._id
  );
  res.json({ success: true, invoice });
});

const cancelInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.cancelInvoice(req.params.id, req.user._id);
  res.json({ success: true, invoice });
});

const getInvoices = asyncHandler(async (req, res) => {
  const { page, limit, search, paymentStatus, paymentMethod, sort } = req.query;
  const result = await invoiceService.getInvoices({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search: search || "",
    paymentStatus: paymentStatus || "",
    paymentMethod: paymentMethod || "",
    sort: sort || "-createdAt",
  });
  res.json({ success: true, ...result });
});

const getRevenueSummary = asyncHandler(async (req, res) => {
  const summary = await invoiceService.getRevenueSummary();
  res.json({ success: true, summary });
});

module.exports = {
  generateInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  markPaid,
  partialPayment,
  cancelInvoice,
  getInvoices,
  getRevenueSummary,
};
