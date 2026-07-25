const router = require("express").Router();
const authRoutes = require("./auth.routes");
const healthRoutes = require("./health.routes");
const vehicleRoutes = require("./vehicle.routes");
const jobCardRoutes = require("./jobCard.routes");
const invoiceRoutes = require("./invoice.routes");
const inventoryRoutes = require("./inventory.routes");
const fcRoutes = require("./fc.routes");
const employeeRoutes = require("./employee.routes");
const customerRoutes = require("./customer.routes");
const dashboardRoutes = require("./dashboard.routes");

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/jobs", jobCardRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/fc", fcRoutes);
router.use("/employees", employeeRoutes);
router.use("/customers", customerRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
