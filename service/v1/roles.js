const { ErrorHandler } = require("../../helper");
const {
  SERVER_ERROR,
  NOT_FOUND,
  BAD_GATEWAY,
  CONFLICT,
} = require("../../helper/status-codes");
const { roles } = require("../../models");
const { SERVER_ERROR_MESSAGE } = require("../../utils/constant");

const addRole = async (req) => {
  try {
    const { title, permissions = [] } = req.body;
    if (!title || title === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Role name is required.");
    }
    const checkRole = await roles.findOne({ title: title });
    if (checkRole) {
      throw new ErrorHandler(CONFLICT, "Role already exists.");
    }
    const newRole = new roles({
      title: title,
      permisisons: permissions,
    });
    await newRole.save();
    console.log("new role: ", newRole);
    return { message: "Role created successfully" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const viewRoles = async (req) => {
  try {
    const fetchRoles = await roles
      .find()
      .populate("permissions", "permissionName");

    return { roles: fetchRoles };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const addPermToRole = async (req) => {
  try {
    const { roleId, permissionsArray = [] } = req.body;
    if (!roleId || roleId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Role id is required.");
    }
    if (!permissionsArray.length) {
      throw new ErrorHandler(BAD_GATEWAY, "Permissions are required");
    }
    let role = await roles.findById(roleId);
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "No role found");
    }
    role.permissions.push(...permissionsArray);
    const updatedRole = await role.save();
    return { roles: updatedRole };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const mongoose = require("mongoose");

const removePermFromRole = async (req) => {
  try {
    const { roleId, permissionsArray = [] } = req.body;

    if (!roleId || roleId === "") {
      console.log("Role id is missing or empty.");
      throw new ErrorHandler(BAD_GATEWAY, "Role id is required.");
    }
    if (!permissionsArray.length) {
      console.log("Permissions array is empty.");
      throw new ErrorHandler(BAD_GATEWAY, "Permissions are required");
    }

    console.log(`Looking for role with id: ${roleId}`);
    let role = await roles.findById(roleId);
    if (!role) {
      console.log("No role found with the provided id.");
      throw new ErrorHandler(NOT_FOUND, "No role found");
    }

    // Convert permissionsArray to ObjectId if necessary
    const permissionsToRemove = permissionsArray.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Remove permissions
    role.permissions = role.permissions.filter(
      (permission) =>
        !permissionsToRemove.some((permToRemove) =>
          permToRemove.equals(permission)
        )
    );

    console.log(`Updated permissions: ${role.permissions}`);
    const updatedRole = await role.save();

    return { roles: updatedRole };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.error(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const changeRoleStatus = async (req) => {
  try {
    const { roleId } = req.body;
    if (!roleId || roleId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Role id is required");
    }
    const role = await roles.findById(roleId);
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "Role not found");
    }
    const newStatus = role.status === "Active" ? "Inactive" : "Active";
    await roles.findByIdAndUpdate(roleId, { status: newStatus });
    return { message: "Status Updated" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.error(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  addRole,
  viewRoles,
  addPermToRole,
  removePermFromRole,
  changeRoleStatus,
};
