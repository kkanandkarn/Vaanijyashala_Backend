const express = require("express");
const { dispatcher } = require("../../middleware");
const {
  viewUsersController,
  createUserController,
  editUserController,
  deleteUserController,
  changeUserStatusController,
} = require("../../controllers/v1/Admin");
const auth = require("../../middleware/auth");
const { PERMISSIONS } = require("../../utils/constant");

const router = express.Router();

router.post("/create-user", auth, (req, res, next) =>
  dispatcher(req, res, next, createUserController, PERMISSIONS.ADD_USER)
);
router.get("/view-users", auth, (req, res, next) =>
  dispatcher(req, res, next, viewUsersController, PERMISSIONS.VIEW_USER)
);
router.put("/edit-user", auth, (req, res, next) =>
  dispatcher(req, res, next, editUserController, PERMISSIONS.EDIT_USER)
);
router.put("/delete-user", auth, (req, res, next) =>
  dispatcher(req, res, next, deleteUserController, PERMISSIONS.DELETE_USER)
);
router.put("/status", auth, (req, res, next) =>
  dispatcher(req, res, next, changeUserStatusController, PERMISSIONS.EDIT_USER)
);

module.exports = router;
