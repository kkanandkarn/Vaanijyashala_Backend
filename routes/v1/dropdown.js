const express = require("express");
const { dispatcher } = require("../../middleware");
const { dropdwonCodeController } = require("../../controllers/v1");
const router = express.Router();

router.post("/dropdown-code", (req, res, next) =>
  dispatcher(req, res, next, dropdwonCodeController)
);

module.exports = router;
