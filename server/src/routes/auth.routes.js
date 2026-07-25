const router = require("express").Router();
const { register, login, getMe, updateProfile, changePassword } = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");
const { validateRegistration, validateLogin } = require("../utils/validators");

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/me", auth, getMe);
router.put("/profile", auth, updateProfile);
router.put("/password", auth, changePassword);

module.exports = router;
