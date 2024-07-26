const express = require("express");
const router = express.Router();
const otp = require("./otp");
const dropdown = require("./dropdown");
const auth = require("./auth");
const roles = require("./roles");
const permission = require("./permissions");
const user = require("./users");
const state = require("./state");

router.use("/otp", otp);
router.use("/dropdown", dropdown);
router.use("/auth", auth);
router.use("/role", roles);
router.use("/permission", permission);
router.use("/user", user);
router.use("/state", state);

router.use((req, res, next) => {
  const error = new Error("Invalid API. Make sure to call the correct API.");
  error.statusCode = 404;
  next(error);
});

module.exports = router;
