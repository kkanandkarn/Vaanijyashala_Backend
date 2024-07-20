const { register, login, getUserByToken } = require("./auth");
const dropdownCode = require("./dropdown-code");
const { generateOtp, verifyOtp } = require("./otp");
const { viewPermissions } = require("./permissions");
const {
  viewRoles,
  addPermToRole,
  removePermFromRole,
  addRole,
  changeRoleStatus,
} = require("./roles");

module.exports = {
  addRole,
  generateOtp,
  verifyOtp,
  dropdownCode,
  register,
  login,
  viewRoles,
  addPermToRole,
  viewPermissions,
  removePermFromRole,
  getUserByToken,
  changeRoleStatus,
};
