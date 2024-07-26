const {
  registerController,
  loginController,
  getUserByTokenController,
} = require("./auth");
const { dropdwonCodeController } = require("./dropdwon-code");
const { generateOtpController, verifyOtpController } = require("./otp");
const { viewPermissionsController } = require("./permissions");
const {
  viewRolesController,
  addPermToRoleController,
  removePermFromRoleController,
  addRoleController,
  changeRoleStatusController,
  editRoleController,
  deleteRoleController,
} = require("./roles");
const {
  viewUsersController,
  createUserController,
  editUserController,
  deleteUserController,
  changeUserStatusController,
} = require("./users");

module.exports = {
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
};
