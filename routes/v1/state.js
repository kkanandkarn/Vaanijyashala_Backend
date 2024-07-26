const express = require("express");
const { dispatcher } = require("../../middleware");

const auth = require("../../middleware/auth");
const { PERMISSIONS } = require("../../utils/constant");
const {
  addStateController,
  viewStatesController,
  editStateController,
  deleteStateController,
  addDistrictController,
  editDistrictController,
  viewDistrictController,
  deleteDistrictController,
} = require("../../controllers/v1");

const router = express.Router();

router.post("/add-state", auth, (req, res, next) =>
  dispatcher(req, res, next, addStateController, PERMISSIONS.ADD_STATE)
);
router.get("/view-states", auth, (req, res, next) =>
  dispatcher(req, res, next, viewStatesController, PERMISSIONS.VIEW_STATE)
);
router.put("/edit-state", auth, (req, res, next) =>
  dispatcher(req, res, next, editStateController, PERMISSIONS.EDIT_STATE)
);
router.put("/delete-state", auth, (req, res, next) =>
  dispatcher(req, res, next, deleteStateController, PERMISSIONS.DELETE_STATE)
);
router.post("/add-district", auth, (req, res, next) =>
  dispatcher(req, res, next, addDistrictController, PERMISSIONS.ADD_DISTRICT)
);
router.put("/edit-district", auth, (req, res, next) =>
  dispatcher(req, res, next, editDistrictController, PERMISSIONS.EDIT_DISTRICT)
);
router.post("/view-districts", auth, (req, res, next) =>
  dispatcher(req, res, next, viewDistrictController, PERMISSIONS.VIEW_DISTRICT)
);
router.put("/delete-district", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    deleteDistrictController,
    PERMISSIONS.DELETE_DISTRICT
  )
);

module.exports = router;
