const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");

router.get("/", (req, res) => {
  ApiResponse.success(res, [], "Inventory endpoint — coming soon");
});

module.exports = router;
