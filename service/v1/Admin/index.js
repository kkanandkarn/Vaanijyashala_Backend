const { register, login, getUserByToken } = require("./auth");
const dropdownCode = require("./dropdown-code");

const { viewPermissions } = require("./permissions");
const {
  viewRoles,
  addPermToRole,
  removePermFromRole,
  addRole,
  changeRoleStatus,
  editRole,
  deleteRole,
} = require("./roles");
const {
  viewUsers,
  createUser,
  editUser,
  deleteUser,
  changeUserStatus,
} = require("./users");

module.exports = {
  addRole,

  dropdownCode,
  register,
  login,
  viewRoles,
  addPermToRole,
  viewPermissions,
  removePermFromRole,
  getUserByToken,
  changeRoleStatus,
  editRole,
  deleteRole,
  viewUsers,
  createUser,
  editUser,
  deleteUser,
  changeUserStatus,
};
