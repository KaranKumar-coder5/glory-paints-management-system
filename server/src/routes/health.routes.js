const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");

router.get("/", (req, res) => {
  ApiResponse.success(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, "Server is healthy");
});

module.exports = router;
