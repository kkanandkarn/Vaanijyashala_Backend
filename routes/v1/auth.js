const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  registerController,
  loginController,
  getUserByTokenController,
} = require("../../controllers/v1");
const auth = require("../../middleware/auth");
const router = express.Router();

router.post("/register", (req, res, next) =>
  dispatcher(req, res, next, registerController)
);
router.post("/login", (req, res, next) =>
  dispatcher(req, res, next, loginController)
);
router.get("/get-user", auth, (req, res, next) =>
  dispatcher(req, res, next, getUserByTokenController)
);

module.exports = router;
