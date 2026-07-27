const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  advanceStatus,
  addImage,
  removeImage,
  softDeleteVehicle,
  getVehicleStats,
} = require("../controllers/vehicle.controller");
const { validateVehicle, validateIdParam } = require("../utils/validators");

router.get("/stats", auth, getVehicleStats);
router.get("/", auth, getVehicles);
router.get("/:id", auth, validateIdParam, getVehicleById);
router.post("/", auth, validateVehicle, createVehicle);
router.put("/:id", auth, role("owner"), validateIdParam, updateVehicle);
router.put("/:id/status", auth, validateIdParam, advanceStatus);
router.post("/:id/images", auth, validateIdParam, addImage);
router.delete("/:id/images/:imageIndex", auth, role("owner"), removeImage);
router.delete("/:id", auth, role("owner"), validateIdParam, softDeleteVehicle);

module.exports = router;
