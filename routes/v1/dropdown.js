const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  dropdwonCodeController,
  dropdownController,
} = require("../../controllers/v1");
const router = express.Router();

router.post("/dropdown-code", (req, res, next) =>
  dispatcher(req, res, next, dropdownController)
);

module.exports = router;
