const { ErrorHandler } = require("../helper");
const { SERVER_ERROR, UNAUTHORIZED } = require("../helper/status-codes");
const { roles, globalPermissions } = require("../models");
const { FAILURE, SERVER_ERROR_MESSAGE } = require("./constant");

const matchPermission = async (req, role, perm) => {
  try {
    if (!req.user.isAuth) {
      throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
    }

    const fetchRole = await roles.findOne({ title: role, status: "Active" });

    if (!fetchRole) {
      throw new ErrorHandler(
        UNAUTHORIZED,
        "Role deleted. Kindly contact to administrator."
      );
    }

    const fetchPerm = await globalPermissions.findOne({ permissionName: perm });
    if (!fetchPerm) {
      throw new ErrorHandler(
        UNAUTHORIZED,
        "Permission deleted. Kindly contact to administrator."
      );
    }
    const permissionId = fetchPerm._id;

    if (fetchRole.permissions.includes(permissionId)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MESSAGE);
  }
};

module.exports = {
  matchPermission,
};
