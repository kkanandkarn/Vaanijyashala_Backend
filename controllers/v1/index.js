const {
  generateOtpController,
  verifyOtpController,
  dropdwonCodeController,
  registerController,
  loginController,
  viewRolesController,
  addPermToRoleController,
  viewPermissionsController,
  removePermFromRoleController,
  getUserByTokenController,
  addRoleController,
  changeRoleStatusController,
  editRoleController,
  deleteRoleController,
  viewUsersController,
  createUserController,
  editUserController,
  deleteUserController,
  changeUserStatusController,
} = require("./Admin");
const { dropdownController } = require("./dropdown");
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
} = require("./Seller");
const {
  addStateController,
  viewStatesController,
  editStateController,
  deleteStateController,
  addDistrictController,
  editDistrictController,
  viewDistrictController,
  deleteDistrictController,
} = require("./State");

module.exports = {
  dropdownController,
  generateOtpController,
  verifyOtpController,
  dropdwonCodeController,
  registerController,
  loginController,
  viewRolesController,
  addPermToRoleController,
  viewPermissionsController,
  removePermFromRoleController,
  getUserByTokenController,
  addRoleController,
  changeRoleStatusController,
  editRoleController,
  deleteRoleController,
  viewUsersController,
  createUserController,
  editUserController,
  deleteUserController,
  changeUserStatusController,
  addStateController,
  viewStatesController,
  editStateController,
  deleteStateController,
  addDistrictController,
  editDistrictController,
  viewDistrictController,
  deleteDistrictController,
  sellerProfileController,
  addEmployeeController,
  addProductController,
  sellerViewProductsController,
  sellerViewProductByIdController,
  sellerEditProductController,
  sellerDeleteProductController,
  sellerViewEmployeesController,
  sellerViewEmployeeByIdController,
  sellerEditEmployeeController,
  sellerDeleteEmployeeController,
  sellerViewProfileController,
  sellerEditProfileController,
};
