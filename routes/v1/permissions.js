const express = require("express");
const { dispatcher } = require("../../middleware");
const { viewPermissionsController } = require("../../controllers/v1");

const router = express.Router();

router.get("/view-permissions", (req, res, next) =>
  dispatcher(req, res, next, viewPermissionsController)
);

module.exports = router;
