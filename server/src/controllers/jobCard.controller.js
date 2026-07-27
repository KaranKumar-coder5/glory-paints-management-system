const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jobCardService = require("../services/jobCard.service");

const createJobCard = asyncHandler(async (req, res) => {
  const jobCard = await jobCardService.createJobCard(req.body, req.user._id);
  ApiResponse.created(res, jobCard, "Job card created successfully");
});

const getJobCards = asyncHandler(async (req, res) => {
  const result = await jobCardService.getJobCards(
    req.query,
    req.user._id,
    req.user.role
  );
  ApiResponse.paginated(res, result.items, result.pagination);
});

const getJobCardById = asyncHandler(async (req, res) => {
  const jobCard = await jobCardService.getJobCardById(req.params.id);
  ApiResponse.success(res, jobCard);
});

const updateJobCard = asyncHandler(async (req, res) => {
  const jobCard = await jobCardService.updateJobCard(
    req.params.id,
    req.body,
    req.user._id
  );
  ApiResponse.success(res, jobCard, "Job card updated successfully");
});

const changeStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  if (!status) {
    throw new ApiError(400, "Status is required");
  }
  const jobCard = await jobCardService.changeStatus(
    req.params.id,
    status,
    req.user._id,
    notes
  );
  ApiResponse.success(res, jobCard, "Status updated successfully");
});

const assignEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  const jobCard = await jobCardService.assignEmployee(
    req.params.id,
    employeeId,
    req.user._id
  );
  ApiResponse.success(res, jobCard, "Employee assigned successfully");
});

const addRepairNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  if (!note || !note.trim()) {
    throw new ApiError(400, "Note is required");
  }
  const jobCard = await jobCardService.addRepairNote(
    req.params.id,
    note,
    req.user._id
  );
  ApiResponse.success(res, jobCard, "Note added successfully");
});

const removeRepairNote = asyncHandler(async (req, res) => {
  const { noteIndex } = req.params;
  const jobCard = await jobCardService.removeRepairNote(
    req.params.id,
    parseInt(noteIndex, 10)
  );
  ApiResponse.success(res, jobCard, "Note removed successfully");
});

const addPart = asyncHandler(async (req, res) => {
  const { name, quantity, unitPrice, inventoryItem } = req.body;
  if (!name || !quantity || !unitPrice) {
    throw new ApiError(400, "Name, quantity, and unit price are required");
  }
  const jobCard = await jobCardService.addPart(
    req.params.id,
    { name, quantity: Number(quantity), unitPrice: Number(unitPrice), inventoryItem },
    req.user._id
  );
  ApiResponse.success(res, jobCard, "Part added successfully");
});

const removePart = asyncHandler(async (req, res) => {
  const { partIndex } = req.params;
  const jobCard = await jobCardService.removePart(
    req.params.id,
    parseInt(partIndex, 10)
  );
  ApiResponse.success(res, jobCard, "Part removed successfully");
});

const deleteJobCard = asyncHandler(async (req, res) => {
  await jobCardService.deleteJobCard(req.params.id);
  ApiResponse.success(res, null, "Job card deleted successfully");
});

const getJobCardStats = asyncHandler(async (req, res) => {
  const stats = await jobCardService.getJobCardStats();
  ApiResponse.success(res, stats);
});

module.exports = {
  createJobCard,
  getJobCards,
  getJobCardById,
  updateJobCard,
  changeStatus,
  assignEmployee,
  addRepairNote,
  removeRepairNote,
  addPart,
  removePart,
  deleteJobCard,
  getJobCardStats,
};
