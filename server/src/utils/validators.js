const { body, param, query } = require("express-validator");

const handleValidation = (req, res, next) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const ApiError = require("./ApiError");
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, messages.join(", ")));
  }
  next();
};

const validateRegistration = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidation,
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

const validateVehicle = [
  body("vehicleType").trim().notEmpty().withMessage("Vehicle type is required"),
  body("make").trim().notEmpty().withMessage("Vehicle make is required"),
  body("model").trim().notEmpty().withMessage("Vehicle model is required"),
  body("licensePlate").trim().notEmpty().withMessage("License plate is required"),
  body("customer.name").trim().notEmpty().withMessage("Customer name is required"),
  body("customer.phone").trim().notEmpty().withMessage("Customer phone is required"),
  handleValidation,
];

const validateIdParam = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  handleValidation,
];

const validatePagination = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidation,
];

const validateJobCard = [
  body("vehicle").isMongoId().withMessage("Valid vehicle ID is required"),
  handleValidation,
];

const validateInvoice = [
  body("jobCard").isMongoId().withMessage("Valid job card ID is required"),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateRegistration,
  validateLogin,
  validateVehicle,
  validateJobCard,
  validateInvoice,
  validateIdParam,
  validatePagination,
};
