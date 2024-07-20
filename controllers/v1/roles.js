const {
  viewRoles,
  addPermToRole,
  removePermFromRole,
  addRole,
  changeRoleStatus,
} = require("../../service/v1");

const addRoleController = async (req, res, next) => {
  try {
    const response = await addRole(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const viewRolesController = async (req, res, next) => {
  try {
    const response = await viewRoles(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const addPermToRoleController = async (req, res, next) => {
  try {
    const response = await addPermToRole(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const removePermFromRoleController = async (req, res, next) => {
  try {
    const response = await removePermFromRole(req);
    return response;
  } catch (error) {
    next(error);
  }
};
const changeRoleStatusController = async (req, res, next) => {
  try {
    const response = await changeRoleStatus(req);
    return response;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addRoleController,
  viewRolesController,
  addPermToRoleController,
  removePermFromRoleController,
  changeRoleStatusController,
};
