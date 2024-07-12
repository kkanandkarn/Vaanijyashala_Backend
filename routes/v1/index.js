const express = require("express");
const router = express.Router();
const otp = require("./otp");
const dropdown = require("./dropdown");
const auth = require("./auth");

router.use("/otp", otp);
router.use("/dropdown", dropdown);
router.use("/auth", auth);

router.use((req, res, next) => {
  const error = new Error("Invalid API. Make sure to call the correct API.");
  error.statusCode = 404;
  next(error);
});

module.exports = router;
