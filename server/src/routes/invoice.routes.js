const router = require("express").Router();
const auth = require("../middlewares/auth");
const { ownerOnly } = require("../middlewares/role");
const { validateIdParam } = require("../utils/validators");
const invoiceController = require("../controllers/invoice.controller");

router.use(auth);

router.get("/", invoiceController.getInvoices);
router.get("/revenue-summary", ownerOnly, invoiceController.getRevenueSummary);
router.post("/", ownerOnly, invoiceController.generateInvoice);

router.get("/:id", validateIdParam, invoiceController.getInvoice);
router.put("/:id", ownerOnly, validateIdParam, invoiceController.updateInvoice);
router.delete("/:id", ownerOnly, validateIdParam, invoiceController.deleteInvoice);
router.patch("/:id/mark-paid", ownerOnly, validateIdParam, invoiceController.markPaid);
router.patch("/:id/partial-payment", ownerOnly, validateIdParam, invoiceController.partialPayment);
router.patch("/:id/cancel", ownerOnly, validateIdParam, invoiceController.cancelInvoice);

module.exports = router;
