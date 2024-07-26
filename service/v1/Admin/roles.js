const { ErrorHandler } = require("../../../helper");
const {
  SERVER_ERROR,
  NOT_FOUND,
  BAD_GATEWAY,
  CONFLICT,
} = require("../../../helper/status-codes");
const { roles, userCredentials } = require("../../../models");
const { SERVER_ERROR_MESSAGE } = require("../../../utils/constant");
const mongoose = require("mongoose");
const { checkRequiredFields } = require("../../../utils/validations");

const addRole = async (req) => {
  try {
    const { title, alias, permissions = [] } = req.body;
    const userId = req.user.userId;
    const fieldToCheck = [
      { value: title, error: "Role name is required." },
      { value: alias, error: "Alias is required" },
    ];
    const validationError = checkRequiredFields(fieldToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }

    const checkRole = await roles.findOne({
      title: title,
      status: { $ne: "Deleted" },
    });
    if (checkRole) {
      throw new ErrorHandler(CONFLICT, "Role already exists.");
    }
    const checkAlias = await roles.findOne({
      alias: alias,
      status: { $ne: "Deleted" },
    });
    if (checkAlias) {
      throw new ErrorHandler(CONFLICT, "Duplicate alias.");
    }
    const newRole = new roles({
      title: title,
      alias: alias,
      permisisons: permissions,
      createdBy: userId,
      updatedBy: userId,
    });
    await newRole.save();

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
      .find({ status: { $ne: "Deleted" } })
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

const editRole = async (req) => {
  try {
    const { id, title } = req.body;
    const userId = req.user.userId;
    const filedsToCheck = [
      { value: id, error: "id is required" },
      { value: title, error: "Role name is required" },
    ];
    const validationError = checkRequiredFields(filedsToCheck);
    if (validationError) {
      throw new ErrorHandler(BAD_GATEWAY, validationError.error);
    }
    const role = await roles.findById(id);
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "Role not found");
    }

    await roles.findByIdAndUpdate(id, {
      title: title,
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return { message: "Role Updated" };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

const deleteRole = async (req) => {
  try {
    const { id } = req.body;
    const userId = req.user.userId;
    if (!id || id === "") {
      throw new ErrorHandler(BAD_GATEWAY, "id is required");
    }
    const role = await roles.findOne({
      _id: id,
      status: { $ne: "Deleted" },
    });
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "No role found");
    }
    const checkUser = await userCredentials.findOne({
      role: role._id,
      status: { $ne: "Deleted" },
    });
    if (checkUser) {
      throw new ErrorHandler(BAD_GATEWAY, "Cannot delete role having users.");
    }
    await roles.findByIdAndUpdate(id, {
      status: "Deleted",
      updatedBy: userId,
      updatedAt: new Date(),
    });
    return { message: "Role Deleted" };
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
    const userId = req.user.userId;
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
    role.updatedAt = new Date();
    role.updatedBy = userId;
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

const removePermFromRole = async (req) => {
  try {
    const { roleId, permissionsArray = [] } = req.body;
    const userId = req.user.userId;

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
    role.updatedAt = new Date();
    role.updatedBy = userId;

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
    const userId = req.user.userId;
    if (!roleId || roleId === "") {
      throw new ErrorHandler(BAD_GATEWAY, "Role id is required");
    }
    const role = await roles.findById(roleId);
    if (!role) {
      throw new ErrorHandler(NOT_FOUND, "Role not found");
    }
    const newStatus = role.status === "Active" ? "Inactive" : "Active";
    await roles.findByIdAndUpdate(roleId, {
      status: newStatus,
      updatedBy: userId,
      updatedAt: new Date(),
    });
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
  editRole,
  deleteRole,
};
