const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  viewRolesController,
  addPermToRoleController,
  removePermFromRoleController,
  addRoleController,
  changeRoleStatusController,
  editRoleController,
  deleteRoleController,
} = require("../../controllers/v1");
const auth = require("../../middleware/auth");
const { PERMISSIONS } = require("../../utils/constant");
const router = express.Router();

router.post("/add-role", auth, (req, res, next) =>
  dispatcher(req, res, next, addRoleController, PERMISSIONS.ADD_ROLE)
);
router.get("/view-roles", auth, (req, res, next) =>
  dispatcher(req, res, next, viewRolesController, PERMISSIONS.VIEW_ROLE)
);
router.put("/edit-role", auth, (req, res, next) =>
  dispatcher(req, res, next, editRoleController, PERMISSIONS.EDIT_ROLE)
);
router.post("/delete-role", auth, (req, res, next) =>
  dispatcher(req, res, next, deleteRoleController, PERMISSIONS.DELETE_ROLE)
);
router.post("/add-perm", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    addPermToRoleController,
    PERMISSIONS.ASSIGN_PERMISSION_TO_ROLE
  )
);
router.post("/remove-perm", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    removePermFromRoleController,
    PERMISSIONS.ASSIGN_PERMISSION_TO_ROLE
  )
);
router.put("/status", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    changeRoleStatusController,
    PERMISSIONS.ASSIGN_PERMISSION_TO_ROLE
  )
);

module.exports = router;
