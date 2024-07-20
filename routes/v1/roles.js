const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  viewRolesController,
  addPermToRoleController,
  removePermFromRoleController,
  addRoleController,
  changeRoleStatusController,
} = require("../../controllers/v1");
const router = express.Router();

router.post("/add-role", (req, res, next) =>
  dispatcher(req, res, next, addRoleController)
);
router.get("/view-roles", (req, res, next) =>
  dispatcher(req, res, next, viewRolesController)
);
router.post("/add-perm", (req, res, next) =>
  dispatcher(req, res, next, addPermToRoleController)
);
router.post("/remove-perm", (req, res, next) =>
  dispatcher(req, res, next, removePermFromRoleController)
);
router.put("/status", (req, res, next) =>
  dispatcher(req, res, next, changeRoleStatusController)
);

module.exports = router;
