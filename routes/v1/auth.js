const express = require("express");
const { dispatcher } = require("../../middleware");
const { registerController, loginController } = require("../../controllers/v1");
const router = express.Router();

router.post("/register", (req, res, next) =>
  dispatcher(req, res, next, registerController)
);
router.post("/login", (req, res, next) =>
  dispatcher(req, res, next, loginController)
);

module.exports = router;
