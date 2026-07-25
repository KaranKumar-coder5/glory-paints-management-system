const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  getSummary,
  getStatusDistribution,
  getMonthlyRevenue,
  getRecentActivity,
  getMyJobs,
} = require("../controllers/dashboard.controller");

router.get("/summary", auth, getSummary);
router.get("/status-distribution", auth, getStatusDistribution);
router.get("/monthly-revenue", auth, getMonthlyRevenue);
router.get("/activity", auth, getRecentActivity);
router.get("/my-jobs", auth, getMyJobs);

module.exports = router;
