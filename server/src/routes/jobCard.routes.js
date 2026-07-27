const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
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
} = require("../controllers/jobCard.controller");
const { validateIdParam } = require("../utils/validators");

router.get("/stats", auth, getJobCardStats);
router.get("/", auth, getJobCards);
router.get("/:id", auth, validateIdParam, getJobCardById);
router.post("/", auth, createJobCard);
router.put("/:id", auth, validateIdParam, updateJobCard);
router.patch("/:id/status", auth, validateIdParam, changeStatus);
router.put("/:id/assign", auth, validateIdParam, assignEmployee);
router.post("/:id/notes", auth, validateIdParam, addRepairNote);
router.delete("/:id/notes/:noteIndex", auth, validateIdParam, removeRepairNote);
router.post("/:id/parts", auth, validateIdParam, addPart);
router.delete("/:id/parts/:partIndex", auth, validateIdParam, removePart);
router.delete("/:id", auth, role("owner"), validateIdParam, deleteJobCard);

module.exports = router;
