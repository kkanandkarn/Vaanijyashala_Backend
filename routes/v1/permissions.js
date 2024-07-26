const express = require("express");
const { dispatcher } = require("../../middleware");
const { viewPermissionsController } = require("../../controllers/v1");
const auth = require("../../middleware/auth");
const { PERMISSIONS } = require("../../utils/constant");

const router = express.Router();

router.get("/view-permissions", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    viewPermissionsController,
    PERMISSIONS.VIEW_PERMISISONS
  )
);

module.exports = router;
