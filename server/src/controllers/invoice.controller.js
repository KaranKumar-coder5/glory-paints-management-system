const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const invoiceService = require("../services/invoice.service");

const generateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.generateFromJobCard(
    req.body.jobCard,
    req.user._id
  );
  ApiResponse.created(res, invoice, "Invoice generated successfully");
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  ApiResponse.success(res, invoice, "Invoice retrieved successfully");
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(
    req.params.id,
    req.body,
    req.user._id
  );
  ApiResponse.success(res, invoice, "Invoice updated successfully");
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await invoiceService.deleteInvoice(req.params.id);
  ApiResponse.success(res, null, "Invoice deleted successfully");
});

const markPaid = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.markPaid(
    req.params.id,
    req.body.paymentMethod,
    req.user._id
  );
  ApiResponse.success(res, invoice, "Invoice marked as paid");
});

const partialPayment = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.partialPayment(
    req.params.id,
    req.body.amount,
    req.body.paymentMethod,
    req.user._id
  );
  ApiResponse.success(res, invoice, "Partial payment recorded");
});

const cancelInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.cancelInvoice(req.params.id, req.user._id);
  ApiResponse.success(res, invoice, "Invoice cancelled successfully");
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
  ApiResponse.success(res, result, "Invoices retrieved successfully");
});

const getRevenueSummary = asyncHandler(async (req, res) => {
  const summary = await invoiceService.getRevenueSummary();
  ApiResponse.success(res, summary, "Revenue summary retrieved successfully");
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
