const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { validateIdParam } = require("../utils/validators");
const invoiceController = require("../controllers/invoice.controller");

router.use(auth);

router.get("/", invoiceController.getInvoices);
router.get("/revenue-summary", role("owner"), invoiceController.getRevenueSummary);
router.post("/", role("owner"), invoiceController.generateInvoice);

router.get("/:id", validateIdParam, invoiceController.getInvoice);
router.put("/:id", role("owner"), validateIdParam, invoiceController.updateInvoice);
router.delete("/:id", role("owner"), validateIdParam, invoiceController.deleteInvoice);
router.patch("/:id/mark-paid", role("owner"), validateIdParam, invoiceController.markPaid);
router.patch("/:id/partial-payment", role("owner"), validateIdParam, invoiceController.partialPayment);
router.patch("/:id/cancel", role("owner"), validateIdParam, invoiceController.cancelInvoice);

module.exports = router;
