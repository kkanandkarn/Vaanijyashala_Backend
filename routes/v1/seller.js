const express = require("express");
const auth = require("../../middleware/auth");
const { dispatcher } = require("../../middleware");
const {
  sellerProfileController,
  addEmployeeController,
  addProductController,
  sellerViewProductsController,
  sellerViewProductByIdController,
  sellerViewEmployeesController,
  sellerEditEmployeeController,
  sellerViewEmployeeByIdController,
  sellerDeleteEmployeeController,
  sellerEditProductController,
  sellerDeleteProductController,
  sellerViewProfileController,
  sellerEditProfileController,
} = require("../../controllers/v1");
const { PERMISSIONS } = require("../../utils/constant");
const {
  sellerUpload,
  employeeUpload,
  productUpload,
} = require("../../middleware/file-uploads");
const router = express.Router();

router.post("/add-profile", auth, sellerUpload, (req, res, next) =>
  dispatcher(req, res, next, sellerProfileController, PERMISSIONS.ADD_PROFILE)
);
router.get("/view-profile", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerViewProfileController,
    PERMISSIONS.VIEW_PROFILE
  )
);
router.put("/edit-profile", auth, sellerUpload, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerEditProfileController,
    PERMISSIONS.EDIT_PROFILE
  )
);
router.post("/add-employee", auth, employeeUpload, (req, res, next) =>
  dispatcher(req, res, next, addEmployeeController, PERMISSIONS.ADD_EMPLOYEE)
);
router.get("/view-employees", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerViewEmployeesController,
    PERMISSIONS.VIEW_EMPLOYEE
  )
);
router.get("/view-employee/:id", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerViewEmployeeByIdController,
    PERMISSIONS.VIEW_EMPLOYEE
  )
);
router.put("/edit-employee", auth, employeeUpload, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerEditEmployeeController,
    PERMISSIONS.EDIT_EMPLOYEE
  )
);
router.put("/delete-employee", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerDeleteEmployeeController,
    PERMISSIONS.DELETE_EMPLOYEE
  )
);
router.post("/add-product", auth, productUpload, (req, res, next) =>
  dispatcher(req, res, next, addProductController, PERMISSIONS.ADD_PRODUCT)
);
router.post("/view-products", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerViewProductsController,
    PERMISSIONS.VIEW_PRODUCT
  )
);
router.get("/view-product/:id", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerViewProductByIdController,
    PERMISSIONS.VIEW_PRODUCT
  )
);
router.put("/edit-product/:id", auth, productUpload, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerEditProductController,
    PERMISSIONS.EDIT_PRODUCT
  )
);
router.put("/delete-product", auth, (req, res, next) =>
  dispatcher(
    req,
    res,
    next,
    sellerDeleteProductController,
    PERMISSIONS.DELETE_PRODUCT
  )
);

module.exports = router;
